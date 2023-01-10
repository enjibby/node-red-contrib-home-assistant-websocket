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
];
