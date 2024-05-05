import type RSVP from 'rsvp';

/**
 * @type WaiterName
 *
 * A string representing the test waiter name
 */
export type WaiterName = string;

/**
 * @type Token
 */
export type Token = Primitive | unknown;

/**
 * @type Primitive
 *
 * Any of the primitive value types
 */
export type Primitive = string | number | boolean | symbol | bigint;

/**
 * @public
 * @interface Waiter
 */
export interface Waiter {
  /**
   * A string representing the test waiter name.
   *
   * @public
   * @property name {WaiterName}
   */
  name: WaiterName;

  /**
   * Used to determine if the waiter system should still wait for async
   * operations to complete.
   *
   * @public
   * @method waitUntil
   * @returns {boolean}
   */
  waitUntil(): boolean;

  /**
   * Returns the `debugInfo` for each item tracking async operations in this waiter.
   *
   * @public
   * @method debugInfo
   * @returns {TestWaiterDebugInfo}
   */
  debugInfo(): TestWaiterDebugInfo[];
}

/**
 * @public
 * @interface TestWaiter<T>
 */
export interface TestWaiter<T extends object | Primitive | unknown = Token> extends Waiter {
  /**
   * Should be used to signal the beginning of an async operation that
   * is to be waited for. Invocation of this method should be paired with a subsequent
   * `endAsync` call to indicate to the waiter system that the async operation is completed.
   *
   * @public
   * @method beginAsync
   * @param item {T} The item to register for waiting
   * @param label {string} An optional label to identify the item
   */
  beginAsync(token?: T, label?: string): T;

  /**
   * Should be used to signal the end of an async operation. Invocation of this
   * method should be paired with a preceding `beginAsync` call from this instance,
   * which would indicate the beginning of an async operation.
   *
   * @public
   * @method endAsync
   * @param item {T} The item to that was registered for waiting
   */
  endAsync(token: T): void;

  /**
   * Resets the waiter state, clearing items tracking async operations in this waiter.
   *
   * @public
   * @method reset
   */
  reset(): void;
}

/**
 * @public
 * @interface TestWaiterDebugInfo
 */
export interface TestWaiterDebugInfo {
  stack: string | undefined;
  label: string | undefined;
}

/**
 * @public
 * @interface PendingWaiterState
 */
export interface PendingWaiterState {
  pending: number;
  waiters: {
    [waiterName: string]: TestWaiterDebugInfo[] | true;
  };
}

export type PromiseType<T> = Promise<T> | RSVP.Promise<T>;

export interface Thenable<T, Return extends PromiseType<T>> {
  then(resolve: (value: T) => T, reject?: (error: Error) => T): Return;
}
