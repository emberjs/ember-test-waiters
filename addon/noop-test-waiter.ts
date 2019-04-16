import { IWaiter } from './types';

export default class NoopTestWaiter implements IWaiter {
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
