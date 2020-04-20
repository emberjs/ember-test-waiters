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

      Additionally, we're also intentionally not calling any of the extra warn
      messages in `compileAddon` https://github.com/ember-cli/ember-cli/blob/master/lib/models/addon.js#L1157
      of the addon module in ember-cli. We also don't have (or intend to have) any
      templates in this repository, hence not compiling templates.
    */

    return this.processedAddonJsFiles(tree);
  },
};
