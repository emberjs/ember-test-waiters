import { DEBUG } from '@glimmer/env';
import waitForPromise from './wait-for-promise';
import buildWaiter from './build-waiter';
import { PromiseType } from './types';

type CoroutineGenerator<T> = Generator<any, T, any>;
type AsyncFunction<A extends Array<any>, PromiseReturn> = (...args: A) => Promise<PromiseReturn>;
type TaskFunction<A extends any[], T> = (...args: A) => CoroutineGenerator<T>;
type FunctionArguments = [AsyncFunction<any[], any> | TaskFunction<any[], any>, string?];
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
 * import { waitFor } from 'ember-test-waiters';
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
 * import { waitFor } from 'ember-test-waiters';
 *
 * export default class Friendz extends Component {
 *   @waitFor
 *   async doAsyncStuff() {
 *     await somethingAsync();
 *   }
 * }
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { task } from 'ember-concurrency';
 * import { waitFor } from 'ember-test-waiters';
 *
 * export default Component.extend({
 *   doTaskStuff: task(waitFor(function* doTaskStuff() {
 *     yield somethingAsync();
 *   }
 * });
 *
 * @example
 *
 * import Component from '@ember/component';
 * import { task } from 'ember-concurrency-decorators';
 * import { waitFor } from 'ember-test-waiters';
 *
 * export default class Friendz extends Component {
 *   @task
 *   @waitFor
 *   *doTaskStuff() {
 *     yield somethingAsync();
 *   }
 * }
 *
 */
export default function waitFor(fn: AsyncFunction<any[], any>, label?: string): Function;
export default function waitFor(
  fn: TaskFunction<any[], any>,
  label?: string
): TaskFunction<any[], any>;
export default function waitFor(
  target: object,
  _key: string,
  descriptor: PropertyDescriptor,
  label?: string
): PropertyDescriptor;
export default function waitFor(
  ...args: FunctionArguments | DecoratorArguments
): PropertyDescriptor | Function | TaskFunction<any[], any> {
  let isFunction = args.length < 3;

  if (isFunction) {
    let [fn, label] = args as FunctionArguments;

    return wrapFunction(fn, label);
  } else {
    let [, , descriptor, label] = args as DecoratorArguments;

    if (!DEBUG) {
      return descriptor;
    }

    let fn = descriptor.value;

    descriptor.value = wrapFunction(fn, label);

    return descriptor;
  }
}

function wrapFunction(fn: Function, label?: string) {
  if (!DEBUG) {
    return fn;
  }

  return function(this: any, ...args: any[]) {
    let result = fn.call(this, ...args);

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
  let type = typeof maybePromise;

  return (
    ((maybePromise !== null && type === 'object') || type === 'function') &&
    typeof maybePromise.then === 'function'
  );
}

function isGenerator(
  maybeGenerator: any | CoroutineGenerator<unknown>
): maybeGenerator is CoroutineGenerator<unknown> {
  return typeof maybeGenerator[Symbol.iterator] === 'function';
}

const GENERATOR_WAITER = buildWaiter('@ember/test-waiters:generator-waiter');

function waitForGenerator<T>(
  generator: CoroutineGenerator<T>,
  label?: string
): CoroutineGenerator<T> {
  GENERATOR_WAITER.beginAsync(generator, label);

  return {
    next() {
      try {
        let val = generator.next();
        if (val.done) {
          GENERATOR_WAITER.endAsync(generator);
        }
        return val;
      } catch (e) {
        GENERATOR_WAITER.endAsync(generator);
        throw e;
      }
    },
  } as CoroutineGenerator<T>;
}
