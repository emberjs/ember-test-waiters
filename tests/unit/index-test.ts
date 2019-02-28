import { module, test } from 'qunit';
import {
  register,
  unregister,
  shouldWait,
  getWaiters,
  reset,
  getPendingWaiterState,
} from 'ember-test-waiters';

module('ember-test-waiter', function(hooks) {
  hooks.afterEach(function() {
    reset();
  });

  test('it can register waiters', function(assert) {
    register({
      name: 'firsty',

      waitUntil() {
        return true;
      },

      debugInfo() {},
    });

    let waiters = getWaiters().map(w => w.name);
    assert.deepEqual(waiters, ['firsty']);
  });

  test('it can unregister waiters', function(assert) {
    let waiter = {
      name: 'firsty',

      waitUntil() {
        return true;
      },

      debugInfo() {},
    };

    register(waiter);

    let waiters = getWaiters().map(w => w.name);
    assert.deepEqual(waiters, ['firsty'], 'precond');

    unregister(waiter);

    waiters = getWaiters().map(w => w.name);
    assert.deepEqual(waiters, [], 'precond');
  });

  test('can check if waiting is required', function(assert) {
    let first = {
      name: 'firsty',
      waiting: false,
      waitUntil() {
        return this.waiting;
      },
      debugInfo() {},
    };
    let second = {
      name: 'first-loser',
      waiting: false,
      waitUntil() {
        return this.waiting;
      },
      debugInfo() {},
    };

    register(first);
    register(second);

    assert.strictEqual(shouldWait(), false, 'precond');

    first.waiting = true;
    assert.strictEqual(shouldWait(), true, 'should wait - second');

    first.waiting = false;
    assert.strictEqual(shouldWait(), false, 'reset - first');

    second.waiting = true;
    assert.strictEqual(shouldWait(), true, 'should wait - second');

    second.waiting = false;
    assert.strictEqual(shouldWait(), false, 'reset - second');
  });

  test('waiters can have custom debug info', function(assert) {
    let debugInfo: undefined | unknown[];
    let first = {
      name: 'firsty',
      waiting: false,
      waitUntil() {
        return !!debugInfo && debugInfo.length > 0;
      },
      debugInfo() {
        return debugInfo;
      },
    };
    register(first);

    assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} }, 'precond');

    debugInfo = ['blah', 'blah'];
    assert.deepEqual(getPendingWaiterState(), {
      pending: 1,
      waiters: { firsty: ['blah', 'blah'] },
    });

    debugInfo = undefined;
    assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} }, 'reset');
  });
});
