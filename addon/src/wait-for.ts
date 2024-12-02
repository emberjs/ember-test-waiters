import { macroCondition, isDevelopingApp } from '@embroider/macros';
import waitForPromise from './wait-for-promise.ts';
import buildWaiter from './build-waiter.ts';
import type { PromiseType } from './types/index.ts';

type AsyncFunction<A extends Array<any>, PromiseReturn> = (...args: A) => Promise<PromiseReturn>;
type AsyncFunctionArguments = [AsyncFunction<any[], any>, string?];

type CoroutineGenerator<T> = Generator<any, T, any>;
type CoroutineFunction<A extends Array<any>, T> = (...args: A) => CoroutineGenerator<T>;
type CoroutineFunctionArguments = [CoroutineFunction<any[], any>, string?];

type DecoratorArguments = [object, string, PropertyDescriptor, string?];

/**
 * A convenient utility function to simplify waiting for async. Can be used
 * in both decorator and function form. When applied to an async function, it
 * will cause tests to wait until the returned promise has resolves. When
 * applied to a generator function, it will cause tests to wait until the
 * returned iterator has run to completion, which is useful for wrapping
 * ember-concurrency task functions.
 *
 *
 * @public
 * @param promise {Function} An async function or a generator function
 * @param label {string} An optional string to identify the promise
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitFor } from '@ember/test-waiters';
 *
 * export default Component.extend({
 *   doAsyncStuff: waitFor(async function doAsyncStuff() {
 *     await somethingAsync();
 *   }
 * });
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { waitFor } from '@ember/test-waiters';
 *
 * export default class Friendz extends Component {
 *   @waitFor
 *   async doAsyncStuff() {
 *     await somethingAsync();
 *   }
 * }
 *
 */
export default function waitFor<A extends Array<any>, PromiseReturn>(
  fn: AsyncFunction<A, PromiseReturn>,
  label?: string
): AsyncFunction<A, PromiseReturn>;
export default function waitFor<A extends Array<any>, T>(
  fn: CoroutineFunction<A, T>,
  label?: string
): CoroutineFunction<A, T>;
export default function waitFor(
  target: object,
  _key: string,
  descriptor: PropertyDescriptor,
  label?: string
): PropertyDescriptor;
export default function waitFor(
  ...args: AsyncFunctionArguments | CoroutineFunctionArguments | DecoratorArguments
): PropertyDescriptor | Function | CoroutineFunction<any[], any> {
  const isFunction = args.length < 3;

  if (isFunction) {
    const [fn, label] = args as AsyncFunctionArguments | CoroutineFunctionArguments;

    return wrapFunction(fn, label);
  } else {
    const [, , descriptor, label] = args as DecoratorArguments;

    if (macroCondition(!isDevelopingApp())) {
      return descriptor;
    }

    const fn = descriptor.value;

    descriptor.value = wrapFunction(fn, label);

    return descriptor;
  }
}

function wrapFunction(fn: Function, label?: string) {
  if (macroCondition(!isDevelopingApp())) {
    return fn;
  }

  return function (this: any, ...args: any[]) {
    const result = fn.call(this, ...args);

    if (isThenable(result)) {
      return waitForPromise(result, label);
    } else if (isGenerator(result)) {
      return waitForGenerator(result, label);
    } else {
      return result;
    }
  };
}

function isThenable(
  maybePromise: any | PromiseType<unknown>
): maybePromise is PromiseType<unknown> {
  const type = typeof maybePromise;

  return (
    ((maybePromise !== null && type === 'object') || type === 'function') &&
    typeof maybePromise.then === 'function'
  );
}

function isGenerator(
  maybeGenerator: any | CoroutineGenerator<unknown>
): maybeGenerator is CoroutineGenerator<unknown> {
  // Because we don't have Symbol.iterator in IE11
  return (
    typeof maybeGenerator.next === 'function' &&
    typeof maybeGenerator.return === 'function' &&
    typeof maybeGenerator.throw === 'function'
  );
}

const GENERATOR_WAITER = buildWaiter('@ember/test-waiters:generator-waiter');

function waitForGenerator<T>(
  generator: CoroutineGenerator<T>,
  label?: string
): CoroutineGenerator<T> {
  GENERATOR_WAITER.beginAsync(generator, label);

  let isWaiting = true;
  function stopWaiting() {
    if (isWaiting) {
      GENERATOR_WAITER.endAsync(generator);
      isWaiting = false;
    }
  }

  return {
    next(...args) {
      let hasErrored = true;
      try {
        const val = generator.next(...args);
        hasErrored = false;

        if (val.done) {
          stopWaiting();
        }
        return val;
      } finally {
        // If generator.next() throws, we need to stop waiting. But if we catch
        // and re-throw exceptions, it could move the location from which the
        // uncaught exception is thrown, interfering with the developer
        // debugging experience if they have break-on-exceptions enabled. So we
        // use a boolean flag and a finally block to emulate a catch block.
        if (hasErrored) {
          stopWaiting();
        }
      }
    },
    return(...args) {
      stopWaiting();
      return generator.return(...args);
    },
    throw(...args) {
      stopWaiting();
      return generator.throw(...args);
    },
  } as CoroutineGenerator<T>;
}
