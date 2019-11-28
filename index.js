'use strict';

const forceHighlander = require('./force-highlander-addon').forceHighlander;
const StripWrappers = require('./babel-plugin-strip-wrappers');
const semver = require('semver');

module.exports = {
  name: require('./package').name,

  included() {
    this._super.included.apply(this, arguments);

    forceHighlander(this.project);

    let app = this._findHost();
    if (!app.tests) {
      let babelAddon = this.parent.addons.find(a => a.name === 'ember-cli-babel');
      let babelVersion = babelAddon && babelAddon.pkg.version;
      if (babelVersion && semver.gte(babelVersion, '7.0.0')) {
        app.options.babel = app.options.babel || {};
        app.options.babel.plugins = app.options.babel.plugins || [];
        app.options.babel.plugins.unshift([StripWrappers, { legacy: true }]);
      }
    }
  },

  _findHost() {
    let current = this;
    let app;

    // Keep iterating upward until we don't have a grandparent.
    // Has to do this grandparent check because at some point we hit the project.
    do {
      app = current.app || app;
    } while (current.parent.parent && (current = current.parent));

    return app;
  },
};
