const QUnit = require('qunit');
const VersionChecker = require('ember-cli-version-checker');
const highlander = require('../force-highlander-addon');

const test = QUnit.test;
const STABLE_FUNCTION_REF = () => {};

['ember-test-waiters', '@ember/test-waiters'].forEach(moduleName => {
  QUnit.module(`force-highlander-addon for ${moduleName}`, function(hooks) {
    hooks.beforeEach(function() {
      this.project = {
        name: 'ember-top-level-package',
        pkg: { version: '1.0.0' },
        isEmberCLIProject: () => {},
        _addonsInitialized: true,
        addons: [
          {
            name: 'baz',
            pkg: { version: '1.0.3' },
            addons: [
              {
                name: moduleName,
                pkg: { version: '1.1.0' },
                addons: [
                  {
                    name: 'foo',
                    version: '1.0.0',
                    addons: [],
                  },
                ],
                treeFor: STABLE_FUNCTION_REF,
                included: STABLE_FUNCTION_REF,
              },
            ],
            treeFor: STABLE_FUNCTION_REF,
            included: STABLE_FUNCTION_REF,
          },
          {
            name: moduleName,
            pkg: { version: '1.0.3' },
            addons: [
              {
                name: 'blarg',
                pkg: { version: '1.1.0' },
                addons: [
                  {
                    name: 'foo',
                    version: '1.0.0',
                    addons: [],
                  },
                ],
                treeFor: STABLE_FUNCTION_REF,
                included: STABLE_FUNCTION_REF,
              },
            ],
            treeFor: STABLE_FUNCTION_REF,
            included: STABLE_FUNCTION_REF,
          },
          {
            name: 'foo',
            pkg: { version: '1.0.0' },
            addons: [
              {
                name: moduleName,
                pkg: { version: '2.0.0' },
                addons: [
                  {
                    name: 'foo',
                    pkg: { version: '1.0.0' },
                    addons: [],
                  },
                ],
                treeFor: STABLE_FUNCTION_REF,
                included: STABLE_FUNCTION_REF,
              },
            ],
          },
          {
            name: 'bar',
            pkg: { version: '1.0.0' },
            addons: [
              {
                name: moduleName,
                pkg: { version: '3.0.1' },
                addons: [
                  {
                    name: 'foo',
                    pkg: { version: '1.0.0' },
                    addons: [],
                  },
                ],
                treeFor: STABLE_FUNCTION_REF,
                included: STABLE_FUNCTION_REF,
              },
            ],
          },
        ],
      };
    });

    test('findLatestVersion can find the latest version from the set', function(assert) {
      let checker = VersionChecker.forProject(this.project);
      let addons = [
        ...checker.filterAddonsByName('ember-test-waiters'),
        ...checker.filterAddonsByName('@ember/test-waiters'),
      ];
      let latestVersion = highlander.findLatestVersion(addons);

      assert.equal(latestVersion.pkg.version, '3.0.1');
    });

    test('forceHighlander nullifies non-latest version addon methods', function(assert) {
      let testWaiterAddons = highlander.forceHighlander(this.project);

      assert.equal(testWaiterAddons.length, 3);
      testWaiterAddons.forEach(addon => {
        assert.notEqual(addon.treeFor, STABLE_FUNCTION_REF);
        assert.notEqual(addon.included, STABLE_FUNCTION_REF);
      });
    });
  });
});
