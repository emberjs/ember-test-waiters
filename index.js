'use strict';

const { cacheKeyForStableTree: cacheKeyForTree } = require('calculate-cache-key-for-tree');
const { forceHighlander } = require('./force-highlander-addon');

module.exports = {
  name: require('./package').name,

  cacheKeyForTree,

  included() {
    this._super.included.apply(this, arguments);
    forceHighlander(this.project);
  },

  treeForAddon(tree) {
    /*
      We're intentionally not calling super here in order to correctly output
      multiple modules (@ember/test-helpers and ember-test-helpers).
    */
    let babel = this.addons.find(a => a.name === 'ember-cli-babel');

    return babel.transpileTree(tree);
  },
};
