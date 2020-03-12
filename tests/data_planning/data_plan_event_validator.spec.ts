// tslint:disable: max-line-length
import {
    SessionStartEvent,
    SessionEndEvent,
    ScreenViewEvent,
    CrashReportEvent,
    OptOutEvent,
    NetworkPerformanceEvent,
    BreadcrumbEvent,
    ApplicationStateTransitionEvent,
    CommerceEvent,
    BaseEvent,
    CustomEvent,
    EventTypeEnum,
    CustomEventDataCustomEventTypeEnum,
    ApplicationStateTransitionEventDataApplicationTransitionTypeEnum,
    PromotionActionActionEnum,
    ProductActionActionEnum,
} from '@mparticle/event-models';
import {
    DataPlanMatchType,
    EventType,
    DataPlanValidatorType,
    DataPlanValidator,
    DataPlanVersion,
    DataPlanPoint,
    ScreenViewEventCriteria,
} from '@mparticle/data-planning-models';
import { DataPlanEventValidator } from '../../src/index';
import {
    EventFactory,
    ScreenViewEventFactory,
    CustomEventFactory,
} from '../factories/event_factory';
import { BatchFactory } from '../factories/batch_factory';
import {
    DataPlanPointFactory,
    DataPlanMatchFactory,
} from '../factories/data_plan_factory';

