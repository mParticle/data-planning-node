import {
    SchemaKeywordErrorType,
    ValidationErrorType,
    ValidationError,
    ValidationErrorTypeEnum,
    SchemaKeywordErrorTypeEnum,
} from '@mparticle/data-planning-models';
import Ajv, {
    ErrorObject,
    AdditionalPropertiesParams,
    RequiredParams,
} from 'ajv';

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
export class JSONSchemaValidator {
    /**
     * Validates a data object against a schema
     * @param data A dictionary of data to validate
     * @param schema A valid JSON Schema
     * @returns An array of [[ValidationError]] Objects
     */
    static validate(
        // tslint:disable-next-line: no-any
        data: { [key: string]: any },
        // tslint:disable-next-line: no-any
        schema: { [key: string]: any }
    ): ValidationError[] {
        const errors: ValidationError[] = [];

        const ajv = new Ajv({
            jsonPointers: true,
            allErrors: true,
        });

        const validate = ajv.compile(schema);
        const valid = validate(clean(data));

        // Exit if there are no validation errors
        if (valid && !validate.errors) {
            return [];
        }

        validate.errors?.forEach((ajvError: ErrorObject) => {
            const error = this.generateValidationError(ajvError, data);
            errors.push(error);
        });
        return errors;
    }

    /**
     * Converts an AJV error into a ValidationError
     */
    private static generateValidationError(
        args: ErrorObject,
        // tslint:disable-next-line: no-any
        data: { [key: string]: any }
    ): ValidationError {
        const error: ValidationError = {};
        const nodes = splitJsonPath(args.dataPath);

        const value = digin(data, nodes);
        error.actual = getActualValue(value);

        error.error_pointer = joinJsonPointer(nodes);
        error.schema_keyword = args.keyword as SchemaKeywordErrorType;
        error.key = lastNode(nodes);

        switch (args.keyword) {
            case SchemaKeywordErrorTypeEnum.MultipleOf:
            case SchemaKeywordErrorTypeEnum.Maximum:
            case SchemaKeywordErrorTypeEnum.ExclusiveMaximum:
            case SchemaKeywordErrorTypeEnum.Minimum:
            case SchemaKeywordErrorTypeEnum.ExclusiveMinimum:
            case SchemaKeywordErrorTypeEnum.MaxLength:
            case SchemaKeywordErrorTypeEnum.MinLength:
            case SchemaKeywordErrorTypeEnum.Pattern:
            case SchemaKeywordErrorTypeEnum.Format:
                error.validation_error_type =
                    ValidationErrorTypeEnum.InvalidValue;
                error.expected = args.message;
                break;

            case SchemaKeywordErrorTypeEnum.AdditionalItems:
            case SchemaKeywordErrorTypeEnum.AdditionalProperties:
                error.validation_error_type = ValidationErrorTypeEnum.Unplanned;
                const {
                    additionalProperty,
                } = args.params as AdditionalPropertiesParams;
                error.key = additionalProperty;
                error.actual = additionalProperty;
                break;

            case SchemaKeywordErrorTypeEnum.Required:
                const { missingProperty } = args.params as RequiredParams;
                error.validation_error_type =
                    ValidationErrorTypeEnum.MissingRequired;
                error.expected = missingProperty;
                error.actual = undefined;
                break;

            case SchemaKeywordErrorTypeEnum.Type:
            case SchemaKeywordErrorTypeEnum.Const:
            case SchemaKeywordErrorTypeEnum.Enum:
                error.validation_error_type =
                    ValidationErrorTypeEnum.InvalidValue;
                error.expected = args.message;
                break;

            case SchemaKeywordErrorTypeEnum.Dependencies:
                error.validation_error_type =
                    ValidationErrorTypeEnum.MissingRequired;
                error.expected = args.message;
                break;

            case SchemaKeywordErrorTypeEnum.PatternProperties:
                error.validation_error_type =
                    ValidationErrorTypeEnum.InvalidValue;
                break;

            default:
                error.validation_error_type = ValidationErrorTypeEnum.Unknown;
                error.expected = args.message;
                break;
        }

        return error;
    }
}

const joinJsonPointer = (pathElements: string[]) =>
    // '#/'.concat(pathElements.join('/'));
    ['#'].concat(pathElements).join('/');

const splitJsonPath = (path: string): string[] =>
    path.split('/').filter(el => el !== '') || [];

// tslint:disable-next-line: no-any
const lastNode = (nodes: any[]) => nodes[nodes.length - 1];

/**
 * Digs through a nested dictionary of elements based on an ordered
 * array of keys to find node where a validation error occured.
 *
 * For example:
 *
 * ```javascript
 *   element = {
 *     foo: {
 *        bar: {
 *          baz: {
 *            answer: 42
 *          },
 *          sibling: {
 *            otherValue: 234
 *          }
 *        },
 *        something: {
 *          else: {
 *            unrelated: true,
 *            otherNode: false,
 *          }
 *        }
 *     }
 *   };
 *
 *   keys = [ 'foo', 'bar', 'baz'];
 *
 *   result = digin(element, keys)
 *   // result = { 'baz': 42 }
 * ```
 * @param element
 * @param keys
 */
const digin = (
    // tslint:disable-next-line: no-any
    element: { [key: string]: any },
    keys: string[]
    // tslint:disable-next-line: no-any
): { [key: string]: any } | null => {
    keys.forEach(key => {
        if (key in element) {
            element = element[key];
        }
    });

    return element;
};

// tslint:disable-next-line: no-any
const getActualValue = (value: any): string | number => {
    if (typeof value === 'string' || typeof value === 'number') {
        return value;
    }
    return JSON.stringify(value);
};

// tslint:disable-next-line: no-any
const clean = (obj: any): any => {
    // Removes any null or undefined elements of an object
    // tslint:disable-next-line: no-any
    const newObj: any = {};
    if (!obj) {
        return {};
    }
    Object.keys(obj).forEach(key => {
        if (
            obj[key] &&
            // typeof obj[key] === 'object'
            typeof obj[key] === 'object' &&
            !(obj[key] instanceof Array)
        ) {
            newObj[key] = clean(obj[key]); // recurse
        } else if (obj[key] != null) {
            newObj[key] = obj[key]; // copy value
        }
    });

    return newObj;
};
