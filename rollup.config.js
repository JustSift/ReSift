// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import packageJson from './package.json';

const extensions = ['.js', '.ts', '.tsx'];

// gets the dependencies from the package json so that they can be marked as
// external in rollup
const external = [
  /^@babel\/runtime/,
  ...Object.keys(packageJson.dependencies),
  ...Object.keys(packageJson.peerDependencies),
];

export default [
  {
    input: './src/index.js',
    output: {
      file: './build/index.js',
      format: 'umd',
      sourcemap: true,
      name: 'Resift',
      globals: {
        react: 'React',
        redux: 'Redux',
        'react-redux': 'ReactRedux',
        shortid: 'shortId',
        superagent: 'superagent',
        'path-to-regexp': 'pathToRegexp',
      },
    },
    plugins: [
      resolve({
        extensions,
      }),
      babel({
        babelrc: false,
        presets: ['@babel/preset-env', '@babel/preset-typescript', '@babel/preset-react'],
        babelHelpers: 'bundled',
        extensions,
      }),
    ],
    external,
  },
  {
    input: './src/index.js',
    output: {
      file: './build/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      resolve({
        extensions,
        modulesOnly: true,
      }),
      babel({
        babelrc: false,
        presets: ['@babel/preset-typescript', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-runtime'],
        babelHelpers: 'runtime',
        extensions,
      }),
    ],
    external,
  },
];
