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
            this.setNextTimeout();
        } else {
            this.addEventClientListener(
                'ha_client:initial_connection_ready',
                this.setNextTimeout.bind(this)
            );
            this.addEventClientListener(
                'ha_client:ready',
                this.setNextTimeout.bind(this)
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

    async onTimer(triggered = false) {
        const now = new Date();

        this.setNextTimeout(now);

        if (!this.isHomeAssistantRunning || this.isEnabled === false) {
            return;
        }

        const startDate = this.getStartDate();
        const endDate = this.getEndDate();

        let items = null;
        try {
            items = await this.homeAssistant.get(
                `/calendars/${this.nodeConfig.entityId}`,
                {
                    start: startDate,
                    end: endDate,
                }
            );
        } catch (exc) {
            this.node.error(
                `calendar items could not be retrieved from entity_id "${this.nodeConfig.entityId}"`,
                {}
            );
            return;
        }

        this.send([{
            start: startDate,
            end: endDate,
            items,
        }]);

        // const pollState = this.homeAssistant.getStates(
        //     this.nodeConfig.entity_id
        // );
        // if (!pollState) {
        //     this.node.error(
        //         `could not find state with entity_id "${this.nodeConfig.entity_id}"`,
        //         {}
        //     );
        //     this.status.setText(
        //         `no state found for ${this.nodeConfig.entity_id}`
        //     );
        //     return;
        // }

        // const dateChanged = this.calculateTimeSinceChanged(pollState);
        // if (!dateChanged) {
        //     this.node.error(
        //         `could not calculate time since changed for entity_id "${this.nodeConfig.entity_id}"`,
        //         {}
        //     );
        //     return;
        // }
        // pollState.timeSinceChanged = ta.ago(dateChanged);
        // pollState.timeSinceChangedMs = Date.now() - dateChanged.getTime();

        // // Convert and save original state if needed
        // this.castState(pollState, this.nodeConfig.state_type);

        // const msg = {
        //     topic: this.nodeConfig.entity_id,
        //     payload: pollState.state,
        //     data: pollState,
        // };

        // let isIfState;
        // try {
        //     isIfState = this.getComparatorResult(
        //         this.nodeConfig.halt_if_compare,
        //         this.nodeConfig.halt_if,
        //         pollState.state,
        //         this.nodeConfig.halt_if_type,
        //         {
        //             entity: pollState,
        //         }
        //     );
        // } catch (e) {
        //     this.status.setFailed('Error');
        //     this.node.error(e.message, {});
        //     return;
        // }

        // const statusMessage = `${pollState.state}${
        //     triggered === true ? ` (triggered)` : ''
        // }`;

        // // Check 'if state' and send to correct output
        // if (this.nodeConfig.halt_if && !isIfState) {
        //     this.status.setFailed(statusMessage);
        //     this.send([null, msg]);
        //     return;
        // }

        // this.status.setSuccess(statusMessage);
        // this.send([msg, null]);
    }

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
                this.RED._('ha-events-calendar.errors.update_interval_nan', { interval })
            );
            throw new Error(this.RED._('events-calendar.status.error'));
        }

        return Number(intervalMs);
    }

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

    getStartDate(now) {
        if (!now) {
            now = new Date();
        }

        const msOffset = this.getOffset();

        // use the modulus of the number of milliseconds from epoch (add a few ms prevent duplicate now triggers) to calculate the next time to trigger this timer
        const startDate = new Date(now);
        startDate.setMilliseconds(startDate.getMilliseconds() + msOffset);
        return startDate.toISOString();
    }

    getEndDate(now) {
        if (!now) {
            now = new Date();
        }

        const msOffset = this.getOffset();
        const msInterval = this.getInterval();

        // use the modulus of the number of milliseconds from epoch (add a few ms prevent duplicate now triggers) to calculate the next time to trigger this timer
        const endDate = new Date(now);
        endDate.setMilliseconds(
            endDate.getMilliseconds() + msOffset + msInterval
        );
        return endDate.toISOString();
    }

    getNextTimeoutInterval(now) {
        if (!now) {
            now = new Date();
        }

        const msInterval = this.getInterval();

        // use the modulus of the number of milliseconds from epoch (add a few ms prevent duplicate now triggers) to calculate the next time to trigger this timer
        const soon = new Date(now);
        soon.setMilliseconds(soon.getMilliseconds() + 5);
        const epoch = new Date(0, 0, 0, 0, 0, 0);
        const msFromEpoch = soon.getTime() - epoch.getTime();
        return msInterval - (msFromEpoch % msInterval);
    }

    setNextTimeout(now) {
        if (!now) {
            now = new Date();
        }

        const msToNextTrigger = this.getNextTimeoutInterval(now);

        clearTimeout(this.timer);
        this.timer = setTimeout(this.onTimer.bind(this), msToNextTrigger);
    }
}

module.exports = EventsCalendar;
