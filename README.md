<img src="https://static.mparticle.com/sdk/mp_logo_black.svg" width="280"><br>

[![npm](https://img.shields.io/npm/v/@mparticle/data-planning-node.svg?maxAge=2592000)](https://www.npmjs.com/package/@mparticle/data-planning-node)

# mParticle Data Planning Node SDK

Hello! This is the public repo of the mParticle Web Data Planning SDK. We've built the mParticle platform to take a new approach to web and mobile app data and the platform has grown to support 200+ services and SDKs, including developer tools, analytics, attribution, messaging, and advertising services. mParticle is designed to serve as the connector between all of these services - check out [our site](http://mparticle.com), or hit us at developers@mparticle.com to learn more.

## Documentation

Fully detailed documentation and other information about mParticle web SDK can be found at our doc site

-   [Core mParticle SDK](https://docs.mparticle.com/developers/sdk/web/getting-started)

# Overview

The main purpose of this project is to validate your customer data before it arrives at mParticle's systems. In simplest terms, a Data Plan represents the contract between your data and mParticle.

This project allows the fetching of Data Plans or Data Plan Versions and the ability to validate your events and batches against said Data Plan Versions.

# Getting Started

## Importing Data Planning Node

`$ npm install @mparticle/data-planning-node`

To use this within your project:

```typescript
import { DataPlanService } from '@mparticle/data-planning-node';
```

## Fetching Data Plans

To fetch a Data Plan or Data Plan Version, you will first need the following credentials:

-   Organization ID
-   Workspace ID
-   Account ID
-   Bearer Token from [Platform API](https://docs.mparticle.com/developers/platform/#authentication)

```typescript
import { DataPlanService } from '@mparticle/data-planning-node';

const dataPlanService = new DataPlanService();

// Fetch full data plan
dataPlanService
    .getPlan(<organizationId>,<accountId>, <dataPlanId>, <workspaceId>, <token>)
    .then(dataPlan => {
        // Save or render your data plan
    });

// Fetch Data Plan Version
dataPlanService
    .getVersionDocument(<organizationId>, <accountId>, <dataPlanId>, <workspaceId>, <versionNumber>, <token>)
    .then(dataPlanVersion => {
        // Save or render your data plan version
    });

```

## Validating Data

To validate your event or batch, you should use the `validateEvent`, `validateEvents`, or `validateBatch` methods, respectively.

```typescript
import { DataPlanService } from '@mparticle/data-planning-node';

const dataPlanService = new DataPlanService();

// Fetch Data Plan Version asynchronously
const dataPlanVersion = await dataPlanService
    .getVersionDocument(<organizationId>, <accountId>, 'my_custom_data_plan, <workspaceId>, 3, <token>);

const batchValidationResults = dataPlanService.validateBatch(batch, dataPlanVersion.version_document);

const eventValidationResults = dataPlanService.validateEvent(event, dataPlanVersion.version_document);

```

### Validation Result Sample

```
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
```

# Contribution Guidelines

At mParticle, we are proud of our code and like to keep things open source. If you'd like to contribute, simply fork this repo, push any code changes to your fork, and submit a Pull Request against the `master` branch of mParticle-web-media-sdk.

## Running the Tests

Prior to running the tests please install all dev dependencies via an `npm install`, and build the mParticle.js file as well as the test file by running `npm run build`:

```bash
$ npm install
$ npm run build
$ npm test
```

The test script will run all tests using Mocha as unit tests.

## Development Notes

This package comes with the NPM package [pre-commit](https://www.npmjs.com/package/pre-commit), which will run [GTS](https://github.com/google/gts) when you try to commit.

## Support

<support@mparticle.com>

## License

The mParticle Web Media SDK is available under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0). See the LICENSE file for more info.
