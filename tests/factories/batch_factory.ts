import { TestDataFactory } from './test_data_factory';
import { Batch } from '@mparticle/event-models';
import faker from 'faker';

export const BatchFactory = new TestDataFactory<Batch>(() => {
    return {
        events: [],
        environment: faker.helpers.randomize(['development', 'production']),
        mpid: faker.helpers.replaceSymbolWithNumber('##############'),
        user_attributes: {
            $Age: '42',
        },
    };
});
