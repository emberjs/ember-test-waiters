import { module, test } from 'qunit';
import { settled } from '@ember/test-helpers';
import { waitForFetch, getPendingWaiterState } from '@ember/test-waiters';

function expectWaiters(assert: Assert, expected: number) {
  const result = getPendingWaiterState().pending;
  assert.strictEqual(
    result,
    expected,
    `Expecting ${expected} pending waiter(s)`,
  );
}

function createFormData(obj: any) {
  const data = new FormData();

  for (const [k, v] of Object.entries(obj)) {
    // SAFETY: just for testing, we can be a bit looser
    data.append(k, v as string);
  }

  return data;
}

const supported = [
  {
    method: 'json',
    input: new Response('{ "hi": "there" }'),
    parsed: { hi: 'there' },
  },
  { method: 'text', input: new Response('text'), parsed: 'text' },
  {
    method: 'arrayBuffer',
    input: new Response(new ArrayBuffer(8)),
    parsed: new ArrayBuffer(8),
  },
  {
    method: 'blob',
    input: new Response(new Blob(['hi'])),
    parsed: new Blob(['hi']),
  },
  {
    method: 'formData',
    input: new Response(createFormData({ x: 1 })),
    parsed: createFormData({ x: 1 }),
  },
  {
    method: 'bytes',
    input: new Response(new Uint8Array([92])),
    parsed: new Uint8Array([92]),
  },
] as const;

module('waitForFetch', function () {
  for (const scenario of supported) {
    test(`[${scenario.method}] minimal`, async function (assert) {
      const fetchish = new Promise<Response>((resolve) =>
        resolve(scenario.input),
      );
      const requestPromise = waitForFetch(fetchish);

      expectWaiters(assert, 1);
      const response = await requestPromise;

      expectWaiters(assert, 0);

      const responsePromise = response[scenario.method]();
      expectWaiters(assert, 1);

      const verify = await responsePromise;
      expectWaiters(assert, 0);

      assert.deepEqual(
        verify,
        scenario.parsed,
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        `Expected: ${scenario.parsed.toString()}`,
      );
    });
  }

  test('timing: empty response', async function (assert) {
    function stepPromise<T>(
      assert: Assert,
      label: string,
      promise: Promise<T>,
    ) {
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

    function proxiedResponse(assert: Assert, response: Response) {
      return new Proxy(response, {
        get(target, prop, receiver) {
          const original = Reflect.get(target, prop, receiver);

          if (
            typeof prop === 'string' &&
            [
              'json',
              'text',
              'arrayBuffer',
              'blob',
              'formData',
              'bytes',
            ].includes(prop)
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

    const f = fetchLike(assert);

    expectWaiters(assert, 0);
    const requestPromise = waitForFetch(f.promise);

    assert.verifySteps(['fetch:start']);
    expectWaiters(assert, 1);

    f.resolve(proxiedResponse(assert, new Response()));
    assert.verifySteps([]);
    expectWaiters(assert, 1);

    await settled();
    assert.verifySteps(['fetch:then'], `Nothing on the response accessed`);
    assert.verifySteps([]);
    expectWaiters(assert, 0);

    const response = await requestPromise;
    assert.verifySteps([]);
    expectWaiters(assert, 0);

    const responsePromise = response.text();
    assert.verifySteps(['response:text']);
    expectWaiters(assert, 1);

    await settled();
    assert.verifySteps(['response:text:then']);
    expectWaiters(assert, 0);

    await responsePromise;
    assert.verifySteps([]);
    expectWaiters(assert, 0);
  });
});
