import { DataPlanService } from '../../src/index';
import { Batch } from '@mparticle/event-models';
import {
    DataPlanDocument,
    DataPlanMatchType,
} from '@mparticle/data-planning-models';
import { BatchFactory } from '../factories/batch_factory';
import { DataPlanPointFactory } from '../factories/data_plan_factory';
import { ScreenViewEventFactory } from '../factories/event_factory';
import nock from 'nock';
import { config } from '../../src/utils/config';

nock.disableNetConnect();

let dataPlanService: DataPlanService;
beforeEach(() => {
    nock(config.auth.apiRoot)
        .post(`/${config.auth.path}`)
        .reply(200, {
            access_token: 'DAS token',
            expires_in: 5,
            token_type: 'Bearer',
        });

    dataPlanService = new DataPlanService();
});
afterEach(() => {
    nock.cleanAll();
});

describe('DataPlanService', () => {
    describe('Fetching', () => {
        beforeEach(() => {
            dataPlanService = new DataPlanService({
                orgId: 1111,
                accountId: 2222,
                workspaceId: 3333,
                clientId: 'client_id',
                clientSecret: 'client_secret',
            });
        });
        describe('#getDataPlans', () => {
            it('should return an array of data plans', async done => {
                nock(config.apiRoot)
                    .get(`/${config.dataPlanningPath}/1111/2222/3333/plans/`)
                    .reply(200, [{ data_plan_versions: [] }]);

                expect(await dataPlanService.getDataPlans()).toEqual([
                    {
                        data_plan_versions: [],
                    },
                ]);
                done();
            });

            it('should handle 401 Errors', async done => {
                nock(config.apiRoot)
                    .get(`/${config.dataPlanningPath}/1111/2222/3333/plans/`)
                    .reply(401);

                await expect(
                    dataPlanService.getDataPlans()
                ).rejects.toThrowError('Request failed with status code 401');

                done();
            });
        });

        describe('#getDataPlan', () => {
            it('should return a data plan', async done => {
                nock(config.apiRoot)
                    .get(
                        `/${config.dataPlanningPath}/1111/2222/3333/plans/test`
                    )
                    .reply(200, { data_plan_versions: [] });

                expect(await dataPlanService.getDataPlan('test')).toEqual({
                    data_plan_versions: [],
                });

                done();
            });

            it('should handle 401 Errors', async done => {
                nock(config.apiRoot)
                    .get(
                        `/${config.dataPlanningPath}/1111/2222/3333/plans/test`
                    )
                    .reply(401);

                await expect(
                    dataPlanService.getDataPlan('test')
                ).rejects.toThrowError('Request failed with status code 401');

                done();
            });
        });

        describe('#getDataPlanVersion', () => {
            it('should return a version document', async done => {
                nock(config.apiRoot)
                    .get(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/1111/2222/3333/plans/test/versions/2`
                    )
                    .reply(200, {
                        version: 2,
                        data_plan_id: 'amazing_really_cool_plan',
                        version_document: {},
                    });

                expect(
                    await dataPlanService.getDataPlanVersion('test', 2)
                ).toEqual({
                    version: 2,
                    data_plan_id: 'amazing_really_cool_plan',
                    version_document: {},
                });

                done();
            });
        });
    });

    describe('#validateEvent', () => {
        it('returns a validation results for an invalid event', () => {
            const event = ScreenViewEventFactory.getOne({});

            const eventDataPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.ScreenView,
                    criteria: {
                        screen_name: event.data?.screen_name,
                    },
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                required: ['custom_flags'],
                            },
                        },
                    },
                },
            });

            const userDataPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.UserAttributes,
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {},
                    },
                },
            });

            const document: DataPlanDocument = {
                data_points: [eventDataPoint, userDataPoint],
            };

            expect(dataPlanService.validateEvent(event, document)).toEqual({
                results: [
                    {
                        data: {
                            match: {
                                type: 'screen_view',
                                criteria: {
                                    screen_name: 'Test Screen View',
                                },
                            },
                            validation_errors: [
                                {
                                    error_pointer: '#/data',
                                    key: 'data',
                                    expected: 'custom_flags',
                                    schema_keyword: 'required',
                                    validation_error_type: 'missing_required',
                                },
                            ],
                        },
                        event_type: 'validation_result',
                    },
                ],
            });
        });
    });

    describe('#validateBatch', () => {
        it('returns an empty validation result for a valid batch', () => {
            const event = ScreenViewEventFactory.getOne({
                data: {
                    custom_flags: {
                        black_flag: 'rocks',
                    },
                },
            });

            const eventDataPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.ScreenView,
                    criteria: {
                        screen_name: event.data?.screen_name,
                    },
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                required: ['custom_flags'],
                            },
                        },
                    },
                },
            });

            const userDataPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.UserAttributes,
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {},
                    },
                },
            });

            const document: DataPlanDocument = {
                data_points: [eventDataPoint, userDataPoint],
            };

            const batch: Batch = BatchFactory.getOne({
                events: [event],
                user_attributes: {
                    $Age: 42,
                },
            });

            expect(dataPlanService.validateBatch(batch, document)).toEqual({
                results: [],
                batch: {
                    events: [event],
                    environment: batch.environment,
                    mpid: batch.mpid,
                    user_attributes: {
                        $Age: 42,
                    },
                },
            });
        });
        it('returns validation results for an invalid batch', () => {
            const event = ScreenViewEventFactory.getOne({});

            const eventDataPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.ScreenView,
                    criteria: {
                        screen_name: event.data?.screen_name,
                    },
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                required: ['custom_flags'],
                            },
                        },
                    },
                },
            });

            const userDataPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.UserAttributes,
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {},
                    },
                },
            });

            const document: DataPlanDocument = {
                data_points: [eventDataPoint, userDataPoint],
            };

            const batch: Batch = BatchFactory.getOne({
                events: [event],
                user_attributes: {
                    $Age: 42,
                },
            });

            expect(dataPlanService.validateBatch(batch, document)).toEqual({
                results: [
                    {
                        data: {
                            match: {
                                type: 'screen_view',
                                criteria: {
                                    screen_name: 'Test Screen View',
                                },
                            },
                            validation_errors: [
                                {
                                    error_pointer: '#/data',
                                    key: 'data',
                                    expected: 'custom_flags',
                                    schema_keyword: 'required',
                                    validation_error_type: 'missing_required',
                                },
                            ],
                        },
                        event_type: 'validation_result',
                    },
                ],
                batch: {
                    events: [event],
                    environment: batch.environment,
                    mpid: batch.mpid,
                    user_attributes: {
                        $Age: 42,
                    },
                },
            });
        });
    });
});
