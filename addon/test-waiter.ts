import { ITestWaiter, ITestWaiterDebugInfo, Primitive, WaiterName } from './types';

import Token from './token';
import { register } from './waiter-manager';

function getNextToken(): Token {
  return new Token();
}

/**
 * A class providing creation, registration and async waiting functionality.
 *
 * @public
 * @class TestWaiter<T>
 */
export default class TestWaiter<T extends object | Primitive = Token> implements ITestWaiter<T> {
  public name: WaiterName;
  private nextToken: () => T;
  private isRegistered = false;

  items = new Map<T, ITestWaiterDebugInfo>();
  completedOperationsForTokens = new WeakMap<Token, boolean>();
  completedOperationsForPrimitives = new Map<Primitive, boolean>();

  /**
   * @public
   * @constructor
   * @param name {WaiterName} the name of the test waiter
   */
  constructor(name: WaiterName, nextToken?: () => T) {
    this.name = name;
    // @ts-ignore
    this.nextToken = nextToken || getNextToken;
  }

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
  beginAsync(token: T = this.nextToken(), label?: string): T {
    this._register();

    if (this.items.has(token)) {
      throw new Error(`beginAsync called for ${token} but it is already pending.`);
    }

    let error = new Error();

    this.items.set(token, {
      get stack() {
        return error.stack;
      },
      label,
    });

    return token;
  }

  /**
   * Should be used to signal the end of an async operation. Invocation of this
   * method should be paired with a preceding `beginAsync` call from this instance,
   * which would indicate the beginning of an async operation.
   *
   * @public
   * @method endAsync
   * @param item {T} The item to that was registered for waiting
   */
  endAsync(token: T): void {
    if (!this.items.has(token) && !this._getCompletedOperations(token).has(token)) {
      throw new Error(`endAsync called with no preceding beginAsync call.`);
    }

    this.items.delete(token);
    // Mark when a waiter operation has completed so we can distinguish
    // whether endAsync is being called before a prior beginAsync call above.
    this._getCompletedOperations(token).set(token, true);
  }

  /**
   * Used to determine if the waiter system should still wait for async
   * operations to complete.
   *
   * @public
   * @method waitUntil
   * @returns {boolean}
   */
  waitUntil(): boolean {
    return this.items.size === 0;
  }

  /**
   * Returns the `debugInfo` for each item tracking async operations in this waiter.
   *
   * @public
   * @method debugInfo
   * @returns {ITestWaiterDebugInfo}
   */
  debugInfo(): ITestWaiterDebugInfo[] {
    return [...this.items.values()];
  }

  /**
   * Resets the waiter state, clearing items tracking async operations in this waiter.
   *
   * @public
   * @method reset
   */
  reset(): void {
    this.items.clear();
  }

  /**
   * Will register the waiter, allowing it to be opted in to pausing async
   * operations until they're completed within your tests. You should invoke
   * it after instantiating your `TestWaiter` instance.
   *
   * **Note**, if you forget to register your waiter, it will be registered
   * for you on the first invocation of `beginAsync`.
   *
   * @private
   * @method register
   */
  private _register(): void {
    if (!this.isRegistered) {
      register(this);
      this.isRegistered = true;
    }
  }

  /**
   * Gets the map-like object used for tracking completed async operations.
   *
   * A completed operation is defined as a call to `beginAsync` having occurred, and a
   * subsequent call to `endAsync` having also occurred using the `token` received from
   * the prior `beginAsync` call, thus ending the contiguous async operation.
   *
   * @private
   * @param token {T}
   */
  private _getCompletedOperations(token: T) {
    let type = typeof token;

    return token !== null || (type !== 'function' && type !== 'object')
      ? this.completedOperationsForPrimitives
      : this.completedOperationsForTokens;
  }
}
