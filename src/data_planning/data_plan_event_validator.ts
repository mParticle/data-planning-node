import {
    BaseEvent,
    Batch,
    EventTypeEnum,
    ApplicationStateTransitionEventData,
    ScreenViewEventData,
    CommerceEventData,
    CustomEventData,
} from '@mparticle/event-models';
import {
    MessageType,
    DataPlanMatchType,
    ScreenViewEventCriteria,
    CustomEventCriteria,
    ApplicationStateTransitionEventCriteria,
    ProductActionEventCriteria,
    PromotionActionEventCriteria,
    DataPlanDocument,
    DataPlanMatch,
    DataPlanPoint,
    DataPlanPointSchema,
    ValidationResultEvent,
    ValidationError,
    ValidationResultEventData,
    ValidationErrorTypeEnum,
} from '@mparticle/data-planning-models';
import { JSONSchemaValidator } from '../validation/JSONSchemaValidator';

/**
 * This is an instance of the DataPlanEventValidator
 *
 * This class can be either instantiated to validate a set of events
 * and user attributes or used statically to provide simple comparisons
 * of [[DataPlanMatchType]] and
 * [[DataPlanMatch]] attributes.
 *
 * ## Usage
 *
 * ### Creating an instance
 *
 * An instance of a [[DataPlanEventValidator]] is initialized with a
 * [[DataPlanDocument]] that will be used to validate all subsequent
 * events. This docuemnt is also used to generate an internal list of
 * [[DataPlanPoint]]s representing **planned** events;
 *
 * ```typescript
 * const dataPlanDocument = {
 *     data_points: [
 *         {
 *             "description": "big screen desc",
 *             "match": {
 *                 "type": "screen_view",
 *                 "criteria": {
 *                     "screen_name": "screenA"
 *                 }
 *             },
 *             "validator": {
 *                 "type": "json_schema",
 *                 "definition": {
 *                     "properties": {
 *                         "data": {
 *                             "additionalProperties": false,
 *                             "properties": {
 *                                 "screen_name": {
 *                                     "const": "screenA"
 *                                 },
 *                                 "activity_type": {
 *                                     "type": "string"
 *                                 }
 *                             },
 *                             "required": [
 *                                 "screen_name",
 *                                 "activity_type"
 *                             ]
 *                         }
 *                     }
 *                 }
 *             }
 *         },
 *     ],
 * }
 * ```
 *
 * Once initialized, the [[validateEventBatch]] method is used to perform
 * the bulk of the validation. This will return an array of
 * [[ValidationResultEvent]] objects.
 *
 * ```ts
 * const validator = new DataPlanEventValidator(dataPlanDocument);
 * const validationResults = validator.validateEventBatch(eventBatch);
 * ```
 *
 * An example [[ValidationResultEvent]]:
 * ```json
 * [
 *     {
 *         "event_type": "validation_results",
 *         "data": {
 *             "match": {
 *                 "type": "screen_view",
 *                 "criteria": {
 *                     "screen_name": "screenA"
 *                 }
 *             },
 *             "validation_errors": [
 *                 {
 *                     "validation_error_type": "unplanned"
 *                 }
 *             ]
 *         }
 *     }
 * ]
 *
 * ```
 *
 * ### As a static class
 *
 * The [[DataPlanEventValidator]] also exposes static methods that can be
 * used independently of the instance for looking up and comparing
 * [[DataPlanMatchType]]
 */
export class DataPlanEventValidator {
    dataPlanMatchLookups: { [key: string]: DataPlanPointSchema } = {};
    constructor(
        public dataPlanDocument: DataPlanDocument,
        public eventBatchForLogging: Batch | null = null
    ) {
        if (!dataPlanDocument) {
            throw new Error('Data Plan Document is required');
        }

        if (!dataPlanDocument.data_points) {
            throw new Error('Data Plan Document must have data points');
        }

        // Add points to lookup
        if (dataPlanDocument.data_points.length > 0) {
            dataPlanDocument.data_points.forEach(point => {
                this.addToMatchLookups(point);
            });
        }
    }

