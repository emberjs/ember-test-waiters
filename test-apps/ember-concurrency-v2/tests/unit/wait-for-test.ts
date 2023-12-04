import MockStableError, {
  overrideError,
  resetError,
} from './utils/mock-stable-error';
// @ember/test-waiters is still a v1 addon and is too weird
// to have in-repo types working correctly.
// @ts-ignore
import { _reset, getPendingWaiterState, waitFor } from '@ember/test-waiters';
import { module, test } from 'qunit';

import EmberObject, { get } from '@ember/object';
import { DEBUG } from '@glimmer/env';

import { task as taskFn, TaskGenerator, didCancel } from 'ember-concurrency';
// type resolution is not working correctly due to usage of forked
// (non-published) ember-concurrency-decorators remove this ts-ignore when
// migrating back to mainline off the fork
// @ts-ignore
import { task as taskDec } from 'ember-concurrency-decorators';
import { perform } from 'ember-concurrency-ts';
// @ts-ignore
import co from 'co';

// @ember/test-waiters is still a v1 addon and is too weird
// to have in-repo types working correctly.
// @ts-ignore
import { PromiseType, Thenable } from '@ember/test-waiters/types';

interface ModeDef {
  name: string;
  createPromise: Function;
  createThrowingPromise: Function;
}

