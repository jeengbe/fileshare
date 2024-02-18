import { useEffect, useState } from 'react';

export function useLater<T>(
  valueFn: () => Promise<T>,
  disposeFn?: (value: T) => void,
): T | null {
  const [result, setResult] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    void valueFn().then((result) => {
      if (!cancelled) {
        setResult(result);
      }
    });

    return () => {
      cancelled = true;

      if (result) {
        disposeFn?.(result);
      }
    };
  }, []);

  return result;
}
