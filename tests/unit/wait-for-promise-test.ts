import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import { _reset, getPendingWaiterState, waitForPromise } from 'ember-test-waiters';
import { module, test } from 'qunit';

import { DEBUG } from '@glimmer/env';
import RSVP from 'rsvp';

if (DEBUG) {
  module('wait-for-promise', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    let promiseImplementations = [
      { name: 'Native', CurrentPromise: Promise },
      { name: 'RSVP', CurrentPromise: RSVP.Promise },
    ];

    for (let implementation of promiseImplementations) {
      // Gets around the issue where TS says:
      //
      // Each member of the union type 'PromiseConstructor | typeof RSVP.Promise' has
      // construct signatures, but none of those signatures are compatible with each other.
      //
      // In practice, RSVP.Promise and Native Promise are the exact same when it comes
      // using waitForPromise.
      //
      // All of the below code is 100% type correct when 'CurrentPromise' is _either_
      // Promise, or RSVP.Promise, but not Promise | RSVP.Promise
      let { name, CurrentPromise } = (implementation as any) as {
        name: string;
        CurrentPromise: typeof Promise;
      };
      module(`Implementation: ${name}`, function() {
        hooks.afterEach(function() {
          _reset();
          resetError();
        });

        test('waitForPromise wraps and registers a waiter', async function(assert) {
          let promise = new CurrentPromise(resolve => {
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
          let promise = CurrentPromise.resolve().then(() => {
            throw new Error('Promise threw');
          });

          try {
            await waitForPromise(promise).then();
          } catch (e) {
            assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
          }
        });

        test('waitForPromise transitions waiter to not pending even if promise throws when thenable wrapped', async function(assert) {
          let promise = CurrentPromise.resolve().then(() => {
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
  });
}
