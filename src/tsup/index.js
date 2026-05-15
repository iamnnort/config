const { defineConfig } = require('tsup');
const { copy } = require('esbuild-plugin-copy');
const { chunk, named } = require('../lib');

module.exports = (config) => {
  const namedEntries = named(config.entry);

  return defineConfig(
    chunk(namedEntries).map((namedEntriesChunk) => {
      return {
        minify: true,
        ...config,
        entry: Object.fromEntries(namedEntriesChunk),
        format: ['cjs', 'esm'],
        cjsInterop: true,
        dts: true,
        splitting: true,
        sourcemap: true,
        esbuildPlugins: [
          copy({
            assets: config.copy || [],
          }),
        ],
      };
    }),
  );
};
