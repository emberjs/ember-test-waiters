import { default as waitForPromise } from './wait-for-promise';

export async function waitForFetch(fetchPromise: ReturnType<typeof fetch>) {
  const response = await waitForPromise(fetchPromise);

  return new Proxy(response, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);

      if (
        typeof prop === 'string' &&
        ['json', 'text', 'arrayBuffer', 'blob', 'formData', 'bytes'].includes(prop)
      ) {
        return (...args: unknown[]) => {
          const parsePromise = original.call(target, ...args);

          return waitForPromise(parsePromise);
        };
      }

      return original;
    },
  });
}