    /**
     * Adds a [[DataPlanPoint]] to an internal hashmap of events and their
     * respective matchers and schemas for validation
     *
     * Usage:
     * ```typescript
     * const point: DataPlanPoint = {
     *     match: {
     *         type: 'custom_event',
     *         criteria: {
     *             event_name: 'This is a test event',
     *             custom_event_type: 'location'
     *         }
     *     },
     *     validator: {
     *         type: 'json_schema',
     *         definition: {
     *             properties: {
     *                 data: {
     *                     additionalProperties: false,
     *                     properties: {
     *                         event_name: {
     *                             const: 'This is a test event'
     *                         },
     *                         custom_event_type: {
     *                             const: 'location'
     *                         }
     *                     },
     *                     required: ['custom_event_type', 'event_name']
     *                 }
     *             }
     *         }
     *     }
     * };
     *
     * const batch: Batch = {
     *     events: [
     *         {
     *             event_type: 'custom_event',
     *         },
     *     ],
     *     environment: 'development',
     *     mpid: '123456789',
     * };
     *
     * validator.addToMatchLookups(point, batch);
     * ```
     *
     * @param point A single [[DataPlanPoint]]
     * @param eventBatchForLogging A [[Batch]] object used for logging
     * @category Core
     */
    addToMatchLookups(
        point: DataPlanPoint,
        eventBatchForLogging?: Batch | null
    ) {
        if (!point.match || !point.validator) {
            console.warn('Data Plan Point is not valid', point);
            return;
        }

        const matchKey = DataPlanEventValidator.generateMatchKey(point.match);

        // TODO: Maybe Implement Logger
        if (matchKey in this.dataPlanMatchLookups) {
            console.warn('Duplicate match key', matchKey);
        }

        const dataPointSchema: DataPlanPointSchema = {
            match: point.match,
            schema: {},
        };

        const validator = point.validator;
        if (validator.type === 'json_schema' && validator.definition) {
            dataPointSchema.schema = validator.definition;
        } else {
            console.warn(
                'Non-JSON-Schema validator',
                matchKey,
                eventBatchForLogging
            );
        }

        this.dataPlanMatchLookups[matchKey] = dataPointSchema;
    }

    /**
     * Combines Validation Error Results with User Attribute Validation as a
     * single Array of [[ValidationResultEvent]] objects
     * @param eventErrors An array of [[ValidationResultEvent]] objects
     * @param userAttributeErrors User Attribute Errors as a
     *                            [[ValidationResultEvent]]
     * @returns A concatenated array of [[ValidationResultEvent]] objects
     */
    private combineErrors(
        eventErrors: ValidationResultEvent[],
        userAttributeErrors: ValidationResultEvent
    ): ValidationResultEvent[] {
        return eventErrors
            .concat(userAttributeErrors)
            .filter(el => Object.keys(el).length !== 0);
    }

    /**
     * Validates Events and User Attributes, returning both in an array of
     * [[ValidationResultEvent]] objects
     * @category Core
     * @param eventBatch A single [[Batch]]
     */
    validateEventBatch(eventBatch: Batch): ValidationResultEvent[] {
        const errors = this.validateEvents(eventBatch);
        const attributeErrors = this.validateUserAttributes(eventBatch);

        return this.combineErrors(errors, attributeErrors);
    }

