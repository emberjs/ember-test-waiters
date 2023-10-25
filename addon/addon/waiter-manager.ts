import { PendingWaiterState, Waiter, WaiterName } from './types';

import Ember from 'ember';
import { registerWaiter } from '@ember/test';

type Indexable = Record<any, unknown>;

// this ensures that if @ember/test-waiters exists in multiple places in the
// build output we will still use a single map of waiters (there really should
// only be one of them, or else `settled` will not work at all)
const WAITERS: Map<WaiterName, Waiter> = (function () {
  const HAS_SYMBOL = typeof Symbol !== 'undefined';

  let symbolName = 'TEST_WAITERS';
  let symbol = HAS_SYMBOL ? (Symbol.for(symbolName) as any) : symbolName;

  let global = getGlobal();

  let waiters = global[symbol];
  if (waiters === undefined) {
    waiters = global[symbol] = new Map<WaiterName, Waiter>();
  }

  return waiters as Map<WaiterName, Waiter>;
})();

function indexable<T extends object>(input: T): T & Indexable {
  return input as T & Indexable;
}

function getGlobal(): Indexable {
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  if (typeof globalThis !== 'undefined') return indexable(globalThis);
  if (typeof self !== 'undefined') return indexable(self);
  if (typeof window !== 'undefined') return indexable(window);
  if (typeof global !== 'undefined') return indexable(global);

  throw new Error('unable to locate global object');
}

/**
 * Backwards compatibility with legacy waiters system.
 *
 * We want to always register a waiter using the legacy waiter system, as right
 * now if consumers are not on the right version of @ember/test-helpers, using
 * this addon will result in none of these waiters waiting.
 */
// eslint-disable-next-line ember/new-module-imports
if (Ember.Test) {
  registerWaiter(() => !hasPendingWaiters());
}

/**
 * Registers a waiter.
 *
 * @public
 * @param waiter {Waiter} A test waiter instance
 */
export function register(waiter: Waiter): void {
  WAITERS.set(waiter.name, waiter);
}

/**
 * Un-registers a waiter.
 *
 * @public
 * @param waiter {Waiter} A test waiter instance
 */
export function unregister(waiter: Waiter): void {
  WAITERS.delete(waiter.name);
}

/**
 * Gets an array of all waiters current registered.
 *
 * @public
 * @returns {Waiter[]}
 */
export function getWaiters(): Waiter[] {
  let result: Waiter[] = [];

  WAITERS.forEach((value) => {
    result.push(value);
  });

  return result;
}

/**
 * Clears all waiters.
 *
 * @private
 */
export function _reset(): void {
  for (let waiter of getWaiters()) {
    (waiter as any).isRegistered = false;
  }

  WAITERS.clear();
}

/**
 * Gets the current state of all waiters. Any waiters whose
 * `waitUntil` method returns false will be considered `pending`.
 *
 * @returns {PendingWaiterState} An object containing a count of all waiters
 * pending and a `waiters` object containing the name of all pending waiters
 * and their debug info.
 */
export function getPendingWaiterState(): PendingWaiterState {
  let result: PendingWaiterState = {
    pending: 0,
    waiters: {},
  };

  WAITERS.forEach((waiter) => {
    if (!waiter.waitUntil()) {
      result.pending++;

      let debugInfo = waiter.debugInfo();
      result.waiters[waiter.name] = debugInfo || true;
    }
  });

  return result;
}

/**
 * Determines if there are any pending waiters.
 *
 * @returns {boolean} `true` if there are pending waiters, otherwise `false`.
 */
export function hasPendingWaiters(): boolean {
  let state = getPendingWaiterState();

  return state.pending > 0;
}
