/* eslint-disable @typescript-eslint/no-namespace */
export interface RangeValue<T> {
  start: T;
  end: T;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEST_ENV?: 'unit' | 'e2e';
    }
  }
}

export {};
