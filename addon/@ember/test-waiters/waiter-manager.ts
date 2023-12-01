import { assert } from '@ember/debug';
import { PendingWaiterState, Waiter, WaiterName } from './types';

import Ember from 'ember';
import { registerWaiter } from '@ember/test';

assert(
  `Expected the 'Symbol' global to be available in this environment. Environments without support for 'Symbol' are not supported by '@ember/test-waiters'. See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol`,
  typeof Symbol !== 'undefined'
);

// All copies of `@ember/test-waiters must have this same key/symbol.
// Once this `@ember/test-waiters` is released, folks will want to use 'overrides'
// to pin it across their whole dep graph.
//
// In the v1 addon version of this library, the build time highlander code will ensure
// that there is only one copy,
// And with the v2 addon version of this library, that is where pinning is important,
// because either:
// - highlander code will run, and boot out the v2 addon copy
// - v2 addon has precedence, and the min-version of test-waiters throughout the
//   dep graph should not preceed the version which this symbol was introduced.
const PRIVATE_GLOBAL_DATA_KEY = Symbol.for(`@ember/test-waiters' WAITERS`);

// this ensures that if @ember/test-waiters exists in multiple places in the
// build output we will still use a single map of waiters (there really should
// only be one of them, or else `settled` will not work at all)
const WAITERS: Map<WaiterName, Waiter> = (function () {
  let global = getPrivateData();
  let waiters = global.WAITERS;

  if (waiters === undefined) {
    waiters = global.WAITERS = new Map<WaiterName, Waiter>();
  }

  return waiters as Map<WaiterName, Waiter>;
})();

export function getPrivateData(): WaitersData {
  let global = getGlobal();
  global[PRIVATE_GLOBAL_DATA_KEY] ||= {} as WaitersData;

  return global[PRIVATE_GLOBAL_DATA_KEY] as WaitersData;
}

type GlobalContext = Record<typeof PRIVATE_GLOBAL_DATA_KEY, WaitersData>;
// interface GlobalContext {
//   [typeof PRIVATE_GLOBAL_DATA_KEY]: WaitersData;
// }

interface WaitersData {
  WAITER_NAMES?: Set<string> | undefined;
  WAITERS?: Map<WaiterName, Waiter> | undefined;
}

// SAFETY: TS does not allow unique symbol to be an index type / key.
//         TS typically assumes that keys on {} can only be strings.
//         So we have to lie to TS that this behavior is allowed.
//
//         e.g.:
//           a = {}
//           a[Symbol.for('foo')] = 22
//           Object.getOwnPropertySymbols(a)[0] === Symbol.for('foo');
function getGlobal(): GlobalContext {
  // eslint-disable-next-line node/no-unsupported-features/es-builtins
  if (typeof globalThis !== 'undefined') return globalThis as unknown as GlobalContext;
  if (typeof self !== 'undefined') return self as unknown as GlobalContext;
  if (typeof window !== 'undefined') return window as unknown as GlobalContext;
  if (typeof global !== 'undefined') return global as unknown as GlobalContext;

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
