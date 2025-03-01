import QUnit, { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { waitForFetch, getPendingWaiterState } from '@ember/test-waiters';

function stepPromise<T>(assert: Assert, label: string, promise: Promise<T>) {
  return promise
    .then((result) => {
      assert.step(`${label}:then`);
      return result;
    })
    .catch((e) => {
      assert.step(`${label}:catch`);
      return e;
    });
}

function fetchLike(assert: Assert) {
  const handlers = {} as {
    resolve: <T>(r: T) => unknown;
    reject: (e: unknown) => unknown;
  };
  const original = new Promise((resolve, reject) => {
    assert.step('fetch:start');
    handlers.resolve = resolve;
    handlers.reject = reject;
  });

  const promise = stepPromise(assert, 'fetch', original);

  return {
    promise,
    resolve(value: unknown) {
      return handlers.resolve(value);
    },
    reject(e: unknown) {
      return handlers.reject(e);
    },
  };
}

function proxiedResponse(assert: Assert, response) {
  return new Proxy(response, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);

      if (
        typeof prop === 'string' &&
        ['json', 'text', 'arrayBuffer', 'blob', 'formData', 'bytes'].includes(
          prop,
        )
      ) {
        return (...args: unknown[]) => {
          const label = `response:${prop}`;
          // not part of waiting, but this tells us
          // we proxied correctly
          assert.step(label);
          const promise = original.call(target, ...args);

          return stepPromise(assert, label, promise);
        };
      }

      return original;
    },
  });
}
function expectWaiters(assert: Assert, expected: number) {
  const result = getPendingWaiterState().pending;
  assert.strictEqual(
    result,
    expected,
    `Expecting ${expected} pending waiter(s)`,
  );
}

module('waitForFetch', function () {
  test('empty response', async function (assert) {
    const f = fetchLike(assert);

    expectWaiters(assert, 0);
    void waitForFetch(f.promise);

    assert.verifySteps(['fetch:start']);
    expectWaiters(assert, 1);

    f.resolve(proxiedResponse(assert, new Response()));

    assert.verifySteps([]);
    expectWaiters(assert, 1);

    await settled();
    assert.verifySteps(['fetch:then'], `Nothing on the response accessed`);
    expectWaiters(assert, 0);
  });

  test('text response', async function (assert) {
    const f = fetchLike(assert);

    expectWaiters(assert, 0);
    void waitForFetch(f.promise);

    assert.verifySteps(['fetch:start']);
    expectWaiters(assert, 1);

    f.resolve(proxiedResponse(assert, new Response(`content here`)));

    await settled();
    assert.verifySteps(['fetch:then']);

    const p = (await f.promise).text();

    assert.verifySteps(['response:text']);
    expectWaiters(assert, 1);

    await settled();
    expectWaiters(assert, 0);
    assert.verifySteps(['response:text:then']);

    await p;
    expectWaiters(assert, 0);
    assert.verifySteps([]);
  });
});
