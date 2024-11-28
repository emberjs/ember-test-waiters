/* eslint-disable no-global-assign */

const ERROR = Error;

// @ts-ignore
Error = ERROR;

export function overrideError(_Error: any) {
  // @ts-ignore
  Error = _Error;
}
export function resetError() {
  // @ts-ignore
  Error = ERROR;
}
export default class MockStableError {
  message: string;
  // @ts-ignore
  constructor(message: string) {
    this.message = message;
  }
  get stack() {
    return 'STACK';
  }
}
