import { EditorNodeDef, EditorRED } from 'node-red';

import { NodeType } from '../../const';
import { hassAutocomplete } from '../../editor/components/hassAutocomplete';
import {
    createOutputs as haCreateOutputs,
    getOutputs as haGetOutputs,
    validate as outputsValidate,
} from '../../editor/components/output-properties';
import * as exposeNode from '../../editor/exposenode';
import ha, { NodeCategory, NodeColor } from '../../editor/ha';
import * as haServer from '../../editor/haserver';
import {
    HassExposedConfig,
    HassNodeProperties,
    OutputProperty,
} from '../../editor/types';

declare const RED: EditorRED;

interface EventsCalendarEditorNodeProperties extends HassNodeProperties {
    server: string;
    haConfig: HassExposedConfig[];
    version: number;
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
}

const EventsCalendarEditor: EditorNodeDef<EventsCalendarEditorNodeProperties> =
    {
        category: NodeCategory.HomeAssistant,
        defaults: {
            server: { value: '', type: NodeType.Server, required: true },
            haConfig: {
                value: [
                    { property: 'name', value: '' },
                    { property: 'icon', value: '' },
                ],
            },
            version: { value: RED.settings.get('eventsCalendarVersion', 0) },
            entityId: { value: '', required: true },
            eventType: { value: 'start' },
            filter: { value: '' },
            filterType: { value: 'str' },
            offset: { value: '0' },
            offsetType: { value: 'num' },
            offsetUnits: { value: 'seconds' },
            updateInterval: { value: '15' },
            updateIntervalType: { value: 'num' },
            updateIntervalUnits: { value: 'minutes' },
            outputProperties: {
                value: [
                    {
                        property: 'payload',
                        propertyType: 'msg',
                        value: '',
                        valueType: 'calendarItem',
                    },
                ],
                validate: outputsValidate,
            },
        },
        inputs: 0,
        outputs: 1,
        color: NodeColor.HaBlue,
        icon: 'ha-events-calendar.svg',
        paletteLabel: 'events: calendar',
        label: function () {
            return this.name || `events: ${this.eventType || 'all'}`;
        },
        labelStyle: ha.labelStyle,
        oneditsave: function () {
            this.haConfig = exposeNode.getValues();
            this.outputProperties = haGetOutputs();
        },
        oneditprepare: function () {
            ha.setup(this);
            haServer.init(this, '#node-input-server');
            exposeNode.init(this);
            hassAutocomplete({
                root: '#node-input-entityId',
                options: { type: 'calendars' },
            });

            $('#node-input-filter').typedInput({
                types: ['str', 'jsonata'],
                typeField: '#node-input-filterType',
            });

            $('#node-input-offset').typedInput({
                types: ['num', 'jsonata'],
                typeField: '#node-input-offsetType',
            });

            $('#node-input-updateInterval').typedInput({
                types: ['num', 'jsonata'],
                typeField: '#node-input-updateIntervalType',
            });

            haCreateOutputs(this.outputProperties, {
                extraTypes: ['calendarItem'],
            });
        },
    };

export default EventsCalendarEditor;
