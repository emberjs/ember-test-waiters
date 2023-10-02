const QUnit = require('qunit');
const path = require('path');
const Addon = require('ember-cli/lib/models/addon');
const VersionChecker = require('ember-cli-version-checker');
const highlander = require('../force-highlander-addon');
const addonIndex = require('../index');

const test = QUnit.test;
const STABLE_FUNCTION_REF = () => {};

['ember-test-waiters', '@ember/test-waiters'].forEach((moduleName) => {
  QUnit.module(`force-highlander-addon for ${moduleName}`, function (hooks) {
    hooks.beforeEach(function () {
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
                cacheKeyForTree: STABLE_FUNCTION_REF,
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
                cacheKeyForTree: STABLE_FUNCTION_REF,
                treeFor: STABLE_FUNCTION_REF,
                included: STABLE_FUNCTION_REF,
              },
            ],
            cacheKeyForTree: STABLE_FUNCTION_REF,
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
                cacheKeyForTree: STABLE_FUNCTION_REF,
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
                cacheKeyForTree: STABLE_FUNCTION_REF,
                treeFor: STABLE_FUNCTION_REF,
                included: STABLE_FUNCTION_REF,
              },
            ],
          },
        ],
      };
    });

    test('findLatestVersion can find the latest version from the set', function (assert) {
      let checker = VersionChecker.forProject(this.project);
      let addons = [
        ...checker.filterAddonsByName('ember-test-waiters'),
        ...checker.filterAddonsByName('@ember/test-waiters'),
      ];
      let latestVersion = highlander.findLatestVersion(addons);

      assert.equal(latestVersion.pkg.version, '3.0.1');
    });

    test('findLatestVersion can find beta versions', function (assert) {
      let addons = [
        {
          name: 'foo',
          pkg: { version: '1.0.0' },
        },
        {
          name: 'foo',
          pkg: { version: '1.1.0-beta.1' },
        },
      ];
      let latestVersion = highlander.findLatestVersion(addons);

      assert.equal(latestVersion.pkg.version, '1.1.0-beta.1');
    });

    test('forceHighlander nullifies non-latest addon `included` methods', function (assert) {
      let testWaiterAddons = highlander.forceHighlander(this.project);

      assert.equal(testWaiterAddons.length, 3);

      testWaiterAddons.forEach((addon) => {
        assert.notEqual(addon.included, STABLE_FUNCTION_REF);
      });
    });

    test('forceHighlander monkey patches non-latest w/ latest `treeFor`', function (assert) {
      let checker = VersionChecker.forProject(this.project);
      let addons = [
        ...checker.filterAddonsByName('ember-test-waiters'),
        ...checker.filterAddonsByName('@ember/test-waiters'),
      ];
      let latestVersion = highlander.findLatestVersion(addons);

      latestVersion.treeFor = () => {
        assert.step('latest `treeFor` called');
      };

      let nonLatestTestWaiterAddons = highlander.forceHighlander(this.project);

      assert.equal(nonLatestTestWaiterAddons.length, 3);

      nonLatestTestWaiterAddons.forEach((addon) => {
        assert.notEqual(addon.treeFor, STABLE_FUNCTION_REF);
        assert.notEqual(addon.cacheKeyForTree, STABLE_FUNCTION_REF);

        addon.treeFor();
        addon.cacheKeyForTree();
      });

      assert.verifySteps(
        ['latest `treeFor` called', 'latest `treeFor` called', 'latest `treeFor` called'],
        'the latest version treeFor, cacheKeyForTree is called for all non-latest addons'
      );
    });

    test('forceHighlander returns stable cache keys for each addon (`@ember/test-waiters` and `ember-test-waiters`)', function (assert) {
      const AddonCtor = Addon.extend({
        ...addonIndex,
        root: path.resolve(__dirname, '..'),
        // eslint-disable-next-line ember/avoid-leaking-state-in-ember-objects
        pkg: { ...require('../package.json'), version: '5.0.5' },
      });

      const expectedLatest = new AddonCtor(this.project, this.project);
      this.project.addons.push(expectedLatest);

      let checker = VersionChecker.forProject(this.project);
      let addons = [
        ...checker.filterAddonsByName('ember-test-waiters'),
        ...checker.filterAddonsByName('@ember/test-waiters'),
      ];

      let latestVersion = highlander.findLatestVersion(addons);

      assert.strictEqual(latestVersion, expectedLatest);
      assert.ok(latestVersion.cacheKeyForTree().endsWith('@ember/test-waiters'));

      let nonLatestTestWaiterAddons = highlander.forceHighlander(this.project);

      assert.equal(nonLatestTestWaiterAddons.length, 4);

      nonLatestTestWaiterAddons.forEach((addon) => {
        assert.ok(addon.cacheKeyForTree().endsWith(moduleName));

        assert.strictEqual(
          latestVersion.cacheKeyForTree().replace('@ember/test-waiters', moduleName),
          addon.cacheKeyForTree()
        );
      });
    });
  });
});