    /**
     * Validates a single [[BaseEvent]] and returns the result as a
     * [[ValidationResultEvent]]
     * @param event A Base EVent
     * @returns a single Validation Result
     */
    validateEvent(event: BaseEvent): ValidationResultEvent {
        const matchKey = DataPlanEventValidator.getMatchKey(event);

        const result: ValidationResultEventData = {};
        const errors: ValidationError[] = [];

        // Handle Unplannable Events
        if (!matchKey || !matchKey.trim()) {
            const validationError: ValidationError = {
                validation_error_type: ValidationErrorTypeEnum.Unplanned,
                key: 'unknown',
                error_pointer: '#',
            };
            errors.push(validationError);

            result.validation_errors = errors;
            return {
                event_type: EventTypeEnum.validationResult,
                data: result,
            };
        }

        // Handle Unplanned Events
        if (matchKey && !(matchKey in this.dataPlanMatchLookups)) {
            const validationError: ValidationError = {
                validation_error_type: ValidationErrorTypeEnum.Unplanned,
                key: this.getEventKey(event),
                error_pointer: '#',
            };

            errors.push(validationError);

            const match = DataPlanEventValidator.synthesizeMatch(event);

            if (match) {
                result.match = match;
            }
            result.validation_errors = errors;

            return {
                event_type: EventTypeEnum.validationResult,
                data: result,
            };
        }

        // Handle Planned Events
        const point = this.dataPlanMatchLookups[matchKey];
        result.match = point?.match;
        const schema = point?.schema;

        const validationErrors = JSONSchemaValidator.validate(event, schema);

        errors.push(...validationErrors);

        if (errors.length > 0) {
            result.validation_errors = errors;
            return {
                event_type: EventTypeEnum.validationResult,
                data: result,
            };
        }

        // If you're reading this, the event is probably valid
        return {};
    }

    /**
     * Validates a single [[Batch]] and returns the results as a
     * [[ValidationResultEvent]]
     * @param eventBatch A single [[Batch]]
     * @returns Validation Results
     */
    validateEvents(eventBatch: Batch): ValidationResultEvent[] {
        return (
            eventBatch?.events?.map(eventToValidate =>
                this.validateEvent(eventToValidate)
            ) || []
        );
    }

    validateUserAttributes(eventBatch: Batch): ValidationResultEvent {
        const result: ValidationResultEventData = {};
        const point = this.dataPlanMatchLookups['user_attributes'];
        const schema = point?.schema;

        // Only validate user attributes if `dataPlanMatchLookups`
        // specifically contains 'user attributes'
        if (!point) {
            return {};
        }

        // Reject schema if not present when user attribute
        // validation is required
        if (!schema || Object.keys(schema).length === 0) {
            result.match = {
                type: DataPlanMatchType.UserAttributes,
            };
            const error: ValidationError = {
                validation_error_type: ValidationErrorTypeEnum.Unknown,
                error_pointer: '#',
                actual: 'Invalid JSON Schema',
                key: 'user_attributes',
            };

            return {
                event_type: EventTypeEnum.validationResult,
                data: {
                    match: result.match,
                    validation_errors: [error],
                },
            };
        }

        result.match = point?.match;

        // Attempt User Attribute Validation
        const validationErrors = JSONSchemaValidator.validate(
            // tslint:disable-next-line: no-any
            eventBatch.user_attributes as { [key: string]: any },
            schema
        );

        if (!validationErrors || validationErrors.length === 0) {
            return {};
        }

        return {
            event_type: EventTypeEnum.validationResult,
            data: {
                match: result.match,
                validation_errors: validationErrors,
            },
        };
    }

    /**
     * Returns a matchKey string from a DataPlanMatch Object
     * @param match A [[DataPlanMatch]] object
     */
    static generateMatchKey(match: DataPlanMatch): string {
        switch (match.type) {
            case DataPlanMatchType.Breadcrumb:
            case DataPlanMatchType.CrashReport:
            case DataPlanMatchType.FirstRun:
            case DataPlanMatchType.NetworkPerformance:
            case DataPlanMatchType.OptOut:
            case DataPlanMatchType.ProductImpression:
            case DataPlanMatchType.SessionStart:
            case DataPlanMatchType.SessionEnd:
            case DataPlanMatchType.Uninstall:
            case DataPlanMatchType.UserAttributes:
            case DataPlanMatchType.UserIdentities:
                return match.type as string;

            case DataPlanMatchType.ApplicationStateTransition:
                // tslint:disable-next-line: max-line-length
                const astCriteria = match.criteria as ApplicationStateTransitionEventCriteria;
                return [
                    DataPlanMatchType.ApplicationStateTransition,
                    astCriteria.application_transition_type,
                ].join(':');

            case DataPlanMatchType.CustomEvent:
                // tslint:disable-next-line: max-line-length
                const customEventCriteria = match.criteria as CustomEventCriteria;

                return [
                    DataPlanMatchType.CustomEvent,
                    customEventCriteria.custom_event_type,
                    customEventCriteria.event_name,
                ].join(':');

            case DataPlanMatchType.ScreenView:
                // tslint:disable-next-line: max-line-length
                const screenViewCriteria = match.criteria as ScreenViewEventCriteria;
                return [
                    DataPlanMatchType.ScreenView,
                    '',
                    screenViewCriteria.screen_name,
                ].join(':');

            case DataPlanMatchType.ProductAction:
                // tslint:disable-next-line: max-line-length
                const productActionMatch = match.criteria as ProductActionEventCriteria;
                return [match.type as string, productActionMatch.action].join(
                    ':'
                );

            case DataPlanMatchType.PromotionAction:
                // tslint:disable-next-line: max-line-length
                const promoActionMatch = match.criteria as PromotionActionEventCriteria;
                return [match.type as string, promoActionMatch.action].join(
                    ':'
                );

            default:
                return 'unknown';
        }
    }

