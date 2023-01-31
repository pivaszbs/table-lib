const path = require('path');

const testRules = require('@yandex-market/webpack/lib/constraints/test-rules');

testRules.css = /\.p?css$/;
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const general = require('@yandex-market/webpack/lib/layers/general');
const stylesLayer = require('@yandex-market/webpack/lib/layers/styles-browser');
const assetsLayer = require('@yandex-market/webpack/lib/layers/assets');
const outputLayer = require('@yandex-market/webpack/lib/layers/output-browser');
const reportLayer = require('@yandex-market/webpack/lib/layers/report');
const { codeLayer } = require('./layers/code');
const { staticLayer } = require('./layers/assets');
const { devServerLayer } = require('./layers/devServer');
const { optimizationLayer } = require('./layers/optimization');
const cyclicLayer = require('./layers/cyclic');

const environment = process.env.YENV || 'development';
const isDev = environment === 'development';

const config = {
    repoRoot: path.resolve(__dirname, '..'),
    distPath: path.resolve(__dirname, '..', 'dist'),
    environment,
    cssIndent: {
        localIdentName: isDev ? '[path][name]__[local]--[hash:base64:5]' : '[hash:base64:16]',
    },
    postcssConfig: require.resolve('@yandex-market/webpack/lib/postcss/postcss.config'),
    browserList: require.resolve('./browserlist'),
    inlineStyles: false,
    publicPath: '/ui/',
    babelConfig: require.resolve('@yandex-market/webpack/lib/babel/browser'),
    hmr: false,
    vendorMinChunks: 1,
    vendorTest: /node_modules/,
    isDev,
    testRules,
};

const plugins = [
    new webpack.DefinePlugin({
        'process.env.API_HOST': JSON.stringify(process.env.API_HOST),
        'process.env.MOCK_CLIENT': JSON.stringify(process.env.MOCK_CLIENT),
        'process.env.YENV': JSON.stringify(process.env.YENV),
    }),
    new webpack.ContextReplacementPlugin(/date-fns[/\\]locale$/, /ru/),
];

const entry = [require.resolve('../test/index.ts')];

const configLayer = merge(stylesLayer(config), outputLayer(config));

module.exports = merge(
    general(config),
    cyclicLayer(config),
    configLayer,
    reportLayer({ ...config, prefix: 'client' }),
    assetsLayer(config),
    devServerLayer(config),
    staticLayer(config),
    optimizationLayer(config),
    codeLayer(config),
    // swLayer(config),
    {
        target: 'web',

        output: {
            publicPath: config.publicPath,
        },
        cache: {
            type: 'filesystem',
        },
        name: 'client',

        entry: { index: entry },

        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
            alias: {
                '@': path.resolve('./src'),
            },
        },
        plugins,
    }
);
