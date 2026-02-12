# @iamnnort/config

Config library — shared ESLint, Prettier, lint-staged, esbuild, tsup, and TypeScript configs for Node.js projects.

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
// or with overrides
module.exports = config({ import: true });
```

### Prettier

```js
// prettier.config.js
module.exports = require('@iamnnort/config/prettier')();
```

### Lint-staged

```js
// lint-staged.config.js
module.exports = require('@iamnnort/config/lint-staged')();
```

### Esbuild

```js
const build = require('@iamnnort/config/esbuild');
build({ entryPoints: ['./src/index.ts'] });
```

### Tsup

```js
// tsup.config.js
module.exports = require('@iamnnort/config/tsup')({ entry: ['src/index.ts'] });
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
