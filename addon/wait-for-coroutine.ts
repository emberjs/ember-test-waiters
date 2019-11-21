import { DEBUG } from '@glimmer/env';
import TestWaiter from './test-waiter';

const COROUTINE_WAITER = new TestWaiter<Generator>('coroutine-waiter');

/**
 * A convenient utility function to simplify waiting for a coroutine in a
 * context such as ember-concurrency. Can be used in both decorator and
 * function form.
 *
 * @public
 * @param fn {Generator<T, TReturn, TNext>} The coroutine to track async operations for
 * @param label {string} An optional string to identify the coroutine
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitForGenerator } from 'ember-test-waiters';
 * import { task } from 'ember-concurrency-decorators';
 *
 * export default class Friendz extends Component {
 *   @task
 *   @waitForCoroutine
 *   *doAsyncStuff() {
 *     yield somethingAsync();
 *   }
 * }
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitForGenerator } from 'ember-test-waiters';
 * import { task } from 'ember-concurrency';
 *
 * export default Component.extend({
 *   doAsyncStuff: task(waitForCoroutine(function* doAsyncStuff() {
 *     yield somethingAsync();
 *   }
 * });
 */
export default function waitForCoroutine(
  target: object,
  _key: string,
  descriptor: PropertyDescriptor,
  label?: string
): PropertyDescriptor;
export default function waitForCoroutine(fn: Function, label?: string): Function;

export default function waitForCoroutine(
  ...args: [object, string, PropertyDescriptor, string?] | [Function, string?]
): PropertyDescriptor | Function {
  let isFunctionalInvocation = args.length < 3;

  if (isFunctionalInvocation) {
    let [fn, label] = args as [Function, string?];
    if (!DEBUG) {
      return fn;
    }

    return wrap(fn, label);
  } else {
    let [, , descriptor, label] = args as [object, string, PropertyDescriptor, string];
    if (DEBUG) {
      let fn = descriptor.value;
      descriptor.value = wrap(fn, label);
    }
    return descriptor;
  }
}

function wrap(fn: Function, label?: string) {
  return function*(this: any, ...args: any[]) {
    let token = COROUTINE_WAITER.beginAsync(undefined, label);
    try {
      return yield* fn.call(this, ...args);
    } finally {
      COROUTINE_WAITER.endAsync(token);
    }
  };
}
