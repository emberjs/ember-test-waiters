import { IWaiter, WaiterName, ISimpleWaiterDebugInfo } from './types';

export class SimpleWaiter<T> implements IWaiter {
  public name: WaiterName;

  items = new Map<unknown, ISimpleWaiterDebugInfo>();

  constructor(name: WaiterName) {
    this.name = name;
  }

  add(item: T, label: string) {
    this.items.set(item, {
      stack: new Error().stack,
      label,
    });
  }

  delete(item: T) {
    this.items.delete(item);
  }

  waitUntil() {
    return this.items.size === 0;
  }

  debugInfo(): ISimpleWaiterDebugInfo[] {
    let output: ISimpleWaiterDebugInfo[] = [];

    this.items.forEach(item => output.push(item));

    return output;
  }
}