    /**
     * Returns a matchKey for a [[BaseEvent]]
     * @param eventToMatch A [[BaseEvent]]
     * @returns A `matchKey` as a string
     */
    static getMatchKey(eventToMatch: BaseEvent): string | null {
        switch (eventToMatch.event_type as string) {
            case MessageType.Breadcrumb:
                return DataPlanMatchType.Breadcrumb;
            case MessageType.CrashReport:
                return DataPlanMatchType.CrashReport;
            case MessageType.FirstRun:
                return DataPlanMatchType.FirstRun;
            case MessageType.NetworkPerformance:
                return DataPlanMatchType.NetworkPerformance;
            case MessageType.OptOut:
                return DataPlanMatchType.OptOut;
            case MessageType.SessionStart:
                return DataPlanMatchType.SessionStart;
            case MessageType.SessionEnd:
                return DataPlanMatchType.SessionEnd;
            case MessageType.Uninstall:
                return DataPlanMatchType.Uninstall;

            case MessageType.ApplicationStateTransition:
                // tslint:disable-next-line: max-line-length
                const appStateTransitionEventData = eventToMatch.data as ApplicationStateTransitionEventData;
                return [
                    DataPlanMatchType.ApplicationStateTransition,
                    appStateTransitionEventData?.application_transition_type,
                ].join(':');
            case MessageType.ScreenView:
                // tslint:disable-next-line: max-line-length
                const screenViewEventData = eventToMatch.data as ScreenViewEventData;
                return [
                    DataPlanMatchType.ScreenView,
                    '',
                    screenViewEventData?.screen_name,
                ].join(':');
            case MessageType.Commerce:
                // tslint:disable-next-line: max-line-length
                const commerceEventData = eventToMatch.data as CommerceEventData;
                const matchKey: string[] = [];

                if (commerceEventData) {
                    const {
                        product_action,
                        product_impressions,
                        promotion_action,
                    } = commerceEventData;

                    if (product_action) {
                        matchKey.push(DataPlanMatchType.ProductAction);
                        matchKey.push(product_action.action);
                    } else if (promotion_action) {
                        matchKey.push(DataPlanMatchType.PromotionAction);
                        matchKey.push(promotion_action.action);
                    } else if (product_impressions) {
                        matchKey.push(DataPlanMatchType.ProductImpression);
                    }
                }
                return matchKey.join(':');
            case MessageType.CustomEvent:
                const customEventData = eventToMatch.data as CustomEventData;
                if (customEventData) {
                    return [
                        DataPlanMatchType.CustomEvent,
                        customEventData.custom_event_type,
                        customEventData.event_name,
                    ].join(':');
                }
                return null;
            default:
                return null;
        }
    }

