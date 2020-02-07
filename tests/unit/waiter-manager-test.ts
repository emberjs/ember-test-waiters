import { ITestWaiterDebugInfo, IWaiter, WaiterName } from 'ember-test-waiters/types';
import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import {
  Token,
  _reset,
  buildWaiter,
  getPendingWaiterState,
  getWaiters,
  hasPendingWaiters,
  register,
  unregister,
} from 'ember-test-waiters';
import { module, test } from 'qunit';

import { DEBUG } from '@glimmer/env';

if (DEBUG) {
  module('test-waiters | DEBUG: true', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    test('register will correctly add a waiter', function(assert) {
      let waiter = buildWaiter('first');

      register(waiter);

      let waiters = getWaiters().map(w => w.name);
      assert.deepEqual(waiters, ['first']);
    });

    test('register will only add one waiter with the same name', function(assert) {
      let waiter = buildWaiter('first');
      let secondWaiterButStillCalledFirst = buildWaiter('first');

      register(waiter);
      register(secondWaiterButStillCalledFirst);

      let waiters = getWaiters().map(w => w.name);
      assert.deepEqual(waiters, ['first']);
    });

    test('unregister will correctly remove a waiter', function(assert) {
      let waiter = buildWaiter('first');

      register(waiter);

      let waiters = getWaiters().map(w => w.name);
      assert.deepEqual(waiters, ['first'], 'precond');

      unregister(waiter);

      waiters = getWaiters().map(w => w.name);
      assert.deepEqual(waiters, [], 'precond');
    });

    test('getWaiters returns all registered waiters', function(assert) {
      let waiter = buildWaiter('first');

      assert.equal(getWaiters(), 0, 'No waiters are registered');

      register(waiter);

      assert.equal(getWaiters().length, 1, 'One waiter is registered');

      unregister(waiter);

      assert.equal(getWaiters(), 0, 'No waiters are registered');
    });

    test('getPendingWaiterState returns information on pending waiters', function(assert) {
      let first = buildWaiter('first');
      let second = buildWaiter('second');
      let firstItem = {};
      let secondItem = {};

      overrideError(MockStableError);

      assert.equal(getPendingWaiterState().pending, 0, 'No waiters are pending');
      assert.deepEqual(getPendingWaiterState().waiters, {}, 'No waiters are pending');

      first.beginAsync(firstItem);
      assert.equal(getPendingWaiterState().pending, 1, 'First waiter is pending');
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {
          first: [
            {
              label: undefined,
              stack: 'STACK',
            },
          ],
        },
        'First waiter is pending'
      );

      first.endAsync(firstItem);

      assert.equal(getPendingWaiterState().pending, 0, 'No waiters are pending');
      assert.deepEqual(getPendingWaiterState().waiters, {}, 'No waiters are pending');

      second.beginAsync(secondItem);

      assert.equal(getPendingWaiterState().pending, 1, 'Second waiter is pending');
      assert.deepEqual(
        getPendingWaiterState().waiters,
        {
          second: [
            {
              label: undefined,
              stack: 'STACK',
            },
          ],
        },
        'Second waiter is pending'
      );

      second.endAsync(secondItem);

      assert.equal(getPendingWaiterState().pending, 0, 'No waiters are pending');
      assert.deepEqual(getPendingWaiterState().waiters, {}, 'No waiters are pending');
    });

    test('getPendingWaiterState contains label info when label provided', function(assert) {
      let first = buildWaiter('first');
      let second = buildWaiter('second');
      let firstItem = {};
      let secondItem = {};

      overrideError(MockStableError);

      first.beginAsync(firstItem, 'first-label');
      second.beginAsync(secondItem, 'second-label');

      assert.deepEqual(getPendingWaiterState(), {
        pending: 2,
        waiters: {
          first: [
            {
              label: 'first-label',
              stack: 'STACK',
            },
          ],
          second: [
            {
              label: 'second-label',
              stack: 'STACK',
            },
          ],
        },
      });
    });

    test('hasPendingWaiters can check if waiting is required', function(assert) {
      let first = buildWaiter('first');
      let second = buildWaiter('second');
      let firstItem = {};
      let secondItem = {};

      assert.strictEqual(hasPendingWaiters(), false, 'No waiters are pending');

      first.beginAsync(firstItem);
      assert.strictEqual(hasPendingWaiters(), true, 'First waiter is pending');

      first.endAsync(firstItem);
      assert.strictEqual(hasPendingWaiters(), false, 'First waiter is not pending');

      second.beginAsync(secondItem);
      assert.strictEqual(hasPendingWaiters(), true, 'Second waiter is pending');

      second.endAsync(secondItem);
      assert.strictEqual(hasPendingWaiters(), false, 'Second waiter is not pending');
    });

    test('custom waiters can be registered', function(assert) {
      let customWaiterCounter = 0;
      let customWaiter;

      class CustomWaiter<T = Token> implements IWaiter {
        public name: WaiterName;
        private waiterItems: Map<T, ITestWaiterDebugInfo>;

        constructor(name: WaiterName) {
          this.name = name;
          this.waiterItems = new Map<T, ITestWaiterDebugInfo>();
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

        debugInfo(): ITestWaiterDebugInfo[] {
          return [...this.waiterItems.values()];
        }
      }

      customWaiter = new CustomWaiter('custom-waiter');

      register(customWaiter);

      assert.deepEqual([customWaiter], getWaiters());
    });
  });
}
