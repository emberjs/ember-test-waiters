import { module, test } from 'qunit';
import { Promise } from 'rsvp';
import { _reset, waitForPromise, getPendingWaiterState } from 'ember-test-waiters';
import MockStableError, { resetError, overrideError } from './utils/mock-stable-error';
import { DEBUG } from '@glimmer/env';

if (DEBUG) {
  module('wait-for-promise', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    test('waitForPromise wraps and registers a waiter', async function(assert) {
      let promise: Promise<{}> = new Promise(resolve => {
        resolve();
      });

      overrideError(MockStableError);

      promise = waitForPromise(promise);

      assert.deepEqual(getPendingWaiterState(), {
        pending: 1,
        waiters: {
          'promise-waiter': [
            {
              label: undefined,
              stack: 'STACK',
            },
          ],
        },
      });

      await promise.then(() => {
        assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
      });
    });

    test('waitForPromise transitions waiter to not pending even if promise throws', async function(assert) {
      let promise: Promise<{}> = new Promise(() => {
        throw new Error('Promise threw');
      });

      try {
        await waitForPromise(promise).then();
      } catch (e) {
        assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
      }
    });

    test('waitForPromise transitions waiter to not pending even if promise throws when thenable wrapped', async function(assert) {
      let promise: Promise<{}> = new Promise(() => {
        throw new Error('Promise threw');
      });

      try {
        await waitForPromise(promise.then());
      } catch (e) {
        assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
      }
    });
  });
}
