import { createControllerDependencies } from '../../common/controllers/helpers';
import Events from '../../common/events/Events';
import ComparatorService from '../../common/services/ComparatorService';
import State from '../../common/State';
import Status from '../../common/status/Status';
import TransformState from '../../common/TransformState';
import { RED } from '../../globals';
import { migrate } from '../../helpers/migrate';
import { getServerConfigNode } from '../../helpers/node';
import { getHomeAssistant } from '../../homeAssistant';
import {
    BaseNode,
    BaseNodeProperties,
    OutputProperty,
} from '../../types/nodes';
import EventsCalendarController from './EventsCalendarController.js';

export interface EventsCalendarNodeProperties extends BaseNodeProperties {
    entityId: string;
    eventType: 'start' | 'end';
    filter: string;
    filterType: 'str' | 'expr';
    offset: string;
    offsetType: 'num' | 'expr';
    offsetUnits: 'seconds' | 'minutes' | 'hours';
    updateInterval: string;
    updateIntervalType: 'num' | 'expr';
    updateIntervalUnits: 'seconds' | 'minutes' | 'hours';
    outputProperties: OutputProperty[];
    outputOnConnect: boolean;
}

export interface EventsCalendarNode extends BaseNode {
    config: EventsCalendarNodeProperties;
}

export default function eventsCalendarNode(
    this: EventsCalendarNode,
    config: EventsCalendarNodeProperties
) {
    RED.nodes.createNode(this, config);

    this.config = migrate(config);
    const serverConfigNode = getServerConfigNode(this.config.server);
    const homeAssistant = getHomeAssistant(serverConfigNode);
    const nodeEvents = new Events({ node: this, emitter: this });

    const state = new State(this);
    const status = new Status({
        config: serverConfigNode.config,
        node: this,
        nodeEvents,
        state,
    });
    const controllerDeps = createControllerDependencies(this, homeAssistant);
    const transformState = new TransformState(
        serverConfigNode.config.ha_boolean
    );
    const comparatorService = new ComparatorService({
        nodeRedContextService: controllerDeps.nodeRedContextService,
        homeAssistant,
        jsonataService: controllerDeps.jsonataService,
        transformState,
    });

    // eslint-disable-next-line no-new
    new EventsCalendarController({
        node: this,
        homeAssistant,
        status,
        transformState,
        comparatorService,
        ...controllerDeps,
    });
}
