# @iamnnort/config

Shared, reusable config presets for **ESLint**, **Prettier**, **lint-staged**, **esbuild**, **tsup**, and **TypeScript**. Use in your Node.js projects for consistent tooling without maintaining config in every repo.

## Install

```bash
yarn add @iamnnort/config
# or
npm i @iamnnort/config
```

## Requirements

- **Node.js** ≥ 22

## Usage

### ESLint

```js
// eslint.config.js
const config = require('@iamnnort/config/eslint');

module.exports = config();
```

With overrides: `config({ import: true })`.

### Prettier

```js
// prettier.config.js
const config = require('@iamnnort/config/prettier');

module.exports = config();
```

### Lint-staged

```js
// lint-staged.config.js
const config = require('@iamnnort/config/lint-staged');

module.exports = config();
```

### Esbuild

```js
const build = require('@iamnnort/config/esbuild');

build({ entryPoints: ['./src/index.ts'] });
```

### Tsup

```js
// tsup.config.js
const config = require('@iamnnort/config/tsup');

module.exports = config({ entry: ['src/index.ts'] });
```

### TypeScript configs

Extend in your `tsconfig.json`:

- `@iamnnort/config/tsconfig/node.json` — Node
- `@iamnnort/config/tsconfig/nest.json` — NestJS
- `@iamnnort/config/tsconfig/browser.json` — Browser

```json
{
  "extends": "@iamnnort/config/tsconfig/node.json"
}
```

## License

MIT
