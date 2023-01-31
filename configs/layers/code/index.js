const { merge } = require('webpack-merge');
const javascriptRule = require('@yandex-market/webpack/lib/rules/javascript');
const testRules = require('@yandex-market/webpack/lib/constraints/test-rules');

const notCompiled = ['/app/node_modules/', '/@yandex-market/', '/wms-table/'];

const isAlreadyCompiled = (pathname) =>
    (pathname.includes('/node_modules/') && !notCompiled.some((currentPath) => pathname.includes(currentPath))) ||
    pathname.includes('/.storybook/');

exports.codeLayer = ({ isDev, environment, babelConfig, browserList }) => ({
    module: {
        rules: [
            merge(javascriptRule(environment, babelConfig, browserList), {
                exclude: isAlreadyCompiled,
            }),
            {
                test: testRules.ts,
                exclude: isAlreadyCompiled,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: isDev,
                            allowTsInNodeModules: true,
                            configFile: isDev ? 'tsconfig.json' : 'tsconfig.release.json',
                            experimentalFileCaching: true,
                        },
                    },
                ],
            },
        ],
    },
});
