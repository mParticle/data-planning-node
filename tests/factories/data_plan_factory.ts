import { TestDataFactory } from './test_data_factory';
import faker from 'faker';
import {
    DataPlan,
    DataPlanVersion,
    DataPlanDocument,
    DataPlanPoint,
    DataPlanMatch,
    ActivatedEnvironment,
    DataPlanMatchType,
    DataPlanValidatorType,
} from '@mparticle/data-planning-models';

export const RandomDataPlanMatchFactory = new TestDataFactory<DataPlanMatch>(
    () => {
        const matches = [
            {
                type: DataPlanMatchType.CustomEvent,
            },
            {
                type: DataPlanMatchType.OptOut,
            },
            {
                type: DataPlanMatchType.SessionStart,
            },
            {
                type: DataPlanMatchType.SessionEnd,
            },
        ];
        return faker.random.arrayElement(matches);
    }
);

export const DataPlanMatchFactory = new TestDataFactory<DataPlanMatch>(() => {
    return {
        type: DataPlanMatchType.Unknown,
    };
});

export const RandomDataPlanPointFactory = new TestDataFactory<DataPlanPoint>(
    () => {
        return {
            description: faker.lorem.words(3),
            match: RandomDataPlanMatchFactory.getOne(),
            validator: {
                type: DataPlanValidatorType.JSONSchema,
                definition: {},
            },
        };
    }
);

export const DataPlanPointFactory = new TestDataFactory<DataPlanPoint>(() => {
    const match = DataPlanMatchFactory.getOne();

    return {
        description: faker.lorem.words(3),
        match,
        validator: {
            type: DataPlanValidatorType.JSONSchema,
            definition: {},
        },
    };
});

export const DataPlanDocumentFactory = new TestDataFactory<DataPlanDocument>(
    () => {
        return {
            data_points: [],
            settings: {},
        };
    }
);

export const DataPlanVersionFactory = new TestDataFactory<DataPlanVersion>(
    () => {
        return {
            created_on: faker.date.recent().toString(),
            created_by: faker.internet.exampleEmail(),

            last_modified_on: faker.date.recent().toString(),
            last_modified_by: faker.internet.exampleEmail(),

            version: faker.random.number(),
            version_description: faker.company.catchPhrase(),
            version_document: DataPlanDocumentFactory.getOne(),

            activated_on: faker.date.recent().toString(),
            activated_environment: faker.random.arrayElement([
                ActivatedEnvironment.Development,
                ActivatedEnvironment.Production,
            ]),
            activated: faker.random.boolean(),
        };
    }
);

export const DataPlanFactory = new TestDataFactory<DataPlan>(() => {
    return {
        created_on: faker.date.recent().toString(),
        created_by: faker.internet.exampleEmail(),

        last_modified_on: faker.date.recent().toString(),
        last_modified_by: faker.internet.exampleEmail(),

        data_plan_id: faker.system.fileName().toString(),
        data_plan_name: faker.company.bsNoun(),
        data_plan_description: faker.company.catchPhraseDescriptor(),

        data_plan_versions: [],
    };
});
