import MockStableError, {
  overrideError,
  resetError,
} from './utils/mock-stable-error';
import {
  _reset,
  _resetWaiterNames,
  buildWaiter,
  getPendingWaiterState,
  getWaiters,
} from '@ember/test-waiters';
import { module, test } from 'qunit';

// @ts-ignore
import { Promise } from 'rsvp';
import Token from '@ember/test-waiters/__private__/token';
import { registerWarnHandler } from '@ember/debug';

module('build-waiter', function (hooks) {
  hooks.afterEach(function () {
    _reset();
    _resetWaiterNames();
    resetError();
    registerWarnHandler(() => {});
  });

  test('test waiter can be instantiated with a namespace only', function (assert) {
    const name = 'my-addon';
    const waiter = buildWaiter(name);

    assert.equal(waiter.name, name);
  });

  test('test waiter can be instantiated with a namespace and descriptor', function (assert) {
    const name = 'my-addon:my-waiter';
    const waiter = buildWaiter(name);

    assert.equal(waiter.name, name);
  });

  test('test waiters will warn when waiter name is used more than once', function (assert) {
    registerWarnHandler((message, options) => {
      console.log('message', message);
      assert.equal(
        message,
        "The waiter name '@ember/test-waiters:first' is already in use",
      );
      assert.equal(options?.id, '@ember/test-waiters.duplicate-waiter-name');
    });

    buildWaiter('@ember/test-waiters:first');
    buildWaiter('@ember/test-waiters:first');
  });

  test('test waiters return a token from beginAsync when no token provided', function (assert) {
    const waiter = buildWaiter('my-addon:my-waiter');

    const token = waiter.beginAsync();

    assert.ok(token instanceof Token, 'A token was returned from beginAsync');
  });

  test('test waiters return a truthy token from beginAsync when no token provided', function (assert) {
    const waiter = buildWaiter('my-addon:my-waiter');

    const token = waiter.beginAsync();

    assert.ok(token, 'A token was returned from beginAsync and is truthy');
  });

  test('test waiters automatically register when beginAsync is invoked when no token provided', function (assert) {
    const waiter = buildWaiter('my-addon:my-waiter');

    waiter.beginAsync();

    const registeredWaiters = getWaiters();

    assert.equal(registeredWaiters[0], waiter, 'The waiter is registered');
  });

  test('test waiters automatically register when beginAsync is invoked using a custom token', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const waiterItem = {};

    waiter.beginAsync(waiterItem);

    const registeredWaiters = getWaiters();

    assert.equal(registeredWaiters[0], waiter, 'The waiter is registered');
  });

  test('test waiters removes item from items map when endAsync is invoked', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');

    const token = waiter.beginAsync();
    waiter.endAsync(token);
    const registeredWaiters = getWaiters();

    assert.equal((registeredWaiters[0] as any).items.size, 0);
  });

  test('test waiters removes item from items map when endAsync is invoked using a custom token', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const waiterItem = {};

    waiter.beginAsync(waiterItem);
    waiter.endAsync(waiterItem);
    const registeredWaiters = getWaiters();

    assert.equal((registeredWaiters[0] as any).items.size, 0);
  });

  test('beginAsync will throw if a prior call to beginAsync with the same token occurred', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');

    assert.throws(
      () => {
        const token = waiter.beginAsync();
        waiter.beginAsync(token);
      },
      Error,
      /beginAsync called for [object Object] but item already pending./,
    );
  });

  test('beginAsync will throw if a prior call to beginAsync with the same token occurred', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const token = {};

    assert.throws(
      () => {
        waiter.beginAsync(token);
        waiter.beginAsync(token);
      },
      Error,
      /beginAsync called for [object Object] but item already pending./,
    );
  });

  test('endAsync will throw if a prior call to beginAsync with the same token did not occur', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const token = 0;

    assert.throws(
      () => {
        waiter.endAsync(token);
      },
      Error,
      /endAsync called for [object Object] but item is not currently pending./,
    );
  });

  test('endAsync will throw if a prior call to beginAsync with the same token did not occur using custom token', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const waiterItem = {};

    assert.throws(
      () => {
        waiter.endAsync(waiterItem);
      },
      Error,
      /endAsync called for [object Object] but item is not currently pending./,
    );
  });

  test('endAsync will not throw if endAsync called twice in a row with the same token', function (assert) {
    assert.expect(0);

    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const token = waiter.beginAsync();

    waiter.endAsync(token);
    waiter.endAsync(token);
  });

  test('endAsync will not throw if endAsync called twice in a row with the same token using custom token', function (assert) {
    assert.expect(0);

    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const waiterItem = {};

    waiter.beginAsync(waiterItem);
    waiter.endAsync(waiterItem);
    waiter.endAsync(waiterItem);
  });

  test('waitUntil returns the correct value if the waiter should wait', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const waiterItem = {};

    assert.ok(waiter.waitUntil(), 'waitUntil returns true');

    waiter.beginAsync(waiterItem);

    assert.notOk(waiter.waitUntil(), 'waitUntil returns false');

    waiter.endAsync(waiterItem);

    assert.ok(waiter.waitUntil(), 'waitUntil returns true');
  });

  test('waiter contains debug info for a waiter item', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');
    const waiterItem = {};

    overrideError(MockStableError);

    waiter.beginAsync(waiterItem);

    assert.deepEqual(waiter.debugInfo(), [
      { label: undefined, stack: 'STACK' },
    ]);
  });

  test('waiter executes beginAsync and endAsync at the correct times in relation to thenables', async function (assert) {
    const promiseWaiter = buildWaiter('@ember/test-waiters:promise-waiter');
    function waitForPromise<T>(promise: Promise<T>, label?: string) {
      let result = promise;

      assert.step('Waiter began async tracking');
      promiseWaiter.beginAsync(promise, label);

      result = promise.then(
        (value) => {
          assert.step('Waiter ended async tracking');
          promiseWaiter.endAsync(promise);
          return value;
        },
        (error) => {
          promiseWaiter.endAsync(promise);
          throw error;
        },
      );

      return result;
    }

    let promise: Promise<unknown> = new Promise((resolve) => {
      assert.step('Promise resolving');
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

    await promise
      .then(() => {
        assert.step('Promise thenables run');
        assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
      })
      .then(() => {
        assert.step('All thenables are run');
      });

    assert.verifySteps([
      'Promise resolving',
      'Waiter began async tracking',
      'Waiter ended async tracking',
      'Promise thenables run',
      'All thenables are run',
    ]);
  });

  test('waiter can clear items', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');

    waiter.beginAsync();

    assert.equal((waiter as any).items.size, 1);

    waiter.reset();

    assert.equal((waiter as any).items.size, 0);
  });

  test('completed operations tracking does not leak non-primitive tokens', function (assert) {
    const waiter = buildWaiter('@ember/test-waiters:my-waiter');

    const tokens = [undefined, {}, function () {}, Promise.resolve()];

    for (const token of tokens) {
      waiter.endAsync(waiter.beginAsync(token));
    }

    assert.equal((waiter as any).completedOperationsForPrimitives.size, 0);
  });
});