describe('DataPlanEventValidator', () => {
    let eventValidator: DataPlanEventValidator;
    let dataPlanVersion: DataPlanVersion;
    let screenViewDataPoint: DataPlanPoint;
    let plannedDataPoint: DataPlanPoint;
    let userAttributeDataPoint: DataPlanPoint;

    beforeEach(() => {
        dataPlanVersion = {};
        dataPlanVersion.version_document = {};
        dataPlanVersion.version_document.data_points = [];

        screenViewDataPoint = {
            description: 'A Random Screenview',
            match: {
                type: DataPlanMatchType.ScreenView,
            },
        };

        const criteria: ScreenViewEventCriteria = {
            screen_name: 'A valid Screen View',
        };

        const validator: DataPlanValidator = {
            type: DataPlanValidatorType.JSONSchema,
            definition: {
                properties: {
                    data: {
                        additionalProperties: false,
                        properties: {
                            screen_name: {
                                const: 'A valid Screen View',
                            },
                            activity_type: {
                                type: 'string',
                            },
                        },
                        required: ['screen_name', 'activity_type'],
                    },
                },
            },
        };

        screenViewDataPoint.match = {
            type: DataPlanMatchType.ScreenView,
        };
        screenViewDataPoint.match.criteria = criteria;
        screenViewDataPoint.validator = validator;

        plannedDataPoint = DataPlanPointFactory.getOne({
            match: {
                type: DataPlanMatchType.CustomEvent,
                criteria: {
                    custom_event_type: 'other',
                    event_name: 'Planned Event',
                },
            },
        });

        userAttributeDataPoint = {
            match: {
                type: DataPlanMatchType.UserAttributes,
            },
            validator: {
                type: DataPlanValidatorType.JSONSchema,
                definition: {
                    properties: {},
                },
            },
        };

        eventValidator = new DataPlanEventValidator(
            dataPlanVersion.version_document
        );
    });
    describe('#addToMatchLookups', () => {
        it('should add to dataPlanMatchLookups', () => {
            const dataPlanPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.CustomEvent,
                    criteria: {
                        event_name: 'This is a test',
                        custom_event_type: EventType.Location,
                        match_key: 'custom_event:location:This is a test',
                    },
                },
                validator: {
                    definition: {
                        properties: {
                            data: {
                                additionalProperties: false,
                                properties: {
                                    event_name: {
                                        const: 'This is a test',
                                    },
                                    custom_event_type: {
                                        const: 'location',
                                    },
                                },
                                required: ['custom_event_type', 'event_name'],
                            },
                        },
                    },
                },
            });

            const userAttributePoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.UserAttributes,
                },
                validator: {
                    definition: {
                        properties: {
                            $Age: {
                                const: 'number',
                            },
                        },
                    },
                },
            });

            expect(eventValidator.dataPlanMatchLookups).toEqual({});

            eventValidator.addToMatchLookups(dataPlanPoint);
            eventValidator.addToMatchLookups(userAttributePoint);

            expect(eventValidator.dataPlanMatchLookups).toEqual({
                'custom_event:location:This is a test': {
                    match: {
                        type: 'custom_event',
                        criteria: {
                            custom_event_type: 'location',
                            event_name: 'This is a test',
                            match_key: 'custom_event:location:This is a test',
                        },
                    },
                    schema: {
                        properties: {
                            data: {
                                additionalProperties: false,
                                properties: {
                                    custom_event_type: {
                                        const: 'location',
                                    },
                                    event_name: {
                                        const: 'This is a test',
                                    },
                                },
                                required: ['custom_event_type', 'event_name'],
                            },
                        },
                    },
                },
                user_attributes: {
                    match: {
                        type: 'user_attributes',
                    },
                    schema: {
                        properties: {
                            $Age: {
                                const: 'number',
                            },
                        },
                    },
                },
            });
        });
    });

    describe('#synthesizeMatch', () => {
        it('returns session start matches', () => {
            const event: SessionStartEvent = {
                event_type: EventTypeEnum.sessionStart,
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'session_start',
            });
        });
        it('returns session end matches', () => {
            const event: SessionEndEvent = {
                event_type: EventTypeEnum.sessionEnd,
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'session_end',
            });
        });
        it('returns screen view event matches', () => {
            const event: ScreenViewEvent = {
                event_type: EventTypeEnum.screenView,
                data: {
                    screen_name: 'My Screen',
                },
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'screen_view',
                criteria: {
                    screen_name: 'My Screen',
                },
            });
        });
        it('returns custom event matches', () => {
            const event: CustomEvent = {
                event_type: EventTypeEnum.customEvent,
                data: {
                    event_name: 'My Custom Event',
                    custom_event_type: CustomEventDataCustomEventTypeEnum.other,
                    custom_flags: {
                        secret: 'This is a secret',
                    },
                },
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'custom_event',
                criteria: {
                    event_name: 'My Custom Event',
                    custom_event_type: 'other',
                },
            });
        });

        it('returns crash report matches', () => {
            const event: CrashReportEvent = {
                event_type: EventTypeEnum.crashReport,
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'crash_report',
            });
        });

        it('returns opt out matches', () => {
            const event: OptOutEvent = {
                event_type: EventTypeEnum.optOut,
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'opt_out',
            });
        });

        // TODO: Why is this not defined in event-models?
        // it('returns first run matches', () => {
        //     const event: FirstRunEvent = {
        //         event_type: 'first_run',
        //     };
        //     expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
        //         type: 'first_run',
        //     });
        // });

        it('returns network performance matches', () => {
            const event: NetworkPerformanceEvent = {
                event_type: EventTypeEnum.networkPerformance,
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'network_performance',
            });
        });

        it('returns breadcrumb matches', () => {
            const event: BreadcrumbEvent = {
                event_type: EventTypeEnum.breadcrumb,
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'breadcrumb',
            });
        });

        // TODO: this is not available in event-models
        // it('returns uninstall matches', () => {
        //     const event: UninstallEvent = {
        //         event_type: 'uninstall',
        //     };
        //     expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
        //         type: 'uninstall',
        //     });
        // });

        it('returns app state transition event matches', () => {
            const event: ApplicationStateTransitionEvent = {
                event_type: EventTypeEnum.applicationStateTransition,
                data: {
                    application_transition_type:
                        ApplicationStateTransitionEventDataApplicationTransitionTypeEnum.applicationForeground,
                    is_first_run: false,
                    is_upgrade: false,
                },
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'application_state_transition',
                criteria: {
                    application_transition_type: 'application_foreground',
                },
            });
        });

        it('returns product action matches', () => {
            const event: CommerceEvent = {
                event_type: EventTypeEnum.commerceEvent,
                data: {
                    product_action: {
                        action: ProductActionActionEnum.addToCart,
                    },
                },
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'product_action',
                criteria: {
                    action: 'add_to_cart',
                },
            });
        });

        it('returns promotion action matches', () => {
            const event: CommerceEvent = {
                event_type: EventTypeEnum.commerceEvent,
                data: {
                    promotion_action: {
                        action: PromotionActionActionEnum.click,
                        promotions: [
                            {
                                id: '74633',
                                name: 'My Awesome Promotion',
                                creative: 'banner ad',
                                position: 'above-the-fold',
                            },
                        ],
                    },
                },
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'promotion_action',
                criteria: {
                    action: 'click',
                },
            });
        });

        it('returns product impression matches', () => {
            const event: CommerceEvent = {
                event_type: EventTypeEnum.commerceEvent,
                data: {
                    product_impressions: [
                        {
                            products: [
                                {
                                    id: '12345',
                                    name: 'Some Product',
                                },
                            ],
                        },
                    ],
                },
            };
            expect(DataPlanEventValidator.synthesizeMatch(event)).toEqual({
                type: 'product_impression',
            });
        });

        it('returns unknown for unknown events', () => {
            const event = {
                event_type: 'unknown',
            };
            expect(
                DataPlanEventValidator.synthesizeMatch(event as BaseEvent)
            ).toEqual({
                type: 'unknown',
            });
        });
    });

    describe('#generateMatchKey', () => {
        it('returns a match key string from a breadcrumb match object', () => {
            const breadcrumb = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.Breadcrumb,
            });
            expect(DataPlanEventValidator.generateMatchKey(breadcrumb)).toBe(
                'breadcrumb'
            );
        });

        it('returns a match key string from a crash report match object', () => {
            const crashReport = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.CrashReport,
            });
            expect(DataPlanEventValidator.generateMatchKey(crashReport)).toBe(
                'crash_report'
            );
        });

        it('returns a match key string from a first run match object', () => {
            const firstRun = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.FirstRun,
            });
            expect(DataPlanEventValidator.generateMatchKey(firstRun)).toBe(
                'first_run'
            );
        });

        it('returns a match key string from a network performance match object', () => {
            const networkPerformance = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.NetworkPerformance,
            });
            expect(
                DataPlanEventValidator.generateMatchKey(networkPerformance)
            ).toBe('network_performance');
        });

        it('returns a match key string from a opt out match object', () => {
            const optOut = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.OptOut,
            });
            expect(DataPlanEventValidator.generateMatchKey(optOut)).toBe(
                'opt_out'
            );
        });

        it('returns a match key string from a session start match object', () => {
            const sessionStart = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.SessionStart,
            });
            expect(DataPlanEventValidator.generateMatchKey(sessionStart)).toBe(
                'session_start'
            );
        });

        it('returns a match key string from a session end match object', () => {
            const sessionEnd = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.SessionEnd,
            });
            expect(DataPlanEventValidator.generateMatchKey(sessionEnd)).toBe(
                'session_end'
            );
        });

        it('returns a match key string from a uninstall match object', () => {
            const uninstall = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.Uninstall,
            });
            expect(DataPlanEventValidator.generateMatchKey(uninstall)).toBe(
                'uninstall'
            );
        });

        it('returns a match key string from a User Attribute match object', () => {
            const userAttributes = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.UserAttributes,
            });
            expect(
                DataPlanEventValidator.generateMatchKey(userAttributes)
            ).toBe('user_attributes');
        });

        it('returns a match key string from a User Identities match object', () => {
            const userIdentities = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.UserIdentities,
            });
            expect(
                DataPlanEventValidator.generateMatchKey(userIdentities)
            ).toBe('user_identities');
        });

        it('returns a match key string from a application state transition event match object', () => {
            const astMatch = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.ApplicationStateTransition,
                criteria: {
                    application_transition_type: 'application_background',
                },
            });

            expect(DataPlanEventValidator.generateMatchKey(astMatch)).toBe(
                'application_state_transition:application_background'
            );
        });

        it('returns a match key string from a custom event match object', () => {
            const customMatch = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.CustomEvent,
                criteria: {
                    event_name: 'My Test Event',
                    custom_event_type: 'navigation',
                },
            });

            expect(DataPlanEventValidator.generateMatchKey(customMatch)).toBe(
                'custom_event:navigation:My Test Event'
            );
        });

        it('returns a match key string from a screen view match object', () => {
            const screenViewMatch = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.ScreenView,
                criteria: {
                    screen_name: 'My Test Screen',
                },
            });

            expect(
                DataPlanEventValidator.generateMatchKey(screenViewMatch)
            ).toBe('screen_view::My Test Screen');
        });

        it('returns a match key string from a product action match object', () => {
            const productActionMatch = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.ProductAction,
                criteria: {
                    action: 'add_to_cart',
                },
            });

            expect(
                DataPlanEventValidator.generateMatchKey(productActionMatch)
            ).toBe('product_action:add_to_cart');
        });

        it('returns a match key string from a product impression match object', () => {
            const productImpressionMatch = DataPlanMatchFactory.getOne({
                type: DataPlanMatchType.ProductImpression,
            });

            expect(
                DataPlanEventValidator.generateMatchKey(productImpressionMatch)
            ).toBe('product_impression');
        });
    });

    describe('#getMatchKey', () => {
        it('matches custom events', () => {
            const event = EventFactory.getOne({
                data: {
                    event_name: 'My Test Event',
                    custom_event_type: 'navigation',
                },
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'custom_event:navigation:My Test Event'
            );
        });
        it('matches application state transition events', () => {
            const event = EventFactory.getOne({
                event_type: 'application_state_transition',
                data: {
                    application_transition_type: 'application_initialized',
                },
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'application_state_transition:application_initialized'
            );
        });

        it('matches breadcrumb events', () => {
            const event = EventFactory.getOne({
                event_type: 'breadcrumb',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'breadcrumb'
            );
        });

        it('matches crash report events', () => {
            const event = EventFactory.getOne({
                event_type: 'crash_report',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'crash_report'
            );
        });
        it('matches first run events', () => {
            const event = EventFactory.getOne({
                event_type: 'first_run',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe('first_run');
        });
        it('matches network performance events', () => {
            const event = EventFactory.getOne({
                event_type: 'network_performance',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'network_performance'
            );
        });
        it('matches opt out events', () => {
            const event = EventFactory.getOne({
                event_type: 'opt_out',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe('opt_out');
        });
        it('matches screen view events', () => {
            const event = ScreenViewEventFactory.getOne();

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'screen_view::Test Screen View'
            );
        });
        it('matches product action events', () => {
            const event = EventFactory.getOne({
                event_type: 'commerce_event',
                data: {
                    product_action: {
                        action: 'add_to_cart',
                    },
                },
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'product_action:add_to_cart'
            );
        });
        it('matches product impression events', () => {
            const event = EventFactory.getOne({
                event_type: 'commerce_event',
                data: {
                    product_impressions: [
                        {
                            product_impression_list: 'test',
                            products: [
                                {
                                    id: '12234',
                                    name: 'test product',
                                },
                            ],
                        },
                    ],
                },
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'product_impression'
            );
        });
        it('matches promotion action events', () => {
            const event = EventFactory.getOne({
                event_type: 'commerce_event',
                data: {
                    promotion_action: {
                        action: 'view',
                    },
                },
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'promotion_action:view'
            );
        });
        it('matches session start events', () => {
            const event = EventFactory.getOne({
                event_type: 'session_start',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'session_start'
            );
        });
        it('matches session end events', () => {
            const event = EventFactory.getOne({
                event_type: 'session_end',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(
                'session_end'
            );
        });
        it('matches uninstall events', () => {
            const event = EventFactory.getOne({
                event_type: 'uninstall',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe('uninstall');
        });

        it('matches unknown events', () => {
            const event = EventFactory.getOne({
                event_type: 'unknown',
            });

            expect(DataPlanEventValidator.getMatchKey(event)).toBe(null);
        });
    });

    describe('#validateEventBatch', () => {
        it('should validate JSON', () => {
            const dataPlanPoint: DataPlanPoint = {
                description: 'A Random Screenview',
                match: {
                    type: DataPlanMatchType.ScreenView,
                },
            };

            const criteria: ScreenViewEventCriteria = {
                screen_name: 'A valid Screen View',
            };

            const validator: DataPlanValidator = {
                type: DataPlanValidatorType.JSONSchema,
                definition: {
                    properties: {
                        data: {
                            additionalProperties: false,
                            properties: {
                                screen_name: {
                                    const: 'A valid Screen View',
                                },
                                activity_type: {
                                    type: 'string',
                                },
                            },
                            required: ['screen_name', 'activity_type'],
                        },
                    },
                },
            };

            dataPlanPoint.match = {
                type: DataPlanMatchType.ScreenView,
            };
            dataPlanPoint.match.criteria = criteria;
            dataPlanPoint.validator = validator;

            const batch = BatchFactory.getOne({
                events: [ScreenViewEventFactory.getOne()],
            });

            eventValidator.addToMatchLookups(dataPlanPoint, batch);
            // Add user attribute lookup since we're testing the whole batch
            eventValidator.addToMatchLookups(userAttributeDataPoint);

            const response = eventValidator.validateEventBatch(batch);

            expect(response).toEqual([
                {
                    event_type: 'validation_result',
                    data: {
                        match: {
                            type: 'screen_view',
                            criteria: {
                                screen_name: 'Test Screen View',
                            },
                        },
                        validation_errors: [
                            {
                                validation_error_type: 'unplanned',
                                key: 'Test Screen View',
                                error_pointer: '#',
                            },
                        ],
                    },
                },
            ]);
        });

        it('should validate custom events', () => {
            const event = CustomEventFactory.getOne({
                data: {
                    event_name: 'My Event Name is Wrong',
                    custom_event_type: 'navigation',
                },
            });
            const batch = BatchFactory.getOne({
                events: [event],
            });

            const dataPlanPoint: DataPlanPoint = {
                description: 'Test custom event',
                match: {
                    type: DataPlanMatchType.CustomEvent,
                    criteria: {
                        event_name: 'My Test Event',
                        custom_event_type:
                            CustomEventDataCustomEventTypeEnum.navigation,
                    },
                },
                validator: {
                    type: DataPlanValidatorType.JSONSchema,
                    definition: {
                        properties: {
                            event_name: {
                                const: 'My Test Event',
                            },
                        },
                    },
                },
            };

            const expectedResponse = [
                {
                    event_type: 'validation_result',
                    data: {
                        match: {
                            type: DataPlanMatchType.CustomEvent,
                            criteria: {
                                event_name: 'My Event Name is Wrong',
                                custom_event_type: 'navigation',
                            },
                        },
                        validation_errors: [
                            {
                                validation_error_type: 'unplanned',
                                key: 'My Event Name is Wrong',
                                error_pointer: '#',
                            },
                        ],
                    },
                },
            ];

            eventValidator.addToMatchLookups(dataPlanPoint, batch);
            // Add user attribute lookup since we're testing the whole batch
            eventValidator.addToMatchLookups(userAttributeDataPoint);

            const response = eventValidator.validateEventBatch(batch);
            expect(response).toEqual(expectedResponse);
        });

        it('should pass valid planned events', () => {
            const event = CustomEventFactory.getOne({
                data: {
                    event_name: 'Planned Event',
                    custom_event_type: 'other',
                },
            });

            const dataPlanPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.CustomEvent,
                    criteria: {
                        custom_event_type:
                            CustomEventDataCustomEventTypeEnum.other,
                        event_name: 'Planned Event',
                    },
                },
            });

            const batch = BatchFactory.getOne({
                events: [event],
            });

            eventValidator.addToMatchLookups(dataPlanPoint, batch);
            // Add user attribute lookup since we're testing the whole batch
            eventValidator.addToMatchLookups(userAttributeDataPoint);

            const response = eventValidator.validateEventBatch(batch);
            expect(response).toEqual([]);
        });

        it('should reject unplanned events', () => {
            const event = EventFactory.getOne({
                event_type: 'session_end',
            });

            const batch = BatchFactory.getOne({
                events: [event],
            });

            // Add user attribute lookup since we're testing the whole batch
            eventValidator.addToMatchLookups(userAttributeDataPoint);

            const response = eventValidator.validateEventBatch(batch);

            const expectedResults = [
                {
                    event_type: 'validation_result',
                    data: {
                        match: {
                            type: 'session_end',
                        },
                        validation_errors: [
                            {
                                validation_error_type: 'unplanned',
                                key: 'session_end',
                                error_pointer: '#',
                            },
                        ],
                    },
                },
            ];
            expect(response).toEqual(expectedResults);
        });
    });

    describe('#validateEvent', () => {
        it('should validate an event', () => {
            const event = ScreenViewEventFactory.getOne({
                data: {
                    screen_name: 'A valid Screen View',
                },
            });

            eventValidator.addToMatchLookups(screenViewDataPoint);

            const response = eventValidator.validateEvent(event);

            expect(response).toEqual({
                event_type: 'validation_result',
                data: {
                    match: {
                        type: 'screen_view',
                        criteria: {
                            screen_name: 'A valid Screen View',
                        },
                    },
                    validation_errors: [
                        {
                            key: 'data',
                            actual: undefined,
                            expected: 'activity_type',
                            error_pointer: '#/data',
                            schema_keyword: 'required',
                            validation_error_type: 'missing_required',
                        },
                    ],
                },
            });
        });

        it('should pass valid planned events', () => {
            const event = CustomEventFactory.getOne({
                data: {
                    event_name: 'Planned Event',
                    custom_event_type: CustomEventDataCustomEventTypeEnum.other,
                },
            });

            eventValidator.addToMatchLookups(plannedDataPoint);

            const response = eventValidator.validateEvent(event);
            expect(response).toEqual({});
        });

        it('should reject unplanned events', () => {
            const event = EventFactory.getOne({
                event_type: 'session_end',
            });

            const response = eventValidator.validateEvent(event);

            const expectedResults = {
                event_type: 'validation_result',
                data: {
                    match: {
                        type: 'session_end',
                    },
                    validation_errors: [
                        {
                            validation_error_type: 'unplanned',
                            key: 'session_end',
                            error_pointer: '#',
                        },
                    ],
                },
            };
            expect(response).toEqual(expectedResults);
        });
    });

    describe('#validateUserAttributes', () => {
        it('should validate a user', () => {
            const batch = BatchFactory.getOne({
                user_attributes: {
                    $Gender: 'male',
                    $Age: 17,
                    something: 'different',
                },
            });

            const dataPlanPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.UserAttributes,
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        additionalProperties: false,
                        properties: {
                            status: {
                                description: '',
                                type: 'string',
                            },
                            $Age: {
                                description: '',
                                pattern: '^-?\\d+(\\.\\d+)?([eE][+\\-]?\\d+)?$',
                                type: 'string',
                            },
                            Name: {
                                description: '',
                                type: 'string',
                            },
                            something: {
                                additionalProperties: false,
                                type: 'object',
                                properties: {
                                    different: {
                                        type: 'string',
                                    },
                                },
                            },
                        },
                        required: ['status'],
                    },
                },
            });

            const expectedResults = {
                event_type: 'validation_result',
                data: {
                    match: {
                        type: 'user_attributes',
                    },
                    validation_errors: [
                        {
                            actual: '$Gender',
                            error_pointer: '#',
                            key: '$Gender',
                            schema_keyword: 'additionalProperties',
                            validation_error_type: 'unplanned',
                        },
                        {
                            actual: undefined,
                            error_pointer: '#',
                            key: undefined,
                            expected: 'status',
                            schema_keyword: 'required',
                            validation_error_type: 'missing_required',
                        },
                        {
                            actual: 17,
                            error_pointer: '#/$Age',
                            expected: 'should be string',
                            key: '$Age',
                            schema_keyword: 'type',
                            validation_error_type: 'invalid_value',
                        },
                        {
                            actual: 'different',
                            error_pointer: '#/something',
                            expected: 'should be object',
                            key: 'something',
                            schema_keyword: 'type',
                            validation_error_type: 'invalid_value',
                        },
                    ],
                },
            };

            eventValidator.addToMatchLookups(dataPlanPoint, batch);

            expect(eventValidator.validateUserAttributes(batch)).toEqual(
                expectedResults
            );
        });

        it('rejects invalid user schema', () => {
            const batch = BatchFactory.getOne({
                user_attributes: {
                    $Gender: 'male',
                    $Zip: '77260',
                    status: 'gold',
                    liveInNewYork: 'true',
                    $Age: '17',
                },
            });

            const expectedResults = {
                event_type: 'validation_result',
                data: {
                    match: {
                        type: 'user_attributes',
                    },
                    validation_errors: [
                        {
                            validation_error_type: 'unknown',
                            actual: 'Invalid JSON Schema',
                            error_pointer: '#',
                            key: 'user_attributes',
                        },
                    ],
                },
            };

            expect(eventValidator.validateUserAttributes(batch)).toEqual(
                expectedResults
            );

            const dataPlanPoint = DataPlanPointFactory.getOne({
                match: {
                    type: DataPlanMatchType.UserAttributes,
                },
                validator: {
                    type: 'unknown',
                    definition: {},
                },
            });

            eventValidator.addToMatchLookups(dataPlanPoint, batch);

            expect(eventValidator.validateUserAttributes(batch)).toEqual(
                expectedResults
            );
        });
    });
});
