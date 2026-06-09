'use strict';

const getChannelURL = require('ember-source-channel-url');

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-4.0',
        npm: {
          devDependencies: {
            'ember-cli': '~6.0.1',
            'ember-source': '~4.0.0',
            '@glimmer/component': '^1.0.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-cli': '~6.0.1',
            'ember-source': '~4.12.0',
            '@glimmer/component': '^1.0.0',
          },
        },
      },
      {
        name: 'ember-lts-5.12',
        npm: {
          devDependencies: {
            'ember-cli': '~6.0.1',
            'ember-source': '~5.12.0',
            '@glimmer/component': '^1.0.0',
          },
        },
      },

      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-cli': '^7.0.0',
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-cli': '^7.0.0',
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-cli': '^7.0.0',
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
    ],
  };
};
