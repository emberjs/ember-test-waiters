import { IWaiter, WaiterName, ISimpleWaiterDebugInfo } from './types';
import { register } from './waiter-manager';

/**
 * A class providing creation, registration and async waiting functionality.
 *
 * @public
 * @class SimpleWaiter<T>
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { SimpleWaiter } from 'ember-test-waiters';
 *
 * if (DEBUG) {
 *   let waiter = new SimpleWaiter('friend-waiter');
 * }
 *
 * export default class Friendz extends Component {
 *   didInsertElement() {
 *     waiter.beginAsync(this);
 *
 *     someAsyncWork().then(() => {
 *       waiter.endAsync(this);
 *     });
 *   }
 * }
 */
export default class TestWaiter<T> implements IWaiter {
  public name: WaiterName;
  private isRegistered = false;

  items = new Map<T, ISimpleWaiterDebugInfo>();

  /**
   * @public
   * @constructor
   * @param name {WaiterName} the name of the test waiter
   */
  constructor(name: WaiterName) {
    this.name = name;
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
  private register() {
    if (!this.isRegistered) {
      register(this);
      this.isRegistered = true;
    }
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
  beginAsync(item: T, label?: string) {
    this.register();

    this.items.set(item, {
      stack: new Error().stack,
      label,
    });
  }

  /**
   * Should be used to signal the end of an async operation. Invocation of this
   * method should be paired with a preceeding `beginAsync` call, which would indicate the
   * beginning of an async operation.
   *
   * @public
   * @method endAsync
   * @param item {T} The item to that was registered for waiting
   */
  endAsync(item: T) {
    this.items.delete(item);
  }

  /**
   * Used to determine if the waiter system should still wait for async
   * operations to complete.
   */
  waitUntil() {
    return this.items.size === 0;
  }

  /**
   * Returns the `debugInfo` for each item tracking async operations in this waiter.
   */
  debugInfo(): ISimpleWaiterDebugInfo[] {
    return [...this.items.values()];
  }
}