    /**
     * Generates a [[DataPlanMatch]] based on the `matchType` of a `BaseEvent`
     * @param eventToMatch A [[BaseEvent]]
     * @returns A [[DataPlanMatch]] for the event
     */
    static synthesizeMatch(eventToMatch: BaseEvent): DataPlanMatch {
        switch (eventToMatch.event_type) {
            case EventTypeEnum.sessionStart:
                return { type: DataPlanMatchType.SessionStart };
            case EventTypeEnum.sessionEnd:
                return { type: DataPlanMatchType.SessionEnd };
            case EventTypeEnum.screenView:
                // tslint:disable-next-line: max-line-length
                const screenViewEventData = eventToMatch.data as ScreenViewEventData;
                let screenName = '';
                if (screenViewEventData) {
                    screenName = screenViewEventData.screen_name;
                }
                const screenViewCriteria: ScreenViewEventCriteria = {
                    screen_name: screenName,
                };
                return {
                    type: DataPlanMatchType.ScreenView,
                    criteria: screenViewCriteria,
                };
            case EventTypeEnum.customEvent:
                const customEventData = eventToMatch.data as CustomEventData;
                const customEventCriteria: CustomEventCriteria = {
                    event_name: customEventData?.event_name || 'Custom Event',
                    // tslint:disable-next-line: max-line-length
                    custom_event_type:
                        customEventData?.custom_event_type || 'other',
                };

                return {
                    type: DataPlanMatchType.CustomEvent,
                    criteria: customEventCriteria,
                };
            case EventTypeEnum.crashReport:
                return { type: DataPlanMatchType.CrashReport };
            case EventTypeEnum.optOut:
                return { type: DataPlanMatchType.OptOut };
            case EventTypeEnum.firstRun:
                return { type: DataPlanMatchType.FirstRun };
            case EventTypeEnum.applicationStateTransition:
                // tslint:disable-next-line: max-line-length
                const appStateTransitionEventData = eventToMatch.data as ApplicationStateTransitionEventData;
                // tslint:disable-next-line: max-line-length
                const appStateTransitionCriteria: ApplicationStateTransitionEventCriteria = {
                    application_transition_type:
                        // tslint:disable-next-line: max-line-length
                        appStateTransitionEventData?.application_transition_type ||
                        'unknown',
                };
                return {
                    type: DataPlanMatchType.ApplicationStateTransition,
                    criteria: appStateTransitionCriteria,
                };
            case EventTypeEnum.networkPerformance:
                return { type: DataPlanMatchType.NetworkPerformance };
            case EventTypeEnum.breadcrumb:
                return { type: DataPlanMatchType.Breadcrumb };
            case EventTypeEnum.uninstall:
                return { type: DataPlanMatchType.Uninstall };
            case EventTypeEnum.commerceEvent:
                // tslint:disable-next-line: max-line-length
                const commerceEventData = eventToMatch.data as CommerceEventData;
                if (commerceEventData) {
                    if (commerceEventData.product_action) {
                        const criteria: ProductActionEventCriteria = {
                            action: commerceEventData.product_action.action,
                        };
                        return {
                            type: DataPlanMatchType.ProductAction,
                            criteria,
                        };
                    } else if (commerceEventData.promotion_action) {
                        const criteria: PromotionActionEventCriteria = {
                            action: commerceEventData.promotion_action.action,
                        };
                        return {
                            type: DataPlanMatchType.PromotionAction,
                            criteria,
                        };
                    } else if (commerceEventData.product_impressions) {
                        return { type: DataPlanMatchType.ProductImpression };
                    }
                }
                break;
            default:
                return { type: DataPlanMatchType.Unknown };
        }
        return { type: DataPlanMatchType.Unknown };
    }

    private getEventKey(eventToConvert: BaseEvent): string {
        let key;
        switch (eventToConvert.event_type) {
            case 'custom_event':
                const customEventData = eventToConvert.data as CustomEventData;
                key = customEventData?.event_name;
                break;
            case 'screen_view':
                // tslint:disable-next-line: max-line-length
                const screenViewEventData = eventToConvert.data as ScreenViewEventData;
                key = screenViewEventData?.screen_name;
                break;
            default:
                break;
        }
        return key || eventToConvert.event_type;
    }
}
