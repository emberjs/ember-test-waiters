import { module, test } from 'qunit';
import { DEBUG } from '@glimmer/env';
import { _reset, buildWaiter, register, getWaiters } from 'ember-test-waiters';
import NoopTestWaiter from 'ember-test-waiters/noop-test-waiter';

if (!DEBUG) {
  module('test-waiter | DEBUG: false', function(hooks) {
    hooks.afterEach(function() {
      _reset();
    });

    test('buildWaiter returns NoopTestWaiter DEBUG: false', function(assert) {
      let waiter = buildWaiter('first');

      assert.ok(waiter instanceof NoopTestWaiter, 'Returned instance is NoopTestWaiter');
    });

    test('register will correctly add a waiter', function(assert) {
      let waiter = buildWaiter('first');

      register(waiter);

      let waiters = getWaiters().map(w => w.name);
      assert.deepEqual(waiters, ['first']);
    });

    test('a NoopTestWaiter always returns true from waitUntil', function(assert) {
      let waiter = buildWaiter('first');

      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      let token = waiter.beginAsync();
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      waiter.endAsync(token);
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
    });

    test('a NoopTestWaiter always returns true from waitUntil', function(assert) {
      let waiter = buildWaiter('first');
      let waiterItem = {};

      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      let token = waiter.beginAsync(waiterItem);
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      waiter.endAsync(token);
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
    });
  });
}
