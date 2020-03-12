import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
const { ENVIRONMENT } = process.env;

const defaultOutput = {
    external: [],
    input: 'src/services/data_plan_service.ts',
    plugins: [
        json(),
        typescript(),
        commonjs({
            namedExports: {
                '@mparticle/data-planning-models': [
                    'SchemaKeywordErrorTypeEnum',
                    'ValidationErrorType',
                    'ValidationError',
                    'MessageType',
                    'DataPlanMatchType',
                    'ScreenViewEventCriteria',
                    'CustomEventCriteria',
                    'ValidationErrorTypeEnum',
                    'ValidationResultEventEventTypeEnum',
                ],
            },
        }),
        resolve(),
    ],
};

const iifeBuild = {
    ...defaultOutput,
    output: {
        file: 'dist/mparticle-data-planning.iife.js',
        format: 'iife',
        browser: true,
        name: 'DataPlanning',
        sourcemap: ENVIRONMENT !== 'prod',
    },
};

const cjsBuild = {
    ...defaultOutput,
    output: {
        file: 'dist/mparticle-data-planning.common.js',
        format: 'cjs',
        sourcemap: ENVIRONMENT !== 'prod',
    },
};

const esmBuild = {
    ...defaultOutput,
    output: {
        file: 'dist/mparticle-data-planning.esm.js',
        format: 'esm',
        sourcemap: ENVIRONMENT !== 'prod',
    },
};

export default [iifeBuild, cjsBuild, esmBuild];
