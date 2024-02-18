export function usingLocked<
  T extends {
    releaseLock(): void;
  },
>(locked: T): T & Disposable {
  return Object.assign(locked, {
    [Symbol.dispose]() {
      locked.releaseLock();
    },
  });
}
