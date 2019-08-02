import Ember from 'ember';
import { gte } from 'ember-compatibility-helpers';
import { DEBUG } from '@glimmer/env';
import { hasPendingWaiters } from './waiter-manager';

if (DEBUG && !gte('@ember/test-helpers', '1.6.0')) {
  Ember.Test.registerWaiter(hasPendingWaiters);
}

export {
  register,
  unregister,
  getWaiters,
  _reset,
  getPendingWaiterState,
  hasPendingWaiters,
} from './waiter-manager';

export { default as TestWaiter } from './test-waiter';
export { default as buildWaiter } from './build-waiter';
export { default as waitForPromise } from './wait-for-promise';

export * from './types';
