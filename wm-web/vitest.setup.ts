// Polyfill atob/btoa for token utils when running in Vitest
if (typeof window === 'undefined') {
  // @ts-expect-error
  global.window = {};
}

// Add testing-library matchers
import '@testing-library/jest-dom';

if (typeof (window as any).atob === 'undefined') {
  (window as any).atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

if (typeof (window as any).btoa === 'undefined') {
  (window as any).btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}
