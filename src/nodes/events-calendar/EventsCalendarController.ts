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
    #schedulerTimeout: NodeJS.Timeout | null;

    constructor(params: EventsCalendarControllerConstructor) {
        super(params);
        this.#homeAssistant = params.homeAssistant;
        this.#transformState = params.transformState;
        this.#comparatorService = params.comparatorService;
        this.#schedulerTimeout = null;
    }

    onStartScheduler() {
        if (this.#schedulerTimeout) {
            return;
        }

        this.#schedulerTimeout = setTimeout(this.#runSchedule.bind(this), 0);
    }

    #runSchedule() {
        const now = new Date();

        const msInterval = this.#getIntervalMs();
    }

    #getIntervalMs() {
        let interval: string = this.node.config.updateInterval || '0';
        if (this.node.config.updateIntervalType === 'expr') {
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
    }
}
