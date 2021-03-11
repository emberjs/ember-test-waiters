import { Primitive, TestWaiter, TestWaiterDebugInfo, WaiterName } from './';

import { DEBUG } from '@glimmer/env';
import { warn } from '@ember/debug';
import Token from './token';
import { register } from './waiter-manager';

const WAITER_NAME_PATTERN = /^[^:]*:?.*/;
let WAITER_NAMES = DEBUG ? new Set() : undefined;

export function _resetWaiterNames() {
  WAITER_NAMES = new Set();
}

function getNextToken(): Token {
  return new Token();
}

class TestWaiterImpl<T extends object | Primitive = Token> implements TestWaiter<T> {
  public name: WaiterName;
  private nextToken: () => T;
  private isRegistered = false;

  items = new Map<T, TestWaiterDebugInfo>();
  completedOperationsForTokens = new WeakMap<Token, boolean>();
  completedOperationsForPrimitives = new Map<Primitive, boolean>();

  constructor(name: WaiterName, nextToken?: () => T) {
    this.name = name;
    // @ts-ignore
    this.nextToken = nextToken || getNextToken;
  }

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

  endAsync(token: T): void {
    if (!this.items.has(token) && !this._getCompletedOperations(token).has(token)) {
      throw new Error(`endAsync called with no preceding beginAsync call.`);
    }

    this.items.delete(token);
    // Mark when a waiter operation has completed so we can distinguish
    // whether endAsync is being called before a prior beginAsync call above.
    this._getCompletedOperations(token).set(token, true);
  }

  waitUntil(): boolean {
    return this.items.size === 0;
  }

  debugInfo(): TestWaiterDebugInfo[] {
    let result: TestWaiterDebugInfo[] = [];

    this.items.forEach((value) => {
      result.push(value);
    });

    return result;
  }

  reset(): void {
    this.items.clear();
  }

  private _register(): void {
    if (!this.isRegistered) {
      register(this);
      this.isRegistered = true;
    }
  }

  private _getCompletedOperations(token: T) {
    let type = typeof token;

    let isFunction = type === 'function';
    let isObject = token !== null && type === 'object';
    let isPrimitive = !isFunction && !isObject;

    return isPrimitive ? this.completedOperationsForPrimitives : this.completedOperationsForTokens;
  }
}

class NoopTestWaiter implements TestWaiter {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  beginAsync(): Token {
    return this;
  }

  endAsync(): void {}

  waitUntil(): boolean {
    return true;
  }

  debugInfo(): TestWaiterDebugInfo[] {
    return [];
  }

  reset(): void {}
}

/**
 * Builds and returns a test waiter. The type of the
 * returned waiter is dependent on whether the app or
 * addon is in `DEBUG` mode or not.
 *
 * @public
 *
 * @param name {string} The name of the test waiter
 * @returns {TestWaiter}
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { buildWaiter } from '@ember/test-waiters';
 *
 * if (DEBUG) {
 *   let waiter = buildWaiter('friend-waiter');
 * }
 *
 * export default class Friendz extends Component {
 *   didInsertElement() {
 *     let token = waiter.beginAsync(this);
 *
 *     someAsyncWork().then(() => {
 *       waiter.endAsync(token);
 *     });
 *   }
 * }
 */
export default function buildWaiter(name: string): TestWaiter {
  if (DEBUG) {
    warn(`The waiter name '${name}' is already in use`, !WAITER_NAMES!.has(name), {
      id: '@ember/test-waiters.duplicate-waiter-name',
    });
    WAITER_NAMES!.add(name);
  }

  if (!DEBUG) {
    return new NoopTestWaiter(name);
  }

  warn(
    `You must provide a name that contains a descriptive prefix separated by a colon.

      Example: ember-fictitious-addon:some-file

      You passed: ${name}`,
    WAITER_NAME_PATTERN.test(name),
    { id: '@ember/test-waiters.invalid-waiter-name' }
  );

  return new TestWaiterImpl(name);
}
