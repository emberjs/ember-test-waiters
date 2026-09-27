'use strict';

const getChannelURL = require('ember-source-channel-url');

// Older versions of these packages do not support ember-source 7.
const emberSevenDependencies = {
  '@ember/test-helpers': '^5.5.0',
  'ember-auto-import': '^2.13.1',
  'ember-cli': '~7.3.0',
  'ember-cli-babel': '^8.3.2',
  'ember-cli-htmlbars': '^7.0.1',
  'ember-qunit': '^9.1.0',
};

// @embroider/compat 3 cannot build ember-source 7.
const emberSevenEnv = { FORCE_CLASSIC: 'true' };

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-4.0',
        npm: {
          devDependencies: {
            'ember-source': '~4.0.0',
            '@glimmer/component': '^1.0.0',
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
        env: emberSevenEnv,
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('release'),
            ...emberSevenDependencies,
          },
        },
      },
      {
        name: 'ember-beta',
        env: emberSevenEnv,
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('beta'),
            ...emberSevenDependencies,
          },
        },
      },
      {
        name: 'ember-canary',
        env: emberSevenEnv,
        npm: {
          devDependencies: {
            'ember-source': await getChannelURL('canary'),
            ...emberSevenDependencies,
          },
        },
      },
    ],
  };
};
