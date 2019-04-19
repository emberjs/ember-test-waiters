import { ITestWaiter } from './types';

/**
 * A class providing a production, noop replacement for the {TestWaiter<T>} class.
 *
 * @public
 * @class TestWaiter<T>
 */
export default class NoopTestWaiter<T> implements ITestWaiter<T> {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  beginAsync(): void {}

  endAsync(): void {}

  waitUntil(): boolean {
    return true;
  }
  debugInfo(): unknown {
    return undefined;
  }
}
