'use strict';

const getChannelURL = require('ember-source-channel-url');

function embroider(label, deps) {
  return [
    {
      name: `${label}-embroider-safe`,
      npm: {
        devDependencies: {
          ...deps,
        },
      },
      env: {
        EMBROIDER_TEST_SETUP_OPTIONS: 'safe',
      },
    },
    {
      name: `${label}-embroider-optimized`,
      npm: {
        devDependencies: {
          ...deps,
        },
      },
      env: {
        EMBROIDER_TEST_SETUP_OPTIONS: 'optimized',
      },
    },
  ];
}

const v3Embroider = embroider('3.x', {
  '@embroider/core': `^3.4.2`,
  '@embroider/webpack': `^3.2.1`,
  '@embroider/compat': `^3.4.0`,
  '@embroider/test-setup': `^3.0.3`,
});

module.exports = async function () {
  return {
    usePnpm: true,
    scenarios: [
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.0.0',
            'ember-source': '~3.16.0',
            'ember-cli': '^4.10.0',
          },
        },
      },
      {
        name: 'ember-lts-3.20',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.0.0',
            'ember-source': '~3.20.0',
            'ember-cli': '^4.10.0',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.0.0',
            'ember-source': '~3.24.0',
            'ember-cli': '^4.10.0',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.0.0',
            'ember-source': '~3.28.0',
            'ember-cli': '^4.10.0',
          },
        },
      },
      {
        name: 'ember-lts-4.12',
        npm: {
          devDependencies: {
            'ember-source': '~4.12.0',
          },
        },
      },
      {
        name: 'ember-lts-5.4',
        npm: {
          devDependencies: {
            'ember-source': '~5.4.0',
          },
        },
      },

      {
        name: 'ember-release',
        npm: {
          dependencies: {
            'ember-auto-import': '^2.2.0',
            webpack: '^5.0.0',
          },
          devDependencies: {
            'ember-source': await getChannelURL('release'),
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          dependencies: {
            'ember-auto-import': '^2.2.0',
            webpack: '^5.0.0',
          },
          devDependencies: {
            'ember-resolver': '^10.0.0',
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          dependencies: {
            'ember-auto-import': '^2.2.0',
            webpack: '^5.0.0',
          },
          devDependencies: {
            'ember-resolver': '^10.0.0',
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      ...v3Embroider,
    ],
  };
};
