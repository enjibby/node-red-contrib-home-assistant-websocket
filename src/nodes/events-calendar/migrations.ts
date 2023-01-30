export default [
    {
        version: 0,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 0,
                entityId: '',
                eventType: 'start',
                filter: '',
                filterType: 'str',
                offset: '0',
                offsetType: 'num',
                offsetUnits: 'seconds',
                outputProperties: [],
            };
            return newSchema;
        },
    },
    {
        version: 1,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 1,
                updateInterval: '15',
                updateIntervalType: 'num',
                updateIntervalUnits: 'minutes',
            };

            return newSchema;
        },
    },
    {
        version: 2,
        up: (schema: any) => {
            const newSchema = {
                ...schema,
                version: 2,
                outputOnConnect: false,
            };

            return newSchema;
        },
    },
];
