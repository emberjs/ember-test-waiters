import { default as waitForPromise } from './wait-for-promise.ts';

const properties = [
  'ok',
  'status',
  'statusText',
  'bodyUsed',
  'headers',
  'redirected',
  'type',
  'url',
] as const satisfies (keyof Response)[];
type ResponseProp = (typeof properties)[number];
function isResponseProperty(maybeProp: string): maybeProp is ResponseProp {
  return properties.some((prop) => maybeProp === prop);
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

      // For async functions, call them but wrapped in waitForPromise
      if (
        typeof prop === 'string' &&
        ['json', 'text', 'arrayBuffer', 'blob', 'formData', 'bytes'].includes(prop)
      ) {
        return (...args: unknown[]) => {
          return waitForPromise(original.call(target, ...args));
        };
      }
      // For sync functions, just call them
      if (typeof prop === 'string' && ['clone'].includes(prop)) {
        return (...args: unknown[]) => {
          return original.call(target, ...args);
        };
      }
      return original;
    },
  });
}
