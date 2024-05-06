'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function (defaults) {
  const app = new EmberApp(defaults, {
    'ember-cli-babel': { enableTypeScriptTransform: true },

    // Add options here
  });

  if (process.env.EMBROIDER) {
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
  }

  return app.toTree();
};
