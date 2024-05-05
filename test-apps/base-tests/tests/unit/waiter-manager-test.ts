import MockStableError, {
  overrideError,
  resetError,
} from './utils/mock-stable-error';
import type {
  TestWaiterDebugInfo,
  Waiter,
  WaiterName,
} from '@ember/test-waiters/__private__/types';
import {
  _reset,
  _resetWaiterNames,
  buildWaiter,
  getPendingWaiterState,
  getWaiters,
  hasPendingWaiters,
  register,
  unregister,
} from '@ember/test-waiters';
import type { Token } from '@ember/test-waiters';
import { module, test } from 'qunit';

import { macroCondition, isDevelopingApp } from '@embroider/macros';
import { registerWarnHandler } from '@ember/debug';

if (macroCondition(isDevelopingApp())) {
  module('waiter-manager | isDevelopingApp(): true', function (hooks) {
    hooks.afterEach(function () {
      _reset();
      _resetWaiterNames();
      resetError();

      registerWarnHandler(() => {});
    });

    test('register will correctly add a waiter', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');

      register(waiter);

      const waiters = getWaiters().map((w) => w.name);
      assert.deepEqual(waiters, ['@ember/test-waiters:first']);
    });

    test('register will only add one waiter with the same name', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');
      const secondWaiterButStillCalledFirst = buildWaiter(
        '@ember/test-waiters:first',
      );

      register(waiter);
      register(secondWaiterButStillCalledFirst);

      const waiters = getWaiters().map((w) => w.name);
      assert.deepEqual(waiters, ['@ember/test-waiters:first']);
    });

    test('unregister will correctly remove a waiter', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');

      register(waiter);

      let waiters = getWaiters().map((w) => w.name);
      assert.deepEqual(waiters, ['@ember/test-waiters:first'], 'precond');

      unregister(waiter);

      waiters = getWaiters().map((w) => w.name);
      assert.deepEqual(waiters, [], 'precond');
    });

    test('getWaiters returns all registered waiters', function (assert) {
      const waiter = buildWaiter('@ember/test-waiters:first');

      assert.equal(getWaiters(), 0, 'No waiters are registered');

      register(waiter);

      assert.equal(getWaiters().length, 1, 'One waiter is registered');

      unregister(waiter);

      assert.equal(getWaiters(), 0, 'No waiters are registered');
    });

    test('getPendingWaiterState returns information on pending waiters', function (assert) {
      const first = buildWaiter('@ember/test-waiters:first');
      const second = buildWaiter('@ember/test-waiters:second');
      const firstItem = {};
      const secondItem = {};

      overrideError(MockStableError);

      assert.equal(
        getPendingWaiterState().pending,
        0,
        'No waiters are pending',
      );
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {},
        'No waiters are pending',
      );

      first.beginAsync(firstItem);
      assert.equal(
        getPendingWaiterState().pending,
        1,
        'First waiter is pending',
      );
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {
          '@ember/test-waiters:first': [
            {
              label: undefined,
              stack: 'STACK',
            },
          ],
        },
        'First waiter is pending',
      );

      first.endAsync(firstItem);

      assert.equal(
        getPendingWaiterState().pending,
        0,
        'No waiters are pending',
      );
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {},
        'No waiters are pending',
      );

      second.beginAsync(secondItem);

      assert.equal(
        getPendingWaiterState().pending,
        1,
        'Second waiter is pending',
      );
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {
          '@ember/test-waiters:second': [
            {
              label: undefined,
              stack: 'STACK',
            },
          ],
        },
        'Second waiter is pending',
      );

      second.endAsync(secondItem);

      assert.equal(
        getPendingWaiterState().pending,
        0,
        'No waiters are pending',
      );
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {},
        'No waiters are pending',
      );
    });

    test('getPendingWaiterState contains label info when label provided', function (assert) {
      const first = buildWaiter('@ember/test-waiters:first');
      const second = buildWaiter('@ember/test-waiters:second');
      const firstItem = {};
      const secondItem = {};

      overrideError(MockStableError);

      first.beginAsync(firstItem, 'first-label');
      second.beginAsync(secondItem, 'second-label');

      assert.deepEqual(getPendingWaiterState(), {
        pending: 2,
        waiters: {
          '@ember/test-waiters:first': [
            {
              label: 'first-label',
              stack: 'STACK',
            },
          ],
          '@ember/test-waiters:second': [
            {
              label: 'second-label',
              stack: 'STACK',
            },
          ],
        },
      });
    });

    test('hasPendingWaiters can check if waiting is required', function (assert) {
      const first = buildWaiter('@ember/test-waiters:first');
      const second = buildWaiter('@ember/test-waiters:second');
      const firstItem = {};
      const secondItem = {};

      assert.false(hasPendingWaiters(), 'No waiters are pending');

      first.beginAsync(firstItem);
      assert.true(hasPendingWaiters(), 'First waiter is pending');

      first.endAsync(firstItem);
      assert.false(hasPendingWaiters(), 'First waiter is not pending');

      second.beginAsync(secondItem);
      assert.true(hasPendingWaiters(), 'Second waiter is pending');

      second.endAsync(secondItem);
      assert.false(hasPendingWaiters(), 'Second waiter is not pending');
    });

    test('custom waiters can be registered', function (assert) {
      let customWaiterCounter = 0;

      class CustomWaiter<T = Token> implements Waiter {
        public name: WaiterName;
        private waiterItems: Map<T, TestWaiterDebugInfo>;

        constructor(name: WaiterName) {
          this.name = name;
          this.waiterItems = new Map<T, TestWaiterDebugInfo>();
        }

        beginAsync(token: T) {
          customWaiterCounter++;
          this.waiterItems.set(token, { stack: new Error().stack, label: '' });
        }

        endAsync() {
          customWaiterCounter--;
        }

        waitUntil(): boolean {
          return customWaiterCounter === 0;
        }

        debugInfo(): TestWaiterDebugInfo[] {
          return [...this.waiterItems.values()];
        }
      }

      const customWaiter = new CustomWaiter(
        '@ember/test-waiters:custom-waiter',
      );

      register(customWaiter);

      assert.deepEqual([customWaiter], getWaiters());
    });
  });
}
