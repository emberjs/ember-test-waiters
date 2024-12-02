import { _reset, buildWaiter, getWaiters, register } from '@ember/test-waiters';
import { module, test } from 'qunit';

import { macroCondition, isDevelopingApp } from '@embroider/macros';

if (macroCondition(!isDevelopingApp())) {
  module('waiter-manager-noop | isDevelopingApp(): false', function (hooks) {
    hooks.afterEach(function () {
      _reset();
    });

    test('buildWaiter returns NoopTestWaiter isDevelopingApp(): false', function (assert) {
      const waiter = buildWaiter('first');

      assert.equal(
        waiter.constructor.name,
        'NoopTestWaiter',
        'Returned instance is NoopTestWaiter',
      );
    });

    test('register will correctly add a waiter', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');

      register(waiter);

      const waiters = getWaiters().map((w) => w.name);
      assert.deepEqual(waiters, ['@ember/test-waiters:first']);
    });

    test('a NoopTestWaiter always returns true from waitUntil', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');

      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      const token = waiter.beginAsync();
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      waiter.endAsync(token);
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
    });

    test('a NoopTestWaiter always returns true from waitUntil', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');
      const waiterItem = {};

      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      const token = waiter.beginAsync(waiterItem);
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
      waiter.endAsync(token);
      assert.ok(waiter.waitUntil(), 'waitUntil returns true');
    });
  });
}
