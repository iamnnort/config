const { build } = require('esbuild');
const esbuildPluginTsc = require('esbuild-plugin-tsc');

const env = require('../env');

const DEFAULT_OUTPUT_DIR = './dist';

module.exports = (config = {}) => {
  const esbuild = resolveConfig(config);

  let output;

  if (Array.isArray(esbuild.entryPoints)) {
    if (esbuild.entryPoints.length > 1) {
      output = { outdir: DEFAULT_OUTPUT_DIR };
    } else {
      output = { outfile: `${DEFAULT_OUTPUT_DIR}/index.js` };
    }
  } else {
    output = { outdir: DEFAULT_OUTPUT_DIR };
  }

  return build({
    ...output,
    ...esbuild,
  });
};

function resolveConfig(config) {
  return env.development ? getDevConfig(config.dev || {}) : getProdConfig(config.prod || {});
}

function getCommonConfig() {
  return {
    bundle: true,
    external: ['aws-sdk', '@nestjs/microservices', '@nestjs/websockets', 'class-transformer', 'class-validator'],
    platform: 'node',
    plugins: [esbuildPluginTsc({ force: true })],
    sourcemap: true,
    target: 'node22',
  };
}

function getDevConfig(override = {}) {
  const common = getCommonConfig();

  let plugins = common.plugins || [];

  if (Array.isArray(override.plugins)) {
    plugins = [...override.plugins, ...plugins];
  }

  delete common.plugins;

  let external = common.external || [];

  if (Array.isArray(override.external)) {
    external = [...override.external, ...external];
  }

  delete common.external;

  return {
    ...common,
    ...override,
    external,
    plugins,
  };
}

function getProdConfig(override = {}) {
  const common = getCommonConfig();

  let plugins = common.plugins || [];

  if (Array.isArray(override.plugins)) {
    plugins = [...override.plugins, ...plugins];
  }

  delete common.plugins;

  let external = common.external || [];

  if (Array.isArray(override.external)) {
    external = [...override.external, ...external];
  }

  delete common.external;

  return {
    ...common,
    minifyIdentifiers: false,
    minifySyntax: true,
    minifyWhitespace: true,
    ...override,
    external,
    plugins,
  };
}
