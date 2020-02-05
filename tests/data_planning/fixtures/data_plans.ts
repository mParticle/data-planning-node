// tslint:disable: no-any
import faker from 'faker';

import {
    ActivatedEnvironment,
    DataPlanMatchType,
} from '@mparticle/data-planning-models';

// tslint:disable-next-line: no-any
const MatchCombos: { [key: string]: any } = {
    [DataPlanMatchType.Unknown]: {
        type: DataPlanMatchType.Unknown,
        criteria: null,
    },
    [DataPlanMatchType.SessionStart]: {
        type: DataPlanMatchType.SessionStart,
        criteria: null,
    },
    [DataPlanMatchType.SessionEnd]: {
        type: DataPlanMatchType.SessionEnd,
    },
    [DataPlanMatchType.ScreenView]: {
        type: DataPlanMatchType.ScreenView,
    },
    [DataPlanMatchType.CustomEvent]: {
        type: DataPlanMatchType.CustomEvent,
    },
    [DataPlanMatchType.CrashReport]: {
        type: DataPlanMatchType.CrashReport,
    },
    [DataPlanMatchType.OptOut]: {
        type: DataPlanMatchType.OptOut,
    },
    [DataPlanMatchType.FirstRun]: {
        type: DataPlanMatchType.FirstRun,
    },
    [DataPlanMatchType.ApplicationStateTransition]: {
        type: DataPlanMatchType.ApplicationStateTransition,
    },
    [DataPlanMatchType.NetworkPerformance]: {
        type: DataPlanMatchType.NetworkPerformance,
    },
    [DataPlanMatchType.Breadcrumb]: {
        type: DataPlanMatchType.Breadcrumb,
    },
    [DataPlanMatchType.UserAttributes]: {
        type: DataPlanMatchType.UserAttributes,
    },
    [DataPlanMatchType.UserIdentities]: {
        type: DataPlanMatchType.UserIdentities,
    },
    [DataPlanMatchType.Uninstall]: {
        type: DataPlanMatchType.Uninstall,
    },
    [DataPlanMatchType.ProductAction]: {
        type: DataPlanMatchType.ProductAction,
    },
    [DataPlanMatchType.PromotionAction]: {
        type: DataPlanMatchType.PromotionAction,
    },
    [DataPlanMatchType.ProductImpression]: {
        type: DataPlanMatchType.ProductImpression,
    },
};

const getFakeDataPoint = (): { [key: string]: any } => {
    const key = faker.random.arrayElement(Object.keys(MatchCombos));
    const type = MatchCombos[key].type;
    const criteria = MatchCombos[key].criteria;

    return {
        description: faker.lorem.sentence(),
        match: {
            type,
            criteria,
        },
    };
};

const getFakeDocument = (): { [key: string]: any } => {
    return {
        data_points: [
            getFakeDataPoint(),
            getFakeDataPoint(),
            getFakeDataPoint(),
        ],
    };
};

const getFakeFullVersion = (index = 1): { [key: string]: any } => {
    const name = faker.company.bs();
    return {
        data_plan_id: faker.helpers.slugify(name),
        data_plan_name: name,

        version: index,
        version_description: faker.company.catchPhrase(),
        version_document: getFakeDocument(),

        activated_environment: faker.random.arrayElement([
            ActivatedEnvironment.Development,
            ActivatedEnvironment.Production,
        ]),

        activated: faker.random.boolean(),
        activated_on: faker.date.recent(),

        created_on: faker.date.recent(),
        created_by: faker.internet.exampleEmail(),
        last_modified_on: faker.date.recent(),
        last_modified_by: faker.internet.exampleEmail(),
    };
};
export const fake_version_list: Array<{ [key: string]: any }> = (() =>
    [...new Array(5)].map((version, index) => {
        const name = faker.company.bs();
        return {
            data_plan_id: faker.helpers.slugify(name),
            data_plan_name: name,

            version: index,
            version_description: faker.company.catchPhrase(),
            version_document: null,

            activated: faker.random.boolean(),
            activated_environment: faker.random.arrayElement([
                ActivatedEnvironment.Development,
                ActivatedEnvironment.Production,
            ]),
            activated_on: faker.date.recent(),

            created_on: faker.date.recent(),
            created_by: faker.internet.exampleEmail(),
            last_modified_on: faker.date.recent(),
            last_modified_by: faker.internet.exampleEmail(),
        };
    }))();
export const fake_plans: Array<{ [key: string]: any }> = (() =>
    [...new Array(5)].map(() => {
        const name = faker.company.bs();
        return {
            data_plan_id: faker.helpers.slugify(name),
            data_plan_name: name,
            data_plan_description: faker.company.catchPhrase(),
            data_plan_versions: fake_version_list,

            created_on: faker.date.recent(),
            created_by: faker.internet.exampleEmail(),
            last_modified_on: faker.date.recent(),
            last_modified_by: faker.internet.exampleEmail(),
        };
    }))();

export const fake_data_plan: { [key: string]: any } = (() => {
    const name = faker.company.bs();
    return {
        data_plan_id: faker.helpers.slugify(name),
        data_plan_name: name,
        data_plan_description: faker.company.catchPhrase(),

        data_plan_versions: [
            getFakeFullVersion(1),
            getFakeFullVersion(2),
            getFakeFullVersion(3),
        ],

        created_on: faker.date.recent(),
        created_by: faker.internet.exampleEmail(),
        last_modified_on: faker.date.recent(),
        last_modified_by: faker.internet.exampleEmail(),
    };
})();

export * from './sample_data_plan';
export * from './sample_data_plans';
