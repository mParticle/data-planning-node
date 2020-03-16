import { DataPlanService } from '../../src/index';
import { Batch } from '@mparticle/event-models';
import {
    DataPlanDocument,
    DataPlanMatchType,
    DataPlanVersion,
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

    dataPlanService = new DataPlanService({
        workspaceId: 3333,
        clientId: 'client_id',
        clientSecret: 'client_secret',
    });
});
afterEach(() => {
    nock.cleanAll();
});

describe('DataPlanService', () => {
    describe('Create', () => {
        describe('#createDataPlan', () => {
            it('should create a data plan', async done => {
                const sampleDataPlan = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test',
                };
                nock(config.apiRoot)
                    .post(
                        `/${config.dataPlanningPath}/3333/plans`,
                        sampleDataPlan
                    )
                    .reply(200, sampleDataPlan);

                expect(
                    await dataPlanService.createDataPlan(sampleDataPlan)
                ).toEqual(sampleDataPlan);

                done();
            });

            it('should handle HTTP Errors', async done => {
                const sampleDataPlan = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test',
                };
                nock(config.apiRoot)
                    .post(
                        `/${config.dataPlanningPath}/3333/plans`,
                        sampleDataPlan
                    )
                    .reply(400);

                await expect(
                    dataPlanService.createDataPlan(sampleDataPlan)
                ).rejects.toThrowError('Request failed with status code 400');

                done();
            });
        });

        describe('createDataPlanVersion', () => {
            it('should create a data plan version', async done => {
                const sampleDataPlanVersion = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test',
                    version: 2,
                };
                nock(config.apiRoot)
                    .post(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test/versions`,
                        sampleDataPlanVersion
                    )
                    .reply(200, sampleDataPlanVersion);

                expect(
                    await dataPlanService.createDataPlanVersion(
                        'test',
                        sampleDataPlanVersion
                    )
                ).toEqual(sampleDataPlanVersion);

                done();
            });

            it('should handle HTTP Errors', async done => {
                const sampleDataPlanVersion = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test',
                    version: 2,
                };
                nock(config.apiRoot)
                    .post(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test/versions`,
                        sampleDataPlanVersion
                    )
                    .reply(400);

                await expect(
                    dataPlanService.createDataPlanVersion(
                        'test',
                        sampleDataPlanVersion
                    )
                ).rejects.toThrowError('Request failed with status code 400');

                done();
            });
        });
    });

    describe('Read', () => {
        describe('#getDataPlans', () => {
            it('should return an array of data plans', async done => {
                nock(config.apiRoot)
                    .get(`/${config.dataPlanningPath}/3333/plans`)
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
                    .get(`/${config.dataPlanningPath}/3333/plans`)
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
                    .get(`/${config.dataPlanningPath}/3333/plans/test`)
                    .reply(200, { data_plan_versions: [] });

                expect(await dataPlanService.getDataPlan('test')).toEqual({
                    data_plan_versions: [],
                });

                done();
            });

            it('should handle 401 Errors', async done => {
                nock(config.apiRoot)
                    .get(`/${config.dataPlanningPath}/3333/plans/test`)
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
                        `/${config.dataPlanningPath}/3333/plans/test/versions/2`
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

    describe('Update', () => {
        describe('#updateDataPlan', () => {
            it('should update a data plan', async done => {
                const sampleDataPlan = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test',
                };

                const updatedDataPlan = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test Data Plan',
                    data_plan_description: 'This is a test',
                };
                nock(config.apiRoot)
                    .patch(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test`,
                        sampleDataPlan
                    )
                    .reply(200, updatedDataPlan);

                expect(
                    await dataPlanService.updateDataPlan('test', sampleDataPlan)
                ).toEqual(updatedDataPlan);

                done();
            });

            it('should handle HTTP Errors', async done => {
                const sampleDataPlan = {
                    data_plan_id: 'test',
                    data_plan_name: 'Test',
                };
                nock(config.apiRoot)
                    .patch(
                        `/${config.dataPlanningPath}/3333/plans/test`,
                        sampleDataPlan
                    )
                    .reply(400);

                await expect(
                    dataPlanService.updateDataPlan('test', sampleDataPlan)
                ).rejects.toThrowError('Request failed with status code 400');

                done();
            });
        });

        describe('#updateDataPlanVersion', () => {
            it('should update a data plan version', async done => {
                const updatedDataPlanVersion = {
                    version: 2,
                    data_plan_id: 'amazing_really_cool_plan',
                    version_description: 'updated data point',
                    version_document: {
                        data_points: [
                            {
                                description: 'Test Data Point',
                            },
                        ],
                    },
                };

                nock(config.apiRoot)
                    .patch(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/amazing_really_cool_plan/versions/2`,
                        updatedDataPlanVersion
                    )
                    .reply(200, updatedDataPlanVersion);

                expect(
                    await dataPlanService.updateDataPlanVersion(
                        'amazing_really_cool_plan',
                        2,
                        updatedDataPlanVersion
                    )
                ).toEqual(updatedDataPlanVersion);

                done();
            });

            it('should handle HTTP Errors', async done => {
                const sampleDataPlanVersion = {
                    version: 2,
                    data_plan_id: 'amazing_really_cool_plan',
                    version_document: {},
                };
                nock(config.apiRoot)
                    .patch(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test/versions/2`,
                        sampleDataPlanVersion
                    )
                    .reply(400);

                await expect(
                    dataPlanService.updateDataPlanVersion(
                        'test',
                        2,
                        sampleDataPlanVersion
                    )
                ).rejects.toThrowError('Request failed with status code 400');

                done();
            });
        });
    });

    describe('Delete', () => {
        describe('#deleteDataPlan', () => {
            it('should delete a data plan', async done => {
                nock(config.apiRoot)
                    .delete(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test`
                    )
                    .reply(200);

                expect(
                    await dataPlanService.deleteDataPlan('test')
                ).toBeTruthy();

                done();
            });

            it('should handle HTTP Errors', async done => {
                nock(config.apiRoot)
                    .delete(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test`
                    )
                    .reply(400);

                await expect(
                    dataPlanService.deleteDataPlan('test')
                ).rejects.toThrowError('Request failed with status code 400');

                done();
            });
        });

        describe('#deleteDataPlanVersion', () => {
            it('should delete a data plan version', async done => {
                nock(config.apiRoot)
                    .delete(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test/versions/3`
                    )
                    .reply(200);

                expect(
                    await dataPlanService.deleteDataPlanVersion('test', 3)
                ).toBeTruthy();

                done();
            });

            it('should handle HTTP Errors', async done => {
                nock(config.apiRoot)
                    .delete(
                        // tslint:disable-next-line: max-line-length
                        `/${config.dataPlanningPath}/3333/plans/test/versions/3`
                    )
                    .reply(400);

                await expect(
                    dataPlanService.deleteDataPlanVersion('test', 3)
                ).rejects.toThrowError('Request failed with status code 400');

                done();
            });
        });
    });

    describe('#validateEvent', () => {
        it('returns a validation results for an invalid event', async done => {
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

            const dataPlanVersion: DataPlanVersion = {
                version_document: document,
            };

            expect(
                await dataPlanService.validateEvent(event, dataPlanVersion)
            ).toEqual({
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
            done();
        });

        // tslint:disable-next-line: max-line-length
        it('should allow validation options for server side validation', async done => {
            const event = ScreenViewEventFactory.getOne({});

            const dataPlanVersion = {
                version_document: {
                    data_points: [],
                },
            };

            const expectedResults = {
                results: [],
                batch: {
                    events: [event],
                },
            };

            const mockResults = {
                document: dataPlanVersion.version_document,
                batch: {
                    events: [event],
                    mpid: '',
                    environment: 'unknown',
                },
            };

            const scope = nock(config.apiRoot)
                .post(
                    `/${config.dataPlanningPath}/3333/test`,
                    // tslint:disable-next-line: no-any
                    mockResults as any
                )
                .reply(200, expectedResults);

            expect(
                await dataPlanService.validateEvent(event, dataPlanVersion, {
                    serverMode: true,
                })
            ).toEqual(expectedResults);

            expect(
                scope.isDone(),
                'validateBatch never made a server request'
            ).toBeTruthy();

            done();
        });
    });

    describe('#validateBatch', () => {
        // tslint:disable-next-line: max-line-length
        it('returns an empty validation result for a valid batch', async done => {
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

            const dataPlanVersion: DataPlanVersion = {
                version_document: document,
            };

            const batch: Batch = BatchFactory.getOne({
                events: [event],
                user_attributes: {
                    $Age: 42,
                },
            });

            expect(
                await dataPlanService.validateBatch(batch, dataPlanVersion)
            ).toEqual({
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
            done();
        });
        it('returns validation results for an invalid batch', async done => {
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

            const dataPlanVersion: DataPlanVersion = {
                version_document: document,
            };

            const batch: Batch = BatchFactory.getOne({
                events: [event],
                user_attributes: {
                    $Age: 42,
                },
            });

            expect(
                await dataPlanService.validateBatch(batch, dataPlanVersion)
            ).toEqual({
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

            done();
        });

        // tslint:disable-next-line: max-line-length
        it('should allow validation options for server side validation', async done => {
            const dataPlanVersion = {
                version_document: {
                    data_points: [],
                },
            };

            const batch: Batch = BatchFactory.getOne();

            const mockResults = {
                document: {
                    data_points: [],
                },
                batch,
            };

            const expectedResults = {
                results: [],
                batch,
            };

            const scope = nock(config.apiRoot)
                .post(
                    `/${config.dataPlanningPath}/3333/test`,

                    // tslint:disable-next-line: no-any
                    mockResults as any
                )
                .reply(200, expectedResults);

            expect(
                await dataPlanService.validateBatch(batch, dataPlanVersion, {
                    serverMode: true,
                })
            ).toEqual(expectedResults);

            expect(
                scope.isDone(),
                'validateBatch never made a server request'
            ).toBeTruthy();

            done();
        });
    });
});
