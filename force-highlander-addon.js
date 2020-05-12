'use strict';
const semver = require('semver');
const VersionChecker = require('ember-cli-version-checker');

function findLatestVersion(addons) {
  let latestVersion = addons[0];

  addons.forEach(addon => {
    if (semver.gt(addon.pkg.version, latestVersion.pkg.version)) {
      latestVersion = addon;
    }
  });

  return latestVersion;
}

function forceHighlander(project) {
  let checker = VersionChecker.forProject(project);
  let testWaiterAddons = checker.filterAddonsByName('ember-test-waiters');
  let latestVersion = findLatestVersion(testWaiterAddons);
  let noop = () => {};

  return testWaiterAddons
    .map(addon => {
      if (addon === latestVersion) {
        return;
      }

      addon.treeFor = noop;
      addon.included = noop;

      return addon;
    })
    .filter(Boolean);
}

module.exports = {
  findLatestVersion,
  forceHighlander,
};
