import { module, test } from 'qunit';
import { _reset, waitForCoroutine, getPendingWaiterState } from 'ember-test-waiters';
import MockStableError, { resetError, overrideError } from './utils/mock-stable-error';
import { task } from 'ember-concurrency-decorators';
import EmberObject, { get } from '@ember/object';
import { task as taskFn } from 'ember-concurrency';
import { DEBUG } from '@glimmer/env';

if (DEBUG) {
  module('wait-for-coroutine', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    class DecoratorThing {
      @task
      @waitForCoroutine
      *doAsyncStuff(...args: any) {
        yield new Promise(resolve => {
          resolve();
        });
        return [this, ...args];
      }

      @task
      @waitForCoroutine
      *asyncThrow() {
        yield new Promise(resolve => {
          resolve();
        });
        throw new Error('doh!');
      }
    }

    class FunctionThing extends EmberObject.extend({
      doAsyncStuff: taskFn(
        waitForCoroutine(function* doAsyncStuff(this: FunctionThing, ...args: any) {
          yield new Promise(resolve => {
            resolve();
          });
          return [this, ...args];
        })
      ),

      asyncThrow: taskFn(
        waitForCoroutine(function* asyncThrow() {
          yield new Promise(resolve => {
            resolve();
          });
          throw new Error('doh!');
        })
      ),
    }) {}

    let thing: DecoratorThing | FunctionThing;

    function runTests() {
      test('waitForCoroutine wraps and registers a waiter', async function(assert) {
        overrideError(MockStableError);

        // @ts-ignore
        let promise: Promise<{}> = get(thing, 'doAsyncStuff').perform();

        assert.deepEqual(getPendingWaiterState(), {
          pending: 1,
          waiters: {
            'coroutine-waiter': [
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

      test('waitForCoroutine handles arguments and return value', async function(assert) {
        overrideError(MockStableError);

        // @ts-ignore
        let ret = await get(thing, 'doAsyncStuff').perform(1, 'foo');
        assert.deepEqual(ret, [thing, 1, 'foo']);
      });

      test('waitForCoroutine transitions waiter to not pending even if coroutine throws', async function(assert) {
        // @ts-ignore
        await get(thing, 'doAsyncStuff')
          .perform()
          .catch(() => null);
        assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
      });
    }

    module('decorator', function(hooks) {
      hooks.beforeEach(function() {
        thing = new DecoratorThing();
      });

      runTests();
    });

    module('function', function(hooks) {
      hooks.beforeEach(function() {
        thing = FunctionThing.create();
      });

      runTests();
    });
  });
}
