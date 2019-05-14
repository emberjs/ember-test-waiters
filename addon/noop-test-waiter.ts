import { ITestWaiter, Token } from './types';

/**
 * A class providing a production, noop replacement for the {TestWaiter<T>} class.
 *
 * @public
 * @class TestWaiter<T>
 */
export default class NoopTestWaiter implements ITestWaiter {
  name: string;
  constructor(name: string) {
    this.name = name;
  }

  beginAsync(): Token {
    return this;
  }

  endAsync(): void {}

  waitUntil(): boolean {
    return true;
  }
  debugInfo(): unknown {
    return undefined;
  }
}
