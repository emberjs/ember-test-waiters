'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
            '@ember/string': '^3.0.0',
            '@ember/test-helpers': '^2.9.3',
            '@glimmer/component': '^1.0.0',
            'ember-cli': '~3.28.0',
            'ember-cli-app-version': '^5.0.0',
            'ember-qunit': '^5.0.0',
            'ember-resolver': '~8.0.0',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.11',
            '@ember/string': '^3.0.0',
            '@ember/test-helpers': '^2.9.3',
            '@glimmer/component': '^1.0.0',
            'ember-cli': '~3.28.0',
            'ember-qunit': '^6.0.0',
            'ember-resolver': '~8.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
            '@glimmer/component': '^1.0.0',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-source': '~5.12.0',
            '@glimmer/component': '^1.0.0',
          },
        },
      },

      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
    ],
  };
};
