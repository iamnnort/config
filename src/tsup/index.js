const { defineConfig } = require('tsup');
const { copy } = require('esbuild-plugin-copy');
const { chunk } = require('../lib');

module.exports = (config) => {
  return defineConfig(
    chunk(config.entry).map((entry) => {
      return {
        ...config,
        entry,
        format: ['cjs', 'esm'],
        cjsInterop: true,
        dts: true,
        minify: true,
        splitting: true,
        sourcemap: true,
        esbuildPlugins: [
          copy({
            assets: config.copy || [],
          }),
        ],
        esbuildOptions: (options) => {
          options.outbase = 'src';
        },
      };
    }),
  );
};
