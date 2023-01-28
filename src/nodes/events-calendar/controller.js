const EventsHaNode = require('../EventsHaNode');
const { getTimeInMilliseconds } = require('../../helpers/utils');
const { TYPEDINPUT_JSONATA } = require('../../const');
const axios = require('axios');

const nodeOptions = {
    config: {
        server: {},
        haConfig: {},
        version: {},
        entityId: {},
        eventType: {},
        filter: {},
        filterType: {},
        offset: {},
        offsetType: {},
        offsetUnits: {},
        updateInterval: {},
        updateIntervalType: {},
        updateIntervalUnits: {},
        outputProperties: {},
    },
};

class EventsCalendar extends EventsHaNode {
    constructor({ node, config, RED, status }) {
        super({ node, config, RED, status, nodeOptions });

        if (!this.nodeConfig.entityId) {
            throw new Error('Entity Id is required');
        }

        if (this.isHomeAssistantRunning) {
            this.onStartTimeout();
        } else {
            this.addEventClientListener(
                'ha_client:initial_connection_ready',
                this.onStartTimeout.bind(this)
            );
            this.addEventClientListener(
                'ha_client:ready',
                this.onStartTimeout.bind(this)
            );
        }
    }

    onClose(removed) {
        super.onClose(removed);
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    async onTimer() {
        if (this.isEnabled === false) {
            return;
        }

        const now = new Date();

        const currentStart = this.getCurrentStart(now);

        const msInterval = this.getInterval();
        const currentEnd = new Date(currentStart);
        currentEnd.setMilliseconds(currentEnd.getMilliseconds() + msInterval);

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.timer = setTimeout(
            this.onTimer.bind(this),
            currentEnd.getTime() - now.getTime() + 2
        );

        if (!this.isHomeAssistantRunning) {
            return;
        }

        const msOffset = this.getOffset();
        const offsetStart = new Date(currentStart);
        offsetStart.setMilliseconds(offsetStart.getMilliseconds() + msOffset);

        const offsetEnd = new Date(offsetStart);
        offsetEnd.setMilliseconds(offsetEnd.getMilliseconds() + msInterval);

        let items = null;
        try {
            items = await this.homeAssistant.get(
                `/calendars/${this.nodeConfig.entityId}`,
                {
                    start: offsetStart.toISOString(),
                    end: offsetEnd.toISOString(),
                }
            );
        } catch (exc) {
            this.node.error(
                `calendar items could not be retrieved from entity_id "${this.nodeConfig.entityId}"`,
                {}
            );
            return;
        }

        // TODO: filter items by criteria

        if (!(items.length > 0)) {
            this.status.setFailed('No items');
            return;
        }

        // TODO: build a message for each found item
        this.send([
            {
                start: offsetStart.toISOString(),
                end: offsetEnd.toISOString(),
                items,
            },
        ]);

        this.status.setSuccess(`Sent ${items.length} item triggers`);
    }

    /**
     * Read the node config to calculate the number of milliseconds for each interval
     * @returns Number
     */
    getInterval() {
        let interval = this.nodeConfig.updateInterval || '0';
        if (this.nodeConfig.updateIntervalType === TYPEDINPUT_JSONATA) {
            try {
                interval = this.evaluateJSONata(interval);
            } catch (e) {
                this.node.error(
                    this.RED._('events-calendar.errors.jsonata_error', {
                        message: e.message,
                    })
                );
                throw new Error('error');
            }
        }

        const intervalMs = getTimeInMilliseconds(
            interval,
            this.nodeConfig.updateIntervalUnits
        );
        if (isNaN(intervalMs)) {
            this.node.error(
                this.RED._('ha-events-calendar.errors.update_interval_nan', {
                    interval,
                })
            );
            throw new Error(this.RED._('events-calendar.status.error'));
        }

        return Number(intervalMs);
    }

    /**
     * Read the node config to calculate the number of milliseconds offset
     * @returns Number
     */
    getOffset() {
        let offset = this.nodeConfig.offset || '0';
        if (this.nodeConfig.offsetType === TYPEDINPUT_JSONATA) {
            try {
                offset = this.evaluateJSONata(offset);
            } catch (e) {
                this.node.error(
                    this.RED._('events-calendar.errors.jsonata_error', {
                        message: e.message,
                    })
                );
                throw new Error('error');
            }
        }

        const offsetMs = getTimeInMilliseconds(
            offset,
            this.nodeConfig.offsetUnits
        );
        if (isNaN(offsetMs)) {
            this.node.error(
                this.RED._('events-calendar.errors.offset_nan', { offset })
            );
            throw new Error(this.RED._('events-calendar.status.error'));
        }

        return Number(offsetMs);
    }

    /**
     * Get the datetime of the most recent interval time in the past
     * @param {Date} now
     * @returns Date
     */
    getCurrentStart(now) {
        const epoch = new Date(0, 0, 0, 0, 0, 0);
        const msFromEpoch = now.getTime() - epoch.getTime();
        const msInterval = this.getInterval();
        const start = new Date(now);
        start.setTime(start.getTime() - (msFromEpoch % msInterval));

        return start;
    }

    /**
     * Calculate the number of milliseconds until the next timer should be fired
     * @param {Date} now
     * @returns Number
     */
    getNextTimeoutInterval(now) {
        const msInterval = this.getInterval();

        // use the modulus of the number of milliseconds from epoch (add a few ms prevent duplicate now triggers) to calculate the next time to trigger this timer
        const soon = new Date(now);
        const epoch = new Date(0, 0, 0, 0, 0, 0);
        const msFromEpoch = Number(soon.getTime() - epoch.getTime());
        return Number(msInterval - (msFromEpoch % msInterval));
    }

    /**
     * Initiate the first fire of the timer at the start of the next interval
     */
    onStartTimeout() {
        const now = new Date();
        const msToNextTrigger = this.getNextTimeoutInterval(now);

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.timer = setTimeout(this.onTimer.bind(this), msToNextTrigger);
    }
}

module.exports = EventsCalendar;
