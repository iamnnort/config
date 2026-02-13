const config = require('./src/tsup');

module.exports = config({
  entry: [
    './src/esbuild/index.js',
    './src/eslint/index.js',
    './src/http/index.ts',
    './src/jest/index.js',
    './src/lint-staged/index.js',
    './src/prettier/index.js',
    './src/tsup/index.js',
  ],
  publicDir: './src/tsconfig',
});