if (DEBUG) {
  module('wait-for', function (hooks) {
    hooks.afterEach(function () {
      _reset();
      resetError();
    });
    const generatorTestModules = [
      (function () {
        const EmberObjectThing = EmberObject.extend({
          doStuffTask: taskFn(
            waitFor(function* doTaskStuff(...args: any) {
              yield new Promise((resolve) => {
                setTimeout(resolve, 10);
              });
              return args.reverse();
            }),
          ),
          doAsyncStuff(...args: any) {
            // @ts-ignore
            return this.doStuffTask.perform(...args);
          },

          throwingTask: taskFn(
            waitFor(function* taskThrow() {
              yield new Promise((resolve) => {
                setTimeout(resolve, 10);
              });
              throw new Error('doh!');
            }),
          ),
          asyncThrow() {
            // @ts-ignore
            return this.throwingTask.perform();
          },
        });

        class NativeThing {
          @taskDec
          @waitFor
          *doStuffTask(...args: any): TaskGenerator<any[]> {
            yield new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            return args.reverse();
          }
          doAsyncStuff(...args: any) {
            return perform(this.doStuffTask, ...args);
          }

          @taskDec
          @waitFor
          *throwingTask() {
            yield new Promise((resolve) => {
              setTimeout(resolve, 10);
            });
            throw new Error('doh!');
          }
          asyncThrow(...args: any) {
            return perform(this.throwingTask, ...args);
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

    const testModules = [...generatorTestModules];

    testModules.forEach(
      ({ name, waiterName, EmberObjectThing, NativeThing }) => {
        module(name, function () {
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

          invocationType.forEach(
            ({ name, createPromise, createThrowingPromise }: ModeDef) => {
              module(name, function () {
                test('waitFor wraps and registers a waiter', async function (assert) {
                  overrideError(MockStableError);

                  const promise = createPromise();

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

                  await (
                    promise as unknown as Thenable<void, PromiseType<void>>
                  ).then(() => {
                    assert.deepEqual(getPendingWaiterState(), {
                      pending: 0,
                      waiters: {},
                    });
                  });
                });

                test('waitFor handles arguments and return value', async function (assert) {
                  overrideError(MockStableError);

                  const ret = await createPromise(1, 'foo');
                  assert.deepEqual(ret, ['foo', 1]);
                });

                test('waitFor transitions waiter to not pending even if promise throws when thenable wrapped', async function (assert) {
                  const promise = createThrowingPromise();

                  try {
                    await promise;
                  } catch (e) {
                    assert.deepEqual(getPendingWaiterState(), {
                      pending: 0,
                      waiters: {},
                    });
                  }
                });
              });
            },
          );
        });
      },
    );

    module('waitFor ember-concurrency interop', function () {
      class Deferred {
        promise: Promise<any>;
        resolve: Function = () => null;

        constructor() {
          this.promise = new Promise((res) => (this.resolve = res));
        }
      }

      class NativeThing {
        iterations: Array<number> = [];
        _continue?: Function;

        @taskDec
        @waitFor
        *doStuffTask(): TaskGenerator<string> {
          for (let i = 0; i < 3; i += 1) {
            const continuation = new Deferred();
            if (this._continue !== undefined) {
              throw new Error('pending continue, cannot proceed');
            }
            const completion = new Deferred();
            let complete = false;

            this._continue = () => {
              if (complete === true) {
                throw new Error(
                  'Cannot call continue twice on a single iteration',
                );
              } else {
                complete = true;
              }

              continuation.resolve();
              return completion.promise;
            };

            try {
              yield continuation.promise;
            } finally {
              this._continue = undefined;
              completion.resolve();
            }
            this.iterations.push(i);
          }
          return 'done';
        }

        get continue() {
          if (this._continue === undefined) {
            throw new Error('Cannot call continue twice on a single iteration');
          } else {
            try {
              return this._continue;
            } finally {
              // detect invalid usage. Specifically, our test (as written
              // currently) would be in-error if any given continue() is invoked more
              // then once
              this._continue = undefined;
            }
          }
        }

        @taskDec
        *parentTask(): TaskGenerator<string> {
          // @ts-ignore
          return yield this.doStuffTask.perform();
        }

        @taskDec
        @waitFor
        *wrappedParentTask(): TaskGenerator<string> {
          // @ts-ignore
          return yield this.doStuffTask.perform();
        }
      }

      test('tasks with multiple yields work', async function (assert) {
        const thing = new NativeThing();
        const task = perform(thing.doStuffTask);

        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        assert.deepEqual(thing.iterations, [0]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        assert.deepEqual(thing.iterations, [0, 1]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        await task;

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
        test(`${desc} task cancellation works`, async function (assert) {
          const thing = new NativeThing();

          const instance = perform(get(thing, taskName));
          assert.deepEqual(getPendingWaiterState().pending, 1);

          await thing.continue();
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

    module('waitFor co interop', function () {
      function coDec(
        _target: object,
        _key: string,
        descriptor: PropertyDescriptor,
      ): PropertyDescriptor {
        descriptor.value = co.wrap(descriptor.value);
        return descriptor;
      }

      class Deferred {
        promise: Promise<any>;
        resolve: Function = () => null;

        constructor() {
          this.promise = new Promise((res) => (this.resolve = res));
        }
      }

      class NativeThing {
        iterations: Array<number> = [];
        _continue?: Function;

        @coDec
        @waitFor
        *doStuffCo(): TaskGenerator<string> {
          for (let i = 0; i < 3; i += 1) {
            const continuation = new Deferred();
            if (this._continue !== undefined) {
              throw new Error('pending continue, cannot proceed');
            }
            const completion = new Deferred();
            let continued = false;

            this._continue = () => {
              if (continued === true) {
                throw new Error(
                  'Cannot call continue twice on a single iteration',
                );
              } else {
                continued = true;
              }

              continuation.resolve();
              return completion.promise;
            };

            try {
              yield continuation.promise;
            } finally {
              completion.resolve();
              this._continue = undefined;
            }
            this.iterations.push(i);
          }
          return 'done';
        }

        get continue() {
          if (this._continue === undefined) {
            throw new Error('Cannot call continue twice on a single iteration');
          } else {
            try {
              return this._continue;
            } finally {
              // detect invalid usage. Specifically, our test (as written
              // currently) would be in-error if any given continue() is invoked more
              // then once
              this._continue = undefined;
            }
          }
        }
      }

      test('it works', async function (assert) {
        const thing = new NativeThing();

        thing.doStuffCo();
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        assert.deepEqual(thing.iterations, [0]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();
        assert.deepEqual(thing.iterations, [0, 1]);
        assert.deepEqual(getPendingWaiterState().pending, 1);

        await thing.continue();

        assert.deepEqual(thing.iterations, [0, 1, 2]);
        assert.deepEqual(getPendingWaiterState().pending, 0);
      });
    });

    test('types', async function (assert) {
      assert.expect(0);

      async function asyncFn(a: string, b: string) {
        return `${a}${b}`;
      }
      function* genFn(a: string, b: string) {
        yield `${a}${b}`;
        return `${a}${b}`;
      }

      function asyncNoop(fn: typeof asyncFn) {
        return fn;
      }
      function genNoop(fn: typeof genFn) {
        return fn;
      }

      asyncNoop(waitFor(asyncFn));
      genNoop(waitFor(genFn));

      // @ts-expect-error wrong argument types
      waitFor(asyncFn)(1, 2);
      // @ts-expect-error wrong argument types
      waitFor(genFn)(1, 2);
    });
  });
}
