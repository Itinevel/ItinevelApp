// global.d.ts (in your root directory or the same component)
export {};

declare global {
  interface Window {
    google: any; // You can refine this type if needed
  }
}
