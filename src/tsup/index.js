const fs = require('node:fs');
const { defineConfig } = require('tsup');
const { copy } = require('esbuild-plugin-copy');
const { chunk, named } = require('../lib');

module.exports = ({ clean = true, ...config }) => {
  const namedEntries = named(config.entry);

  return defineConfig(() => {
    if (clean) {
      fs.rmSync(config.outDir ?? 'dist', {
        recursive: true,
        force: true,
      });
    }

    return chunk(namedEntries).map((namedEntriesChunk) => {
      return {
        minify: true,
        ...config,
        entry: Object.fromEntries(namedEntriesChunk),
        format: ['cjs', 'esm'],
        cjsInterop: true,
        dts: true,
        splitting: true,
        sourcemap: true,
        clean: false,
        esbuildPlugins: [
          copy({
            assets: config.copy || [],
          }),
        ],
      };
    });
  });
};
