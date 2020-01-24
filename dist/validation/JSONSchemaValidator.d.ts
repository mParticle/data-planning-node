import { ValidationError } from '@mparticle/data-planning-models';
import { Dictionary } from '../types';
/**
 * This is an instance of a JSONSchemaValidator
 *
 * This class is used specifically to validate the JSON Schema of any data
 * such as UserAttributes or Events and returns an array of [[ValidationError]]
 * objects.
 *
 * ## Examples
 * ```json
 *
 * {
 *      validation_error_type: 'missing_required',
 *      key: 'custom_attributes',
 *      error_pointer: '#/data/custom_attributes',
 *      actual: JSON.stringify({
 *          movie: 'The Hobbit',
 *          hobbits: ['gimli'],
 *          movieRating: 13,
 *      }),
 *      expected:
 *          'should have properties hobbits, movie, rings ' +
 *          'when property movie is present',
 *      schema_keyword: 'dependencies',
 *  },
 *  {
 *      validation_error_type: 'invalid_value',
 *      key: 'hobbits',
 *      error_pointer: '#/data/custom_attributes/hobbits',
 *      expected: 'should be equal to one of the allowed values',
 *      actual: JSON.stringify(['gimli']),
 *      schema_keyword: 'enum',
 *  },
 *  {
 *      validation_error_type: 'invalid_value',
 *      key: 'movie',
 *      error_pointer: '#/data/custom_attributes/movie',
 *      expected: 'should be equal to constant',
 *      actual: 'The Hobbit',
 *      schema_keyword: 'const',
 *  },
 *  {
 *      validation_error_type: 'invalid_value',
 *      key: 'movieRating',
 *      error_pointer: '#/data/custom_attributes/movieRating',
 *      expected: 'should be string',
 *      actual: 13,
 *      schema_keyword: 'type',
 *  },
 * ```
 */
export declare class JSONSchemaValidator {
    /**
     * Validates a data object against a schema
     * @param data A dictionary of data to validate
     * @param schema A valid JSON Schema
     * @returns An array of [[ValidationError]] Objects
     */
    static validate(data: Dictionary, schema: Dictionary): ValidationError[];
    /**
     * Converts an AJV error into a ValidationError
     */
    private static generateValidationError;
}
