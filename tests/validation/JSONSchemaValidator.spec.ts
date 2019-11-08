import faker from 'faker';
import { JSONSchemaValidator } from '../../src/index';
import { CustomEvent } from '@mparticle/event-models';
import { CustomEventFactory, EventFactory } from '../factories/event_factory';

describe('JSONSchemaValidator', () => {
    it('returns an empty array if JSON is valid', () => {
        const event = EventFactory.getOne();

        const schema = {
            properties: {
                data: {
                    additionalProperties: false,
                },
            },
        };

        expect(JSONSchemaValidator.validate(event, schema)).toEqual([]);
    });

    it('validates types', () => {
        const event = EventFactory.getOne({
            data: {
                foo: 3,
                bar: 'baz',
                numero: '3.5',
                truthy: 'true',
                list: 'a-ray',
                objectify: 'dictionary',
                nada: 'zilch',
            },
        });

        const schema = {
            properties: {
                data: {
                    properties: {
                        foo: {
                            type: 'string',
                        },
                        bar: {
                            type: 'integer',
                        },
                        numero: {
                            type: 'number',
                        },
                        truthy: {
                            type: 'boolean',
                        },
                        list: {
                            type: 'array',
                        },
                        objectify: {
                            type: 'object',
                        },
                        nada: {
                            type: 'null',
                        },
                    },
                },
            },
        };

        expect(JSONSchemaValidator.validate(event, schema)).toEqual([
            {
                validation_error_type: 'invalid_value',
                key: 'foo',
                error_pointer: '#/data/foo',
                expected: 'should be string',
                actual: 3,
                schema_keyword: 'type',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'bar',
                error_pointer: '#/data/bar',
                expected: 'should be integer',
                actual: 'baz',
                schema_keyword: 'type',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'numero',
                error_pointer: '#/data/numero',
                expected: 'should be number',
                actual: '3.5',
                schema_keyword: 'type',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'truthy',
                error_pointer: '#/data/truthy',
                expected: 'should be boolean',
                actual: 'true',
                schema_keyword: 'type',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'list',
                error_pointer: '#/data/list',
                expected: 'should be array',
                actual: 'a-ray',
                schema_keyword: 'type',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'objectify',
                error_pointer: '#/data/objectify',
                expected: 'should be object',
                actual: 'dictionary',
                schema_keyword: 'type',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'nada',
                error_pointer: '#/data/nada',
                expected: 'should be null',
                actual: 'zilch',
                schema_keyword: 'type',
            },
        ]);
    });

    it('validates additional properties', () => {
        const event = CustomEventFactory.getOne({
            yarg: 'yarg?',
            data: {
                foo: 'bar',
                baz: {
                    rab: 'oof',
                },
            },
        });

        const schema = {
            additionalProperties: false,
            properties: {
                event_type: {
                    type: 'string',
                },
                data: {
                    additionalProperties: false,
                    properties: {
                        baz: {
                            additionalProperties: false,
                            properties: {
                                // baz will generate a validation error
                                zab: {
                                    type: 'string',
                                },
                            },
                        },
                        event_name: {
                            const: 'Test User Content',
                        },
                        custom_event_type: {
                            const: 'user_content',
                        },
                    },
                },
            },
        };

        const expectedResponse = [
            {
                validation_error_type: 'unplanned',
                key: 'yarg',
                actual: 'yarg',
                error_pointer: '#',
                schema_keyword: 'additionalProperties',
            },
            {
                validation_error_type: 'unplanned',
                key: 'foo',
                actual: 'foo',
                error_pointer: '#/data',
                schema_keyword: 'additionalProperties',
            },
            {
                validation_error_type: 'unplanned',
                key: 'rab',
                actual: 'rab',
                error_pointer: '#/data/baz',
                schema_keyword: 'additionalProperties',
            },
        ];

        expect(JSONSchemaValidator.validate(event, schema)).toEqual(
            expectedResponse
        );
    });

    it('validates required values', () => {
        const event = CustomEventFactory.getOne({
            data: {
                event_name: 'Test User Content',
                custom_event_type: 'user_content',
                custom_attributes: {},
            },
        });

        const schema = {
            properties: {
                data: {
                    additionalProperties: true,
                    properties: {
                        custom_event_type: {
                            const: 'user_content',
                        },
                        event_name: {
                            const: 'Test User Content',
                        },
                        custom_attributes: {
                            additionalProperties: false,
                            properties: {
                                weather: {
                                    description: "What's the weather like?",
                                    type: 'string',
                                },
                            },
                            required: ['weather'],
                        },
                    },
                    required: [
                        'custom_event_type',
                        'event_name',
                        'custom_attributes',
                    ],
                },
            },
        };

        const expectedResponse = [
            {
                validation_error_type: 'missing_required',
                key: 'custom_attributes',
                error_pointer: '#/data/custom_attributes',
                expected: 'weather',
                schema_keyword: 'required',
            },
        ];

        expect(
            JSONSchemaValidator.validate(event as CustomEvent, schema)
        ).toEqual(expectedResponse);
    });

    it('validates null attributes', () => {
        const event = CustomEventFactory.getOne({
            data: {
                event_name: 'Test User Content',
                custom_event_type: 'other',
                custom_attributes: null,
            },
        });

        const schema = {
            properties: {
                data: {
                    additionalProperties: true,
                    properties: {
                        custom_event_type: {
                            const: 'other',
                        },
                        event_name: {
                            const: 'Test User Content',
                        },
                        custom_attributes: {
                            additionalProperties: false,
                            properties: {
                                attrKey1: {
                                    description: '',
                                    type: 'string',
                                },
                                requiredKey1: {
                                    description: '',
                                    type: 'string',
                                },
                            },
                            required: ['requiredKey1'],
                        },
                    },
                    required: [
                        'custom_event_type',
                        'event_name',
                        'custom_attributes',
                    ],
                },
            },
        };

        const expectedResponse = [
            {
                actual: undefined,
                error_pointer: '#/data',
                expected: 'custom_attributes',
                key: 'data',
                schema_keyword: 'required',
                validation_error_type: 'missing_required',
            },
        ];
        expect(
            JSONSchemaValidator.validate(event as CustomEvent, schema)
        ).toEqual(expectedResponse);
    });

    it('validates numerical errors', () => {
        const event = EventFactory.getOne({
            data: {
                custom_attributes: {
                    numeric: 'Forty Two',
                    math: 42,
                    min: 4.2,
                    max: 42,
                },
            },
        });

        const schema = {
            properties: {
                data: {
                    additionalProperties: false,
                    properties: {
                        custom_attributes: {
                            additionalProperties: false,
                            properties: {
                                numeric: {
                                    description: 'A numeric value',
                                    // Ignore the actual pattern.
                                    // It's designed to fail as it's
                                    // checking of the string has a
                                    // numeric value.
                                    // The purpose of this test is to
                                    // make sure that 'Forty Two' doesn't
                                    // conform to the regex.
                                    pattern:
                                        '^-?\\d+(\\.\\d+)?([eE][+\\-]?\\d+)?$',
                                    type: 'string',
                                },
                                math: {
                                    description: 'Multiple of 5',
                                    multipleOf: 5,
                                },
                                min: {
                                    description: 'Minimum of 5',
                                    minimum: 5,
                                },
                                max: {
                                    description: 'Maximum of 5',
                                    maximum: 5,
                                },
                            },
                        },
                    },
                    required: ['custom_attributes'],
                },
            },
        };

        const expectedResponse = [
            {
                validation_error_type: 'invalid_value',
                key: 'numeric',
                error_pointer: '#/data/custom_attributes/numeric',
                expected:
                    // tslint:disable-next-line: max-line-length
                    'should match pattern "^-?\\d+(\\.\\d+)?([eE][+\\-]?\\d+)?$"',
                actual: 'Forty Two',
                schema_keyword: 'pattern',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'math',
                error_pointer: '#/data/custom_attributes/math',
                expected: 'should be multiple of 5',
                actual: 42,
                schema_keyword: 'multipleOf',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'min',
                error_pointer: '#/data/custom_attributes/min',
                expected: 'should be >= 5',
                actual: 4.2,
                schema_keyword: 'minimum',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'max',
                error_pointer: '#/data/custom_attributes/max',
                expected: 'should be <= 5',
                actual: 42,
                schema_keyword: 'maximum',
            },
        ];

        expect(JSONSchemaValidator.validate(event, schema)).toEqual(
            expectedResponse
        );
    });
    it('validates string value errors', () => {
        const event = EventFactory.getOne({
            data: {
                custom_attributes: {
                    max: faker.random.alphaNumeric(20),
                    min: faker.random.alphaNumeric(20),
                    pattern: faker.random.alphaNumeric(30),
                    format: faker.internet.ip(),
                },
            },
        });

        const schema = {
            properties: {
                data: {
                    additionalProperties: false,
                    properties: {
                        custom_attributes: {
                            additionalProperties: false,
                            properties: {
                                max: {
                                    maxLength: 5,
                                },
                                min: {
                                    minLength: 21,
                                },
                                pattern: {
                                    pattern:
                                        '^-?\\d+(\\.\\d+)?([eE][+\\-]?\\d+)?$',
                                },
                                format: {
                                    format: 'ipv6',
                                },
                            },
                        },
                    },
                    required: ['custom_attributes'],
                },
            },
        };

        const expectedResponse = [
            {
                validation_error_type: 'invalid_value',
                key: 'max',
                error_pointer: '#/data/custom_attributes/max',
                expected: 'should NOT be longer than 5 characters',
                actual: event?.data?.custom_attributes?.max,
                schema_keyword: 'maxLength',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'min',
                error_pointer: '#/data/custom_attributes/min',
                expected: 'should NOT be shorter than 21 characters',
                actual: event?.data?.custom_attributes?.min,
                schema_keyword: 'minLength',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'pattern',
                error_pointer: '#/data/custom_attributes/pattern',
                expected:
                    // tslint:disable-next-line: max-line-length
                    'should match pattern "^-?\\d+(\\.\\d+)?([eE][+\\-]?\\d+)?$"',
                actual: event?.data?.custom_attributes?.pattern,
                schema_keyword: 'pattern',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'format',
                error_pointer: '#/data/custom_attributes/format',
                expected: 'should match format "ipv6"',
                actual: event?.data?.custom_attributes?.format,
                schema_keyword: 'format',
            },
        ];

        expect(JSONSchemaValidator.validate(event, schema)).toEqual(
            expectedResponse
        );
    });

    it('validates object errors', () => {
        const event = EventFactory.getOne({
            data: {
                custom_attributes: {
                    movie: 'The Hobbit',
                    hobbits: ['gimli'],
                    movieRating: 13,
                },
            },
        });

        const schema = {
            properties: {
                data: {
                    additionalProperties: false,
                    properties: {
                        custom_attributes: {
                            additionalProperties: true,
                            //  Pattern properties don't seem to trigger
                            //  their own keyword error, but rather seem
                            //  to allow you to select a bunch of
                            //  properties based on regex.
                            //  for instance, if you had a bunch of
                            //  props called `product_action` and
                            //  `product_view`, you can select them
                            //  with /^product_.*^/
                            patternProperties: {
                                '^movie.*$': { type: 'string' },
                            },
                            properties: {
                                hobbits: {
                                    enum: ['frodo', 'bilbo', 'samwise'],
                                },
                                movie: {
                                    const: 'Lord of the Rings',
                                },
                            },
                            dependencies: {
                                movie: ['hobbits', 'movie', 'rings'],
                            },
                        },
                    },
                    required: ['custom_attributes'],
                },
            },
        };

        const expectedResponse = [
            {
                validation_error_type: 'missing_required',
                key: 'custom_attributes',
                error_pointer: '#/data/custom_attributes',
                actual: JSON.stringify({
                    movie: 'The Hobbit',
                    hobbits: ['gimli'],
                    movieRating: 13,
                }),
                expected:
                    'should have properties hobbits, movie, rings ' +
                    'when property movie is present',
                schema_keyword: 'dependencies',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'hobbits',
                error_pointer: '#/data/custom_attributes/hobbits',
                expected: 'should be equal to one of the allowed values',
                actual: JSON.stringify(['gimli']),
                schema_keyword: 'enum',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'movie',
                error_pointer: '#/data/custom_attributes/movie',
                expected: 'should be equal to constant',
                actual: 'The Hobbit',
                schema_keyword: 'const',
            },
            {
                validation_error_type: 'invalid_value',
                key: 'movieRating',
                error_pointer: '#/data/custom_attributes/movieRating',
                expected: 'should be string',
                actual: 13,
                schema_keyword: 'type',
            },
        ];

        expect(JSONSchemaValidator.validate(event, schema)).toEqual(
            expectedResponse
        );
    });

    it('validates unknown errors', () => {
        const event = EventFactory.getOne({
            data: {
                custom_attributes: {
                    someArray: ['foo'],
                },
            },
        });

        const schema = {
            properties: {
                data: {
                    properties: {
                        custom_attributes: {
                            properties: {
                                someArray: {
                                    minItems: 2,
                                },
                            },
                        },
                    },
                },
            },
        };

        const expectedResponse = [
            {
                validation_error_type: 'unknown',
                actual: JSON.stringify(['foo']),
                expected: 'should NOT have fewer than 2 items',
                error_pointer: '#/data/custom_attributes/someArray',
                key: 'someArray',
                schema_keyword: 'minItems',
            },
        ];

        expect(JSONSchemaValidator.validate(event, schema)).toEqual(
            expectedResponse
        );
    });
});
