const EventsHaNode = require('../EventsHaNode');
const { getTimeInMilliseconds } = require('../../helpers/utils');
const { TYPEDINPUT_JSONATA } = require('../../const');

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

    /**
     * Search for all matching events that start or end in the current time range and trigger a timer for the next time range
     * @returns Promise
     */
    async onTimer() {
        if (this.isEnabled === false) {
            return;
        }

        const now = new Date();

        // use an epoch modulus with our check interval to calculate the start time of our current time range
        const currentStart = this.getCurrentStart(now);

        // from the start, also calculate the end of our time range
        const msInterval = this.getInterval();
        const currentEnd = new Date(currentStart);
        currentEnd.setMilliseconds(currentEnd.getMilliseconds() + msInterval);

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        // kick another timer off for the next time range
        this.timer = setTimeout(
            this.onTimer.bind(this),
            currentEnd.getTime() - now.getTime() + 2 // Add a teensy bit of time just to make sure we don't straddle boundaries
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

        // TODO: filter only events starting/ending in time range

        // TODO: filter items by criteria

        if (!(items.length > 0)) {
            this.status.setFailed('No matched events');
            return;
        }

        items.forEach(this.sendCalendarItem.bind(this));

        this.status.setSuccess(`Found ${items.length} matched event(s)`);
    }

    /**
     * Format a message using outputProperties for the specified Calendar Item and send it
     * @param {*} calendarItem The object representing a calendar event as defined by HA calendar API
     */
    sendCalendarItem(calendarItem) {
        const message = {};
        this.setCustomOutputs(this.nodeConfig.outputProperties, message, {
            calendarItem,
        });
        this.send(message);
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
