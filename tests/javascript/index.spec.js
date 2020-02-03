const {
    DataPlanService,
} = require('../../dist/mparticle-data-planning.common');

const nock = require('nock');

let dataPlanService;

beforeEach(() => {
    nock('https://sso.auth.mparticle.com')
        .post('/oauth/token')
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

describe('JS Imports', () => {
    describe('DataPlanService', () => {
        describe('fetching', () => {
            beforeEach(() => {
                dataPlanService = new DataPlanService({
                    orgId: 1111,
                    accountId: 2222,
                    workspaceId: 3333,
                    clientId: 'client_id',
                    clientSecret: 'client_secret',
                });
            });
            describe('#getAllPlans', () => {
                it('should return an array of data plans', async done => {
                    nock('https://api.mparticle.com')
                        .get(`/planning/v1/1111/2222/3333/plans/`)
                        .reply(200, [{ data_plan_versions: [] }]);

                    expect(await dataPlanService.getAllPlans()).toEqual([
                        {
                            data_plan_versions: [],
                        },
                    ]);
                    done();
                });
            });

            describe('#getPlan', () => {
                it('should return a data plan', async done => {
                    nock('https://api.mparticle.com')
                        .get(`/planning/v1/1111/2222/3333/plans/my-slug`)
                        .reply(200, { data_plan_versions: [] });

                    expect(await dataPlanService.getPlan('my-slug')).toEqual({
                        data_plan_versions: [],
                    });
                    done();
                });
            });

            describe('#getVersionDocument', () => {
                it('should return a version document', async done => {
                    nock('https://api.mparticle.com')
                        .get(
                            `/planning/v1/1111/2222/3333/plans/my-slug/versions/2`
                        )
                        .reply(200, {
                            version: 2,
                            data_plan_id: 'my-slug',
                            version_document: {},
                        });

                    expect(
                        await dataPlanService.getVersionDocument('my-slug', 2)
                    ).toEqual({
                        version: 2,
                        data_plan_id: 'my-slug',
                        version_document: {},
                    });

                    done();
                });
            });
        });

        describe('#validate', () => {
            it('returns an empty validation result for a valid batch', () => {
                const dataPlanService = new DataPlanService();
                const event = {
                    event_type: 'screen_view',
                    data: {
                        custom_flags: {
                            black_flag: 'rocks',
                        },
                    },
                };

                const eventDataPoint = {
                    match: {
                        type: 'screen_view',
                        criteria: {
                            screen_name: event.data.screen_name,
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
                };

                const userDataPoint = {
                    match: {
                        type: 'user_attributes',
                    },
                    validator: {
                        type: 'json_schema',
                        definition: {
                            properties: {},
                        },
                    },
                };

                const document = {
                    data_points: [eventDataPoint, userDataPoint],
                };

                const batch = {
                    events: [event],
                    user_attributes: {
                        $Age: 42,
                    },
                };

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
                const dataPlanService = new DataPlanService();
                const event = {
                    event_type: 'screen_view',
                    data: {
                        screen_name: 'Test Screen View',
                    },
                };

                const eventDataPoint = {
                    match: {
                        type: 'screen_view',
                        criteria: {
                            screen_name: event.data.screen_name,
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
                };

                const userDataPoint = {
                    match: {
                        type: 'user_attributes',
                    },
                    validator: {
                        type: 'json_schema',
                        definition: {
                            properties: {},
                        },
                    },
                };

                const document = {
                    data_points: [eventDataPoint, userDataPoint],
                };

                const batch = {
                    events: [event],
                    user_attributes: {
                        $Age: 42,
                    },
                };

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
                                        validation_error_type:
                                            'missing_required',
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
});
