const path = require('path');

const babelrc = require('./browser');

babelrc.presets.push('@babel/preset-typescript');
babelrc.presets.find(([preset]) => preset === '@babel/preset-env')[1].modules = 'commonjs';

// cwd, т.к. иначе @babel/register не транспайлит src, подробнее о проблеме:
// https://github.com/babel/babel/issues/7701,
// https://github.com/babel/babel/issues/7918
require('@babel/register')({
    cwd: path.resolve(__dirname, '../..'),
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    ignore: [(filepath) => filepath.includes('node_modules')],
    ...babelrc,
});

require('ignore-styles').default(['.pcss', '.css', '.styl', '.svg']);
