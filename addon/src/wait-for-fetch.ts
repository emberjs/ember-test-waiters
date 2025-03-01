import { default as waitForPromise } from './wait-for-promise.ts';

export async function waitForFetch(fetchPromise: ReturnType<typeof fetch>) {
  const response = await waitForPromise(fetchPromise);

  return new Proxy(response, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);

      console.log(...arguments);
      if (
        typeof prop === 'string' &&
        ['json', 'text', 'arrayBuffer', 'blob', 'formData', 'bytes'].includes(prop)
      ) {
        return (...args: unknown[]) => {
          console.log(...args);
          return waitForPromise(original.call(target, ...args));
        };
      }

      return original;
    },
  });
}
