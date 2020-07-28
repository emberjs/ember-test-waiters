'use strict';

const forceHighlander = require('./force-highlander-addon').forceHighlander;

module.exports = {
  name: require('./package').name,

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
