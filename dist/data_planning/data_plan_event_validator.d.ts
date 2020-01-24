import { BaseEvent, Batch } from '@mparticle/event-models';
import { DataPlanDocument, DataPlanMatch, DataPlanPoint, DataPlanPointSchema, ValidationResultEvent } from '@mparticle/data-planning-models';
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
export declare class DataPlanEventValidator {
    dataPlanDocument: DataPlanDocument;
    eventBatchForLogging: Batch | null;
    dataPlanMatchLookups: {
        [key: string]: DataPlanPointSchema;
    };
    constructor(dataPlanDocument: DataPlanDocument, eventBatchForLogging?: Batch | null);
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
    addToMatchLookups(point: DataPlanPoint, eventBatchForLogging?: Batch | null): void;
    /**
     * Combines Validation Error Results with User Attribute Validation as a
     * single Array of [[ValidationResultEvent]] objects
     * @param eventErrors An array of [[ValidationResultEvent]] objects
     * @param userAttributeErrors User Attribute Errors as a
     *                            [[ValidationResultEvent]]
     * @returns A concatenated array of [[ValidationResultEvent]] objects
     */
    private combineErrors;
    /**
     * Validates Events and User Attributes, returning both in an array of
     * [[ValidationResultEvent]] objects
     * @category Core
     * @param eventBatch A single [[Batch]]
     */
    validateEventBatch(eventBatch: Batch): ValidationResultEvent[];
    /**
     * Validates a single [[BaseEvent]] and returns the result as a
     * [[ValidationResultEvent]]
     * @param event A Base EVent
     * @returns a single Validation Result
     */
    validateEvent(event: BaseEvent): ValidationResultEvent;
    /**
     * Validates a single [[Batch]] and returns the results as a
     * [[ValidationResultEvent]]
     * @param eventBatch A single [[Batch]]
     * @returns Validation Results
     */
    validateEvents(eventBatch: Batch): ValidationResultEvent[];
    validateUserAttributes(eventBatch: Batch): ValidationResultEvent;
    /**
     * Returns a matchKey string from a DataPlanMatch Object
     * @param match A [[DataPlanMatch]] object
     */
    static generateMatchKey(match: DataPlanMatch): string;
    /**
     * Returns a matchKey for a [[BaseEvent]]
     * @param eventToMatch A [[BaseEvent]]
     * @returns A `matchKey` as a string
     */
    static getMatchKey(eventToMatch: BaseEvent): string | null;
    /**
     * Generates a [[DataPlanMatch]] based on the `matchType` of a `BaseEvent`
     * @param eventToMatch A [[BaseEvent]]
     * @returns A [[DataPlanMatch]] for the event
     */
    static synthesizeMatch(eventToMatch: BaseEvent): DataPlanMatch;
    private getEventKey;
}
