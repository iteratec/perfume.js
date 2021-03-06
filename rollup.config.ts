import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import sourceMaps from 'rollup-plugin-sourcemaps';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const ensureArray = maybeArr =>
  Array.isArray(maybeArr) ? maybeArr : [maybeArr];

const createConfig = ({ output, includeExternals = false, min = false }) => {
  const minify =
    min &&
    terser({
      output: {
        comments(node, { text, type }) {
          if (type === 'comment2') {
            // multiline comment
            return /@preserve|@license|@cc_on/i.test(text);
          }
        },
      },
    });
  
  const plugins = [
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),
    // Resolve source maps to the original source
    sourceMaps(),
    minify,
  ];

  if (output.format !== 'esm') {
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    plugins.unshift(commonjs());
  }

  return {
    input: 'dist/es/perfume.js',
    output: {
      file: output.file,
      format: output.format,
      name: 'Perfume',
      sourcemap: true,
    },
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: includeExternals
      ? []
      : [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
        ],
    watch: { include: 'dist/es/**' },
    plugins: plugins.filter(Boolean),
  };
};

export default [
  createConfig({
    output: { file: pkg.module, format: 'esm' }
  }),
  createConfig({
    output: { file: pkg.main, format: 'cjs' }
  }),
  createConfig({
    output: { file: 'dist/perfume.esm.min.js', format: 'esm' },
    min: true,
  }),
  createConfig({
    output: { file: 'dist/perfume.min.js', format: 'cjs' },
    min: true,
  }),
  createConfig({
    output: { file: pkg.iife, format: 'iife' },
    includeExternals: true,
  }),
  createConfig({
    output: { file: 'dist/perfume.iife.min.js', format: 'iife' },
    includeExternals: true,
    min: true,
  }),
  createConfig({
    output: { file: pkg.unpkg, format: 'umd' },
    includeExternals: true,
  }),
  createConfig({
    output: { file: 'dist/perfume.umd.min.js', format: 'umd' },
    includeExternals: true,
    min: true,
  }),
];
