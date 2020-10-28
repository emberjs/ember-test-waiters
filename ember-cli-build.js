'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    autoImport: {
      exclude: ['qunit'],
    },
  });

  app.import('node_modules/qunit/qunit/qunit.js', {
    type: 'test',
  });

  app.import('node_modules/qunit/qunit/qunit.css', {
    type: 'test',
  });

  app.import('vendor/shims/qunit.js', { type: 'test' });

  return app.toTree();
};
