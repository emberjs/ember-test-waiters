import { deprecate } from '@ember/debug';

deprecate(
  'Importing from ember-test-waiters is deprecated. Please import from @ember/test-waiters',
  true,
  {
    id: 'ember-test-waiters-legacy-module-name',
    until: '3.0.0',
  }
);

export * from '@ember/test-waiters';
