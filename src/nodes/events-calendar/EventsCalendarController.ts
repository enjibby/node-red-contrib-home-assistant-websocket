import OutputController, {
    OutputControllerOptions,
} from '../../common/controllers/OutputController';
import ComparatorService from '../../common/services/ComparatorService';
import TransformState from '../../common/TransformState';
import HomeAssistant from '../../homeAssistant/HomeAssistant';
import { EventsCalendarNode } from '.';

interface EventsCalendarControllerConstructor
    extends OutputControllerOptions<EventsCalendarNode> {
    homeAssistant: HomeAssistant;
    transformState: TransformState;
    comparatorService: ComparatorService;
}

export default class EventsCalendarController extends OutputController<EventsCalendarNode> {
    #homeAssistant: HomeAssistant;
    #transformState: TransformState;
    #comparatorService: ComparatorService;

    constructor(params: EventsCalendarControllerConstructor) {
        super(params);
        this.#homeAssistant = params.homeAssistant;
        this.#transformState = params.transformState;
        this.#comparatorService = params.comparatorService;
    }
}
