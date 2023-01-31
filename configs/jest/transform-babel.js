const { createTransformer } = require('babel-jest');

const babelrc = require('../babel/jest');

module.exports = createTransformer(babelrc);
