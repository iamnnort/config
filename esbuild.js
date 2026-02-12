const { build } = require('esbuild');
const { copy } = require('esbuild-plugin-copy');

const run = async () => {
  await build({
    entryPoints: [
      './src/esbuild/index.js',
      './src/eslint/index.js',
      './src/jest/index.js',
      './src/lint-staged/index.js',
      './src/prettier/index.js',
      './src/tsup/index.js',
    ],
    outdir: './dist',
    bundle: true,
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    external: ['esbuild', 'fsevents'],
    plugins: [
      copy({
        assets: [
          {
            from: ['./src/tsconfig/*'],
            to: ['../tsconfig'],
          },
        ],
      }),
    ],
  });
};

run();
