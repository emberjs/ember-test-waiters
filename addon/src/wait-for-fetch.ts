import { default as waitForPromise } from './wait-for-promise.ts';

const props = [
  'body',
  'bodyUsed',
  'headers',
  'ok',
  'redirected',
  'status',
  'statusText',
  'type',
  'url',
] as const satisfies (keyof Response)[];
type ResponseProp = (typeof props)[number];
function isResponseProperty(maybeProp: string): maybeProp is ResponseProp {
  return props.some((prop) => maybeProp === prop);
}

const fns = [
  'arrayBuffer',
  'blob',
  'bytes',
  'clone',
  'formData',
  'json',
  'text',
] as const satisfies (keyof Response)[];
type ResponseFn = (typeof fns)[number];
function isResponseFn(maybeFn: string): maybeFn is ResponseFn {
  return fns.some((fn) => maybeFn === fn);
}

/**
 * Wraps the fetch promise in a test waiter, and also wraps the returned promises' async functions (like json()) in a
 * test waiter.
 */
export async function waitForFetch(fetchPromise: ReturnType<typeof fetch>) {
  const response = await waitForPromise(fetchPromise);

  return new Proxy(response, {
    get(target, prop, receiver) {
      /* Depending on the stack, Response is often already a Proxy. Reflect.get() will error for property values, when
       * using a Proxy as the _receiver_ arg, so just return the value the normal way to avoid that issue. */
      if (typeof prop === 'string' && isResponseProperty(prop)) {
        return target[prop];
      }
      const original = Reflect.get(target, prop, receiver);

      // Wrap Response functions in test waiter
      if (typeof prop === 'string' && isResponseFn(prop)) {
        // clone() is sync, no need to wrap in test-waiter
        if (prop === 'clone') {
          return (...args: unknown[]) => {
            return original.call(target, ...args);
          };
        }
        return (...args: unknown[]) => {
          return waitForPromise(original.call(target, ...args));
        };
      }
      // return the Reflect.get() result for anything else
      return original;
    },
  });
}
