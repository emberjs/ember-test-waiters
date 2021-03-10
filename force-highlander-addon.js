'use strict';
const semver = require('semver');
const VersionChecker = require('ember-cli-version-checker');
const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');

function findLatestVersion(addons) {
  let latestVersion = addons[0];

  addons.forEach((addon) => {
    if (semver.gt(addon.pkg.version, latestVersion.pkg.version)) {
      latestVersion = addon;
    }
  });

  return latestVersion;
}

function forceHighlander(project) {
  let checker = VersionChecker.forProject(project);
  let testWaiterAddons = [
    ...checker.filterAddonsByName('ember-test-waiters'),
    ...checker.filterAddonsByName('@ember/test-waiters'),
  ];
  let latestVersion = findLatestVersion(testWaiterAddons);
  let noop = () => {};

  return testWaiterAddons
    .map((addon) => {
      if (addon === latestVersion) {
        return;
      }

      addon.cacheKeyForTree = (treeType) => {
        // because this is overriding _both_ `@ember/test-waiters` and `ember-test-waiters`
        // we need to append the addon's name here; the end result is that we get a different
        // stable cache key, one for `@ember/test-waiters` and another for `ember-test-waiters`
        // the reason for this is that Embroider doesn't currently take into account the addon's
        // name when dealing with cache keys internally & as a result, it gets confused that
        // (seemingly) two different addons have the same cache key. this will be fixed in Embroider,
        // but in the short-term we're implementing this here to account for this issue
        return `${calculateCacheKeyForTree(treeType, latestVersion)}-${addon.name}`;
      };

      addon.treeFor = (...args) => {
        return latestVersion.treeFor(...args);
      };

      addon.included = noop;

      return addon;
    })
    .filter(Boolean);
}

module.exports = {
  findLatestVersion,
  forceHighlander,
};
