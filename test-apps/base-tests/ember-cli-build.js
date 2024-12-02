'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const CLASSIC_ONLY = new Set([
  'ember-lts-3.16',
  'ember-lts-3.28',
  'ember-lts-3.20',
  'ember-lts-3.24',
]);

module.exports = function(defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },
    autoImport: {
      forbidEval: true,
      // for classic mode
      watchDependencies: ['@ember/test-waiters'],
    },
    // Add options here
  });

  if (
    CLASSIC_ONLY.has(process.env.EMBER_TRY_CURRENT_SCENARIO) ||
    process.env.FORCE_CLASSIC
  ) {
    // Embroider does not support < 3.28
    return app.toTree();
  }

  const { Webpack } = require('@embroider/webpack');

  return require('@embroider/compat').compatBuild(app, Webpack, {
    extraPublicTrees: [],
    staticAddonTrees: true,
    staticAddonTestSupportTrees: true,
    staticHelpers: true,
    staticModifiers: true,
    staticComponents: true,
    staticEmberSource: true,
    packagerOptions: {
      webpackConfig: {
        // Highest fidelity source map (at the cost of build speed)
        devtool: 'source-map',
      },
    },
  });
};
