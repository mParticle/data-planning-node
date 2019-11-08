import { Dictionary } from '../../../src/types';

// TODO: This should become a sample batch
// TODO: Create faker for Batches
export const sample_data_plan_document: Dictionary = {
    document: {
        data_points: [
            {
                description: 'big screen desc',
                match: {
                    type: 'screen_view',
                    criteria: {
                        screen_name: 'screenA',
                    },
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                additionalProperties: false,
                                properties: {
                                    screen_name: {
                                        const: 'screenA',
                                    },
                                    activity_type: {
                                        type: 'string',
                                    },
                                },
                                required: ['screen_name', 'activity_type'],
                            },
                        },
                    },
                },
            },
            {
                description: 'my location event',
                match: {
                    type: 'custom_event',
                    criteria: {
                        event_name: 'My Big Time Custom Event',
                        custom_event_type: 'location',
                    },
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                additionalProperties: false,
                                properties: {
                                    event_name: {
                                        const: 'My Big Time Custom Event',
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
            },
            {
                description: 'my nav event',
                match: {
                    type: 'custom_event',
                    criteria: {
                        event_name: 'My Custom Event2',
                        custom_event_type: 'navigation',
                    },
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        properties: {
                            data: {
                                additionalProperties: false,
                                properties: {
                                    event_name: {
                                        const: 'My Custom Event2',
                                    },
                                    custom_event_type: {
                                        const: 'navigation',
                                    },
                                },
                                required: ['custom_event_type', 'event_name'],
                            },
                        },
                    },
                },
            },
            {
                description: 'User Attribute',
                match: {
                    type: 'user_attributes',
                    criteria: {},
                },
                validator: {
                    type: 'json_schema',
                    definition: {
                        additionalProperties: false,
                        user_attributes: {
                            additionalProperties: false,
                            properties: {
                                name: {
                                    type: 'string',
                                },
                            },
                            required: ['name'],
                        },
                        required: ['user_attributes'],
                    },
                },
            },
        ],
        settings: {
            validation_actions: {
                event: 'allow',
                event_attribute: 'allow',
                user_attribute: 'allow',
            },
        },
    },
    batch: {
        context: {
            data_plan: {
                plan_id: '11',
            },
        },
        events: [
            {
                data: {
                    timestamp_unixtime_ms: 1522893726601,
                    custom_attributes: null,
                },
                event_type: 'session_start',
            },
            {
                data: {
                    timestamp_unixtime_ms: 1573677936104,
                    event_name: 'Attribute Length Tests',
                    custom_event_type: 'other',
                    custom_attributes: null,
                },
                event_type: 'custom_event',
            },
            {
                data: {
                    product_action: {
                        action: 'add_to_wishlist',
                        checkout_step: 3,
                        transaction_id: 'c05b1077-e773-4b4b-99d1-08f09c9628f9',
                        total_amount: 1315.99,
                        tax_amount: 105.2792,
                        shipping_amount: 0,
                        products: [
                            {
                                id: 'sku_12345',
                                name: 'iPhone 6',
                                brand: 'Apple',
                                category: 'Electronics',
                                position: 0,
                                price: 399.99,
                                quantity: 1,
                                added_to_cart_time_ms: 0,
                                total_product_amount: 0,
                                custom_attributes: {
                                    color: 'grey',
                                    capacity: '16GB',
                                },
                            },
                            {
                                id: 'sku_23456',
                                name: 'Nest Learning Thermostat',
                                brand: 'Nest',
                                category: 'Electronics',
                                position: 0,
                                price: 249,
                                quantity: 1,
                                added_to_cart_time_ms: 0,
                                total_product_amount: 0,
                                custom_attributes: {
                                    color: 'blue',
                                },
                            },
                            {
                                id: 'sku_34567',
                                name: 'Air Max 1',
                                brand: 'Nike',
                                category: 'Shoe',
                                position: 0,
                                price: 110,
                                quantity: 2,
                                added_to_cart_time_ms: 0,
                                total_product_amount: 0,
                                custom_attributes: {
                                    size: '9.5',
                                    color: 'blue',
                                },
                            },
                            {
                                id: 'sku_45678',
                                name: 'Kindle',
                                brand: 'Amazon',
                                category: 'Electronics',
                                position: 0,
                                price: 149,
                                quantity: 3,
                                added_to_cart_time_ms: 0,
                                total_product_amount: 0,
                                custom_attributes: {},
                            },
                        ],
                    },
                    currency_code: 'USD',
                    screen_name: 'A magical screen',
                    is_non_interactive: false,
                    event_name: 'eCommerce - AddToWishlist',
                    custom_event_type: 'add_to_wishlist',
                    timestamp_unixtime_ms: 1522893726601,
                    location: {
                        latitude: 42.478023,
                        longitude: -122.635695,
                        accuracy: 2,
                    },
                },
                event_type: 'commerce_event',
            },
            {
                data: {
                    session_duration_ms: 600000,
                    timestamp_unixtime_ms: 1522894326601,
                    custom_attributes: {
                        'number of Screens Viewed': '7',
                    },
                    location: {
                        latitude: 40.434436,
                        longitude: -80.024817,
                        accuracy: 2,
                    },
                },
                event_type: 'session_end',
            },
        ],
        device_info: {
            brand: 'iPhone5,4',
            product: 'iPhone5,4',
            device: 'Unknown',
            device_manufacturer: 'Apple',
            platform: 'iOS',
            os_version: '6.1',
            device_model: 'iPhone5,4',
            screen_height: 736,
            screen_width: 1280,
            screen_dpi: 160,
            device_country: 'US',
            locale_language: 'EN',
            locale_country: 'US',
            network_country: 'US',
            network_carrier: 'T-mobile',
            network_code: 'T-mobile',
            network_mobile_country_code: 'US',
            timezone_offset: -5,
            build_identifier: 'M4-rc20',
            ios_advertising_id: '6dfb3392-4c5e-414d-a9fb-5819cbace771',
            ios_idfv: '512fe814-d5ff-4f17-9baf-85a7cd0842ed',
            android_advertising_id: '00000000-0000-0000-0000-000000000000',
            roku_advertising_id: '00000000-0000-0000-0000-000000000000',
        },
        application_info: {
            application_name: '_mParticle Playground',
            application_version: '2.2',
            package: 'com.mparticle.demo',
            os: 'IOS',
        },
        user_attributes: {
            $Gender: 'male',
            $Zip: '77260',
            status: 'gold',
            liveInNewYork: 'true',
            $Age: '17',
        },
        user_identities: {
            customer_id: '1682342114@gmail.com',
        },
        environment: 'Development',
        mp_deviceid: '0893de9a-3595-4b04-a378-90d8ae8eb025',
        timestamp_unixtime_ms: 1573677936104,
        batch_id: 8741626921325676000,
        sdk_version: '6.0',
        ip: '137.246.206.125',
    },
};
