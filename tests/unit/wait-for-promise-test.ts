import { module, test } from 'qunit';
import { Promise } from 'rsvp';
import { _reset, waitForPromise, getPendingWaiterState } from 'ember-test-waiters';
import MockStableError, { resetError, overrideError } from './utils/mock-stable-error';
import EmberObject from '@ember/object';
import { DEBUG } from '@glimmer/env';

if (DEBUG) {
  module('wait-for-promise', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    let createPromise: Function;
    let createThrowingPromise: Function;

    function runTests() {
      test('waitForPromise wraps and registers a waiter', async function(assert) {
        overrideError(MockStableError);

        let promise: Promise<{}> = createPromise();

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

      test('waitForPromise handles arguments and return value', async function(assert) {
        overrideError(MockStableError);

        // @ts-ignore
        let ret = await createPromise(1, 'foo');
        assert.deepEqual(ret, ['foo', 1]);
      });

      test('waitForPromise transitions waiter to not pending even if promise throws', async function(assert) {
        let promise: Promise<{}> = createThrowingPromise();

        try {
          await promise.then();
        } catch (e) {
          assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
        }
      });
    }

    module('function', function(hooks) {
      hooks.beforeEach(function() {
        createPromise = (...args: any[]) => {
          let promise: Promise<{}> = new Promise(resolve => {
            resolve(Array.from(args).reverse());
          });
          return waitForPromise(promise);
        };

        createThrowingPromise = () => {
          let promise: Promise<{}> = Promise.resolve().then(() => {
            throw new Error('Promise threw');
          });
          return waitForPromise(promise);
        };
      });

      runTests();

      test('waitForPromise transitions waiter to not pending even if promise throws when thenable wrapped', async function(assert) {
        let promise: Promise<{}> = Promise.resolve().then(() => {
          throw new Error('Promise threw');
        });

        try {
          await waitForPromise(promise.then());
        } catch (e) {
          assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
        }
      });
    });

    module('class function', function(hooks) {
      class Thing extends EmberObject.extend({
        doAsyncStuff: waitForPromise(async function doAsyncStuff(...args: any) {
          await new Promise(resolve => {
            resolve();
          });
          return Array.from(args).reverse();
        }),

        asyncThrow: waitForPromise(async function asyncThrow() {
          await new Promise(resolve => {
            resolve();
          });
          throw new Error('doh!');
        }),
      }) {}

      let thing = Thing.create();

      hooks.beforeEach(function() {
        createPromise = (...args: any[]) => thing.doAsyncStuff(...args);
        createThrowingPromise = () => thing.asyncThrow();
      });

      runTests();

      test('calls method with the correct this value', async function(assert) {
        class Thing2 extends EmberObject.extend({
          doAsyncStuff: waitForPromise(async function doAsyncStuff(this: any) {
            await new Promise(resolve => {
              resolve();
            });
            return this;
          }),
        }) {}
        let thing2 = Thing2.create();

        let thisVal = await thing2.doAsyncStuff();
        assert.equal(thisVal, thing2);
      });
    });

    module('decorator', function(hooks) {
      class Thing {
        @waitForPromise
        async doAsyncStuff(...args: any) {
          await new Promise(resolve => {
            resolve();
          });
          return Array.from(args).reverse();
        }

        @waitForPromise
        async asyncThrow() {
          await new Promise(resolve => {
            resolve();
          });
          throw new Error('doh!');
        }
      }
      let thing = new Thing();

      hooks.beforeEach(function() {
        createPromise = (...args: any[]) => thing.doAsyncStuff(...args);
        createThrowingPromise = () => thing.asyncThrow();
      });

      runTests();

      test('calls method with the correct this value', async function(assert) {
        class Thing2 {
          @waitForPromise
          async doAsyncStuff(this: any) {
            await new Promise(resolve => {
              resolve();
            });
            return this;
          }
        }
        let thing2 = new Thing2();

        let thisVal = await thing2.doAsyncStuff();
        assert.equal(thisVal, thing2);
      });
    });
  });
}
