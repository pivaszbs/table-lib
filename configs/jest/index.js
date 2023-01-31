const { join } = require('path');

const isCI = process.env.CI;

module.exports = {
    testURL: 'http://localhost',
    modulePathIgnorePatterns: ['src/spec', 'dist'],
    coverageReporters: ['html', 'json-summary'],
    name: 'lint',
    displayName: 'lint',
    maxConcurrency: 10,
    maxWorkers: '70%',
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.jsx?$': '../configs/jest/transform-babel.js',
    },
    moduleNameMapper: {
        '@/(.*)': '<rootDir>/./$1',
        '\\.(pcss|css|svg)$': '<rootDir>/../configs/jest/__mockFunctions__/styleMock.ts',
    },
    testRegex: '\\.(test|spec)\\.[jtnpm]sx?$',
    moduleFileExtensions: ['js', 'ts', 'jsx', 'tsx'],
    setupFilesAfterEnv: ['@testing-library/jest-dom'],
    setupFiles: ['../configs/jest/setEnvVars.ts'],
    reporters: isCI
        ? [
              'default',
              [
                  `${__dirname}/report`,
                  {
                      filename: join('html_reports', 'index.html'),
                  },
              ],
          ]
        : ['default'],
    globals: {
        __non_webpack_require__: require,
        'ts-jest': {
            tsconfig: './tsconfig.json',
        },
    },
};
