module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['./tests/javascript'],
    setupFilesAfterEnv: ['jest-expect-message'],
};
