import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import {
  _reset,
  _resetWaiterNames,
  buildWaiter,
  getPendingWaiterState,
  getWaiters,
} from '@ember/test-waiters';
import { module, test } from 'qunit';

import { Promise } from 'rsvp';
import Token from '@ember/test-waiters/token';
import { registerWarnHandler } from '@ember/debug';

module('build-waiter', function(hooks) {
  hooks.afterEach(function() {
    _reset();
    _resetWaiterNames();
    resetError();
    registerWarnHandler(() => {});
  });

  test('test waiter can be instantiated with a namespace only', function(assert) {
    let name = 'my-addon';
    let waiter = buildWaiter(name);

    assert.equal(waiter.name, name);
  });

  test('test waiter can be instantiated with a namespace and descriptor', function(assert) {
    let name = 'my-addon:my-waiter';
    let waiter = buildWaiter(name);

    assert.equal(waiter.name, name);
  });

  test('test waiters will warn when waiter name is used more than once', function(assert) {
    registerWarnHandler((message, options) => {
      console.log('message', message);
      assert.equal(message, "The waiter name 'ember-test-waiters:first' is already in use");
      assert.equal(options.id, 'ember-test-waiters.duplicate-waiter-name');
    });

    buildWaiter('ember-test-waiters:first');
    buildWaiter('ember-test-waiters:first');
  });

  test('test waiters return a token from beginAsync when no token provided', function(assert) {
    let waiter = buildWaiter('my-addon:my-waiter');

    let token = waiter.beginAsync();

    assert.ok(token instanceof Token, 'A token was returned from beginAsync');
  });

  test('test waiters return a truthy token from beginAsync when no token provided', function(assert) {
    let waiter = buildWaiter('my-addon:my-waiter');

    let token = waiter.beginAsync();

    assert.ok(token, 'A token was returned from beginAsync and is truthy');
  });

  test('test waiters automatically register when beginAsync is invoked when no token provided', function(assert) {
    let waiter = buildWaiter('my-addon:my-waiter');

    let token = waiter.beginAsync();

    let registeredWaiters = getWaiters();

    assert.equal(registeredWaiters[0], waiter, 'The waiter is registered');
    assert.deepEqual(
      (registeredWaiters[0] as any).items.keys().next().value,
      token,
      'Waiter item is in items'
    );
  });

  test('test waiters automatically register when beginAsync is invoked using a custom token', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let waiterItem = {};

    waiter.beginAsync(waiterItem);

    let registeredWaiters = getWaiters();

    assert.equal(registeredWaiters[0], waiter, 'The waiter is registered');
    assert.deepEqual(
      (registeredWaiters[0] as any).items.keys().next().value,
      {},
      'Waiter item is in items'
    );
  });

  test('test waiters removes item from items map when endAsync is invoked', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');

    let token = waiter.beginAsync();
    waiter.endAsync(token);
    let registeredWaiters = getWaiters();

    assert.equal((registeredWaiters[0] as any).items.size, 0);
  });

  test('test waiters removes item from items map when endAsync is invoked using a custom token', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let waiterItem = {};

    waiter.beginAsync(waiterItem);
    waiter.endAsync(waiterItem);
    let registeredWaiters = getWaiters();

    assert.equal((registeredWaiters[0] as any).items.size, 0);
  });

  test('beginAsync will throw if a prior call to beginAsync with the same token occurred', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');

    assert.throws(
      () => {
        let token = waiter.beginAsync();
        waiter.beginAsync(token);
      },
      Error,
      /beginAsync called for [object Object] but item already pending./
    );
  });

  test('beginAsync will throw if a prior call to beginAsync with the same token occurred', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let token = {};

    assert.throws(
      () => {
        waiter.beginAsync(token);
        waiter.beginAsync(token);
      },
      Error,
      /beginAsync called for [object Object] but item already pending./
    );
  });

  test('endAsync will throw if a prior call to beginAsync with the same token did not occur', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let token = 0;

    assert.throws(
      () => {
        waiter.endAsync(token);
      },
      Error,
      /endAsync called for [object Object] but item is not currently pending./
    );
  });

  test('endAsync will throw if a prior call to beginAsync with the same token did not occur using custom token', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let waiterItem = {};

    assert.throws(
      () => {
        waiter.endAsync(waiterItem);
      },
      Error,
      /endAsync called for [object Object] but item is not currently pending./
    );
  });

  test('endAsync will not throw if endAsync called twice in a row with the same token', function(assert) {
    assert.expect(0);

    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let token = waiter.beginAsync();

    waiter.endAsync(token);
    waiter.endAsync(token);
  });

  test('endAsync will not throw if endAsync called twice in a row with the same token using custom token', function(assert) {
    assert.expect(0);

    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let waiterItem = {};

    waiter.beginAsync(waiterItem);
    waiter.endAsync(waiterItem);
    waiter.endAsync(waiterItem);
  });

  test('waitUntil returns the correct value if the waiter should wait', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let waiterItem = {};

    assert.ok(waiter.waitUntil(), 'waitUntil returns true');

    waiter.beginAsync(waiterItem);

    assert.notOk(waiter.waitUntil(), 'waitUntil returns false');

    waiter.endAsync(waiterItem);

    assert.ok(waiter.waitUntil(), 'waitUntil returns true');
  });

  test('waiter contains debug info for a waiter item', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');
    let waiterItem = {};

    overrideError(MockStableError);

    waiter.beginAsync(waiterItem);

    assert.deepEqual(waiter.debugInfo(), [{ label: undefined, stack: 'STACK' }]);
  });

  test('waiter executes beginAsync and endAsync at the correct times in relation to thenables', async function(assert) {
    const promiseWaiter = buildWaiter('ember-test-waiters:promise-waiter');
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
        'ember-test-waiters:promise-waiter': [
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

  test('waiter can clear items', function(assert) {
    let waiter = buildWaiter('ember-test-waiters:my-waiter');

    waiter.beginAsync();

    assert.equal((waiter as any).items.size, 1);

    waiter.reset();

    assert.equal((waiter as any).items.size, 0);
  });
});
