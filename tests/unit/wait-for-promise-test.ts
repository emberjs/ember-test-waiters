import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import { _reset, getPendingWaiterState, waitForPromise } from '@ember/test-waiters';
import { module, test } from 'qunit';

import { DEBUG } from '@glimmer/env';
import RSVP from 'rsvp';

if (DEBUG) {
  module('wait-for-promise', function (hooks) {
    hooks.afterEach(function () {
      _reset();
      resetError();
    });

    module(`Implementation: Native Promise`, function () {
      hooks.afterEach(function () {
        _reset();
        resetError();
      });

      test('waitForPromise wraps and registers a waiter', async function (assert) {
        let promise = new Promise((resolve) => {
          resolve();
        });

        overrideError(MockStableError);

        promise = waitForPromise(promise);

        assert.deepEqual(getPendingWaiterState(), {
          pending: 1,
          waiters: {
            '@ember/test-waiters:promise-waiter': [
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

      test('waitForPromise transitions waiter to not pending even if promise throws', async function (assert) {
        let promise = Promise.resolve().then(() => {
          throw new Error('Promise threw');
        });

        try {
          await waitForPromise(promise).then();
        } catch (e) {
          assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
        }
      });

      test('waitForPromise transitions waiter to not pending even if promise throws when thenable wrapped', async function (assert) {
        let promise = Promise.resolve().then(() => {
          throw new Error('Promise threw');
        });

        try {
          await waitForPromise(promise.then());
        } catch (e) {
          assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
        }
      });
    });

    module(`Implementation: RSVP.Promise`, function () {
      hooks.afterEach(function () {
        _reset();
        resetError();
      });

      test('waitForPromise wraps and registers a waiter', async function (assert) {
        let promise = new RSVP.Promise((resolve) => {
          resolve();
        });

        overrideError(MockStableError);

        promise = waitForPromise(promise);

        assert.deepEqual(getPendingWaiterState(), {
          pending: 1,
          waiters: {
            '@ember/test-waiters:promise-waiter': [
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

      test('waitForPromise transitions waiter to not pending even if promise throws', async function (assert) {
        let promise = RSVP.Promise.resolve().then(() => {
          throw new Error('Promise threw');
        });

        try {
          await waitForPromise(promise).then();
        } catch (e) {
          assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
        }
      });

      test('waitForPromise transitions waiter to not pending even if promise throws when thenable wrapped', async function (assert) {
        let promise = RSVP.Promise.resolve().then(() => {
          throw new Error('Promise threw');
        });

        try {
          await waitForPromise(promise.then());
        } catch (e) {
          assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
        }
      });
    });
  });
}
