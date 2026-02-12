const { defineConfig } = require('tsup');
const { chunk } = require('../lib');

module.exports = (config) => {
  return defineConfig(
    chunk(config.entry).map((entry) => {
      return {
        ...config,
        entry,
        format: ['cjs', 'esm'],
        dts: true,
        minify: true,
        splitting: true,
        sourcemap: true,
        esbuildOptions: (options) => {
          options.outbase = 'src';
        },
      };
    }),
  );
};
