'use strict';

const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
const { forceHighlander } = require('./force-highlander-addon');

module.exports = {
  name: require('./package').name,

  /**
   * Returns a stable cache key with the addon name appended
   *
   * Because this addon eventually forces highlander for both `@ember/test-waiters`
   * and `ember-test-waiters` we need to append the addon's name here; the end result
   * is that we get a different stable cache key, one for `@ember/test-waiters` and
   * another for `ember-test-waiters`
   *
   * The reason for this is that Embroider doesn't currently take into account the addon's
   * name when dealing with cache keys internally & as a result, it gets confused that
   * (seemingly) two different addons have the same cache key. This will eventually be fixed
   * in Embroider, but in the short-term we're implementing this here to account for this issue.
   *
   * @name cacheKeyForTree
   * @param {string} treeType
   * @returns {string} the stable cache key
   */
  cacheKeyForTree(treeType) {
    return `${calculateCacheKeyForTree(treeType, this)}-${this.name}`;
  },

  included() {
    this._super.included.apply(this, arguments);
    forceHighlander(this.project);
  },

  treeForAddon(tree) {
    /*
      We're intentionally not calling super here in order to correctly output
      multiple modules (@ember/test-helpers and ember-test-helpers).
    */
    let babel = this.addons.find((a) => a.name === 'ember-cli-babel');

    let input;

    // ember-cli-typescript should ultimately handle this for us.
    if (this.isDevelopingAddon()) {
      const { BroccoliBabelPresetTypeScript } = require('broccoli-babel-preset-typescript'); // eslint-disable-line node/no-unpublished-require
      input = new BroccoliBabelPresetTypeScript([tree]);
    } else {
      input = tree;
    }
    return babel.transpileTree(input);
  },
};
