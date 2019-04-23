import { module, test } from 'qunit';
import { Promise } from 'rsvp';
import { TestWaiter, _reset, getWaiters, getPendingWaiterState } from 'ember-test-waiters';
import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';

module('test-waiter', function(hooks) {
  hooks.afterEach(function() {
    _reset();
    resetError();
  });

  test('test waiter can be instantiated with a name', function(assert) {
    let name = 'my-waiter';
    let waiter = new TestWaiter(name);

    assert.equal(waiter.name, name);
  });

  test('test waiters automatically register when beginAsync is invoked', function(assert) {
    let waiter = new TestWaiter('my-waiter');
    let waiterItem = {};

    waiter.beginAsync(waiterItem);

    let registeredWaiters = getWaiters();

    assert.equal(registeredWaiters[0], waiter, 'The waiter is registered');
    assert.deepEqual(
      (<TestWaiter<object>>registeredWaiters[0]).items.keys().next().value,
      {},
      'Waiter item is in items'
    );
  });

  test('test waiters removes item from items map when endAsync is invoked', function(assert) {
    let waiter = new TestWaiter('my-waiter');
    let waiterItem = {};

    waiter.beginAsync(waiterItem);
    waiter.endAsync(waiterItem);
    let registeredWaiters = getWaiters();

    assert.equal((<TestWaiter<object>>registeredWaiters[0]).items.size, 0);
  });

  test('endAsync will throw if a prior call to beginAsync with the same waiter item did not occur', function(assert) {
    let waiter = new TestWaiter('my-waiter');
    let waiterItem = {};

    assert.throws(
      () => {
        waiter.endAsync(waiterItem);
      },
      Error,
      /endAsync called for [object Object] but item is not currently pending./
    );
  });

  test('waitUntil returns the correct value if the waiter should wait', function(assert) {
    let waiter = new TestWaiter('my-waiter');
    let waiterItem = {};

    assert.ok(waiter.waitUntil(), 'waitUntil returns true');

    waiter.beginAsync(waiterItem);

    assert.notOk(waiter.waitUntil(), 'waitUntil returns false');

    waiter.endAsync(waiterItem);

    assert.ok(waiter.waitUntil(), 'waitUntil returns true');
  });

  test('waiter contains debug info for a waiter item', function(assert) {
    let waiter = new TestWaiter('my-waiter');
    let waiterItem = {};

    overrideError(MockStableError);

    waiter.beginAsync(waiterItem);

    assert.deepEqual(waiter.debugInfo(), [{ label: undefined, stack: 'STACK' }]);
  });

  test('waiter executes beginAsync and endAsync at the correct times in relation to thenables', async function(assert) {
    const promiseWaiter = new TestWaiter('promise-waiter');
    function waitForPromise<T>(promise: Promise<T>, label?: string) {
      let result = promise;

      assert.step('Waiter began async tracking');
      promiseWaiter.beginAsync(promise, label);

      result = promise.then(
        value => {
          assert.step('Waiter ended async tracking');
          promiseWaiter.endAsync(promise);
          return value;
        },
        error => {
          promiseWaiter.endAsync(promise);
          throw error;
        }
      );

      return result;
    }

    let promise: Promise<{}> = new Promise(resolve => {
      assert.step('Promise resolving');
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

    await promise
      .then(() => {
        assert.step('Promise thennables run');
        assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
      })
      .then(() => {
        assert.step('All thenables are run');
      });

    assert.verifySteps([
      'Promise resolving',
      'Waiter began async tracking',
      'Waiter ended async tracking',
      'Promise thennables run',
      'All thenables are run',
    ]);
  });
});
