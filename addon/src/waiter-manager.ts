import type { PendingWaiterState, Waiter, WaiterName } from './types/index.ts';

type Indexable = Record<any, unknown>;

// this ensures that if @ember/test-waiters exists in multiple places in the
// build output we will still use a single map of waiters (there really should
// only be one of them, or else `settled` will not work at all)
const WAITERS: Map<WaiterName, Waiter> = (function () {
  const HAS_SYMBOL = typeof Symbol !== 'undefined';

  const symbolName = 'TEST_WAITERS';
  const symbol = HAS_SYMBOL ? (Symbol.for(symbolName) as any) : symbolName;

  const global = getGlobal();

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
  if (typeof globalThis !== 'undefined') return indexable(globalThis);
  if (typeof self !== 'undefined') return indexable(self);
  if (typeof window !== 'undefined') return indexable(window);

  throw new Error('unable to locate global object');
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
  const result: Waiter[] = [];

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
  for (const waiter of getWaiters()) {
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
  const result: PendingWaiterState = {
    pending: 0,
    waiters: {},
  };

  WAITERS.forEach((waiter) => {
    if (!waiter.waitUntil()) {
      result.pending++;

      const debugInfo = waiter.debugInfo();
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
  const state = getPendingWaiterState();

  return state.pending > 0;
}

/**
 * Never resolves. Returned when a pending waiter cannot announce its own
 * completion, so callers fall through to whatever fallback they race
 * this against rather than being told, wrongly, that things are quiet.
 */
const NEVER: Promise<unknown> = new Promise(() => {});

/**
 * Resolves when the operations all waiters are currently tracking have
 * completed, composed from the waiters' own completion promises rather
 * than by polling `hasPendingWaiters`.
 *
 * Operations begun after this call are not included: settling can start
 * more work, so a caller that needs a true fixpoint re-checks. And a
 * pending waiter that does not implement `settled` cannot announce
 * anything, so this never resolves while one is outstanding -- race it
 * against a fallback tick if you must tolerate those.
 *
 * @public
 * @returns {Promise<unknown>} resolves when the tracked operations complete
 */
export function waitersSettled(): Promise<unknown> {
  const settled: Promise<unknown>[] = [];

  for (const waiter of getWaiters()) {
    if (typeof waiter.settled === 'function') {
      settled.push(waiter.settled());
    } else if (!waiter.waitUntil()) {
      return NEVER;
    }
  }

  return Promise.all(settled);
}
