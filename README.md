# @iamnnort/config

Config presets for Node.js — **Consistent** · **Reusable** · **Streamlined**

## Install

```bash
yarn add -D @iamnnort/config
# or
npm i -D @iamnnort/config
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

### HTTP

Utilities for building HTTP log messages (axios request/response/error) and shared enums:

```js
const { HttpMessageBuilder, HttpMethods, HttpStatuses } = require('@iamnnort/config/http');

const message = new HttpMessageBuilder({ request, response }).makeUrlText().makeMethodText().build();
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

MIT © [Nikita Pavets](https://github.com/iamnnort)
