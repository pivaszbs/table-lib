import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
import external from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import url from '@rollup/plugin-url';
import svgr from '@svgr/rollup';
import json from '@rollup/plugin-json';

import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: pkg.module,
      format: 'es',
      exports: 'named',
      sourcemap: true
    },
  ],
  plugins: [
      external(),
      postcss({
        modules: true,
        extract: false,
        minimize: true,
        sourceMap: true,
      }),
      url(),
      svgr(),
      resolve(),
      json(),
      typescript({
        rollupCommonJSResolveHack: true,
        clean: true
      }),
      commonjs()
    ]
};
