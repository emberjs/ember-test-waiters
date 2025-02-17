import { default as waitForPromise } from './wait-for-promise';

export async function waitForFetch(fetchPromise: ReturnType<typeof fetch>) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  waitForPromise(fetchPromise);

  const response = await fetchPromise;

  return new Proxy(response, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);

      if (
        typeof prop === 'string' &&
        ['json', 'text', 'arrayBuffer', 'blob', 'formData'].includes(prop)
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
