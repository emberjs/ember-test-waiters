'use strict';

const getChannelURL = require('ember-source-channel-url');

function embroider(label, deps) {
  return [
    {
      name: `${label}-embroider-safe`,
      npm: {
        devDependencies: {
          ...deps,

          // Webpack is a peer dependency of `@embroider/webpack`
          webpack: '^5.0.0',
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

          // Webpack is a peer dependency of `@embroider/webpack`
          webpack: '^5.0.0',
        },
      },
      env: {
        EMBROIDER_TEST_SETUP_OPTIONS: 'optimized',
      },
    },
  ];
}

const EMBROIDER_VERSION = '^0.43.4';
const oldEmbroider = embroider('0.x', {
  '@embroider/core': EMBROIDER_VERSION,
  '@embroider/webpack': EMBROIDER_VERSION,
  '@embroider/compat': EMBROIDER_VERSION,
  '@embroider/test-setup': EMBROIDER_VERSION,
});

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
        name: 'ember-lts-3.8',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.0.0',
            'ember-source': '~3.8.0',
            'ember-resolver': '^5.0.1',
            'ember-cli': '^4.10.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      {
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            '@ember/test-helpers': '^2.0.0',
            'ember-source': '~3.12.0',
            'ember-resolver': '^5.0.1',
            'ember-cli': '^4.10.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
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
            '@types/ember__owner': '^4.0.3',
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
            '@types/ember__owner': '^4.0.3',
            'ember-resolver': '^10.0.0',
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      {
        name: 'ember-default-with-jquery',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.6.0',
            'ember-fetch': null,
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          ember: {
            edition: 'classic',
          },
        },
      },
      {
        name: 'ember-default',
        npm: {
          devDependencies: {},
        },
      },
      ...oldEmbroider,
      ...v3Embroider,
    ],
  };
};
