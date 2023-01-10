const EventsHaNode = require('../EventsHaNode');

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
            this.onTimer();
            this.onIntervalUpdate();
        } else {
            this.addEventClientListener(
                'ha_client:initial_connection_ready',
                this.onTimer.bind(this)
            );
            this.addEventClientListener(
                'ha_client:ready',
                this.onIntervalUpdate.bind(this)
            );
        }
    }

    onClose(removed) {
        super.onClose(removed);
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    onTimer(triggered = false) {
        if (!this.isHomeAssistantRunning || this.isEnabled === false) {
            return;
        }

        this.send([{ test: true }]);

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

    onIntervalUpdate() {
        clearInterval(this.timer);
        // As per the Home Assistant native calendar trigger, only fire every 15 minutes.
        this.timer = setInterval(this.onTimer.bind(this), 900000);
    }
}

module.exports = EventsCalendar;
