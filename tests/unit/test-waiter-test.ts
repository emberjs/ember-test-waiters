import { module, test } from 'qunit';
import { TestWaiter, reset, getWaiters } from 'ember-test-waiters';
import MockStableError, { overrideError } from './utils/mock-stable-error';

module('test-waiter', function(hooks) {
  hooks.afterEach(function() {
    reset();
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
});
