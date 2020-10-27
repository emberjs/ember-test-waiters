import MockStableError, { overrideError, resetError } from './utils/mock-stable-error';
import { _reset, getPendingWaiterState, waitFor } from '@ember/test-waiters';
import { module, test } from 'qunit';

import EmberObject, { get } from '@ember/object';
import { DEBUG } from '@glimmer/env';
import RSVP from 'rsvp';

import { task as taskFn, TaskGenerator, didCancel } from 'ember-concurrency';
import { task as taskDec } from 'ember-concurrency-decorators';
import { perform } from 'ember-concurrency-ts';

import { PromiseType, Thenable } from '@ember/test-waiters/types';

interface PromiseClassType<T> {
  new (resolve: (value: T) => T, ...args: any[]): PromiseType<T>;
}

interface PromiseDef {
  name: string;
  Promise: PromiseClassType<any>;
}

interface ModeDef {
  name: string;
  createPromise: Function;
  createThrowingPromise: Function;
}

if (DEBUG) {
  module('wait-for', function(hooks) {
    hooks.afterEach(function() {
      _reset();
      resetError();
    });

    const promiseImplementations: PromiseDef[] = [
      { name: 'Native Promise', Promise },
      { name: 'RSVP.Promise', Promise: RSVP.Promise },
    ];

    const promiseTestModules = promiseImplementations.map(({ name, Promise }) => {
      class EmberObjectThing extends EmberObject.extend({
        doAsyncStuff: waitFor(async function doAsyncStuff(...args: any) {
          await new Promise(resolve => {
            setTimeout(resolve, 10);
          });
          return Array.from(args).reverse();
        }),

        asyncThrow: waitFor(async function asyncThrow() {
          await new Promise(resolve => {
            setTimeout(resolve, 10);
          });
          throw new Error('doh!');
        }),
      }) {}

      class NativeThing {
        @waitFor
        async doAsyncStuff(...args: any) {
          await new Promise(resolve => {
            setTimeout(resolve, 10);
          });
          return Array.from(args).reverse();
        }

        @waitFor
        async asyncThrow() {
          await new Promise(resolve => {
            setTimeout(resolve, 10);
          });
          throw new Error('doh!');
        }
      }
      return {
        name,
        waiterName: '@ember/test-waiters:promise-waiter',
        EmberObjectThing,
        NativeThing,
      };
    });

    const generatorTestModules = [
      (function() {
        const EmberObjectThing = EmberObject.extend({
          doStuffTask: taskFn(
            waitFor(function* doTaskStuff(...args: any) {
              yield new Promise(resolve => {
                setTimeout(resolve, 10);
              });
              return Array.from(args).reverse();
            })
          ),
          doAsyncStuff(...args: any) {
            // @ts-ignore
            return get(this, 'doStuffTask').perform(...args);
          },

          throwingTask: taskFn(
            waitFor(function* taskThrow() {
              yield new Promise(resolve => {
                setTimeout(resolve, 10);
              });
              throw new Error('doh!');
            })
          ),
          asyncThrow() {
            // @ts-ignore
            return get(this, 'throwingTask').perform();
          },
        });

        class NativeThing {
          @taskDec
          @waitFor
          *doStuffTask(...args: any): TaskGenerator<any[]> {
            yield new Promise(resolve => {
              setTimeout(resolve, 10);
            });
            return Array.from(args).reverse();
          }
          doAsyncStuff(...args: any) {
            return perform(get(this, 'doStuffTask'), ...args);
          }

          @taskDec
          @waitFor
          *throwingTask() {
            yield new Promise(resolve => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          }
          asyncThrow(...args: any) {
            return perform(get(this, 'throwingTask'), ...args);
          }
        }
        return {
          name: 'Generator',
          waiterName: '@ember/test-waiters:generator-waiter',
          EmberObjectThing,
          NativeThing,
        };
      })(),
    ];

    const testModules = [...promiseTestModules, ...generatorTestModules];

    testModules.forEach(({ name, waiterName, EmberObjectThing, NativeThing }) => {
      module(name, function() {
        const invocationType = [
          {
            name: 'class function',
            createPromise(...args: any[]) {
              return EmberObjectThing.create().doAsyncStuff(...args);
            },
            createThrowingPromise() {
              return EmberObjectThing.create().asyncThrow();
            },
          },
          {
            name: 'decorator',
            createPromise(...args: any[]) {
              return new NativeThing().doAsyncStuff(...args);
            },
            createThrowingPromise() {
              return new NativeThing().asyncThrow();
            },
          },
        ];

        invocationType.forEach(({ name, createPromise, createThrowingPromise }: ModeDef) => {
          module(name, function() {
            test('waitFor wraps and registers a waiter', async function(assert) {
              overrideError(MockStableError);

              let promise = createPromise();

              assert.deepEqual(getPendingWaiterState(), {
                pending: 1,
                waiters: {
                  [waiterName]: [
                    {
                      label: undefined,
                      stack: 'STACK',
                    },
                  ],
                },
              });

              await ((promise as unknown) as Thenable<void, PromiseType<void>>).then(() => {
                assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
              });
            });

            test('waitFor handles arguments and return value', async function(assert) {
              overrideError(MockStableError);

              let ret = await createPromise(1, 'foo');
              assert.deepEqual(ret, ['foo', 1]);
            });

            test('waitFor transitions waiter to not pending even if promise throws when thenable wrapped', async function(assert) {
              let promise = createThrowingPromise();

              try {
                await promise;
              } catch (e) {
                assert.deepEqual(getPendingWaiterState(), { pending: 0, waiters: {} });
              }
            });
          });
        });
      });
    });

    module('waitFor ember-concurrency interop', function() {
      class Deferred {
        promise: Promise<any>;
        resolve: Function = () => null;

        constructor() {
          this.promise = new Promise(res => (this.resolve = res));
        }
      }

      class NativeThing {
        iterations: Array<Number> = [];
        continue: Function = () => null;

        @taskDec
        @waitFor
        *doStuffTask(): TaskGenerator<string> {
          for (let i = 0; i < 3; i += 1) {
            let deferred = new Deferred();
            this.continue = deferred.resolve;
            yield deferred.promise;
            this.iterations.push(i);
          }
          return 'done';
        }

        @taskDec
        *parentTask(): TaskGenerator<string> {
          // @ts-ignore
          return yield get(this, 'doStuffTask').perform();
        }

        @taskDec
        @waitFor
        *wrappedParentTask(): TaskGenerator<string> {
          // @ts-ignore
          return yield get(this, 'doStuffTask').perform();
        }
      }

      test('tasks with multiple yields work', async function(assert) {
        let thing = new NativeThing();

        let promise = perform(get(thing, 'doStuffTask'));
        assert.deepEqual(getPendingWaiterState().pending, 1);

        thing.continue();
        await Promise.resolve();
        assert.deepEqual(thing.iterations, [0]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        thing.continue();
        await Promise.resolve();
        assert.deepEqual(thing.iterations, [0, 1]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        thing.continue();
        await promise;
        assert.deepEqual(thing.iterations, [0, 1, 2]);
        assert.deepEqual(getPendingWaiterState().pending, 0);
      });

      interface CancellationDef {
        desc: string;
        taskName: 'doStuffTask' | 'parentTask' | 'wrappedParentTask';
      }

      const cancellationCases: CancellationDef[] = [
        { desc: 'direct', taskName: 'doStuffTask' },
        { desc: 'parent', taskName: 'parentTask' },
        { desc: 'wrapped parent', taskName: 'wrappedParentTask' },
      ];

      cancellationCases.forEach(({ desc, taskName }) => {
        test(`${desc} task cancellation works`, async function(assert) {
          let thing = new NativeThing();

          let instance = perform(get(thing, taskName));
          assert.deepEqual(getPendingWaiterState().pending, 1);

          thing.continue();
          await Promise.resolve();
          assert.deepEqual(thing.iterations, [0]);
          assert.deepEqual(getPendingWaiterState().pending, 1);

          instance.cancel();
          try {
            await instance;
            assert.ok(false);
          } catch (e) {
            assert.ok(didCancel(e));
            assert.deepEqual(getPendingWaiterState().pending, 0);
          }
        });
      });
    });
  });
}
