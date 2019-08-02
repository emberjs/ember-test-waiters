declare module 'ember-compatibility-helpers' {
  export function gte(version: string): boolean;
  export function gte(packageName: string, version: string): boolean;
  export function lte(version: string): boolean;
  export function lte(packageName: string, version: string): boolean;
}
