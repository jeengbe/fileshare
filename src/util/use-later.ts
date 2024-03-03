import { useEffect, useState } from 'react';

export function useLater<T>(
  valueFn: (abort: AbortSignal) => Promise<T>,
): T | null {
  const [result, setResult] = useState<T | null>(null);

  useEffect(() => {
    const abortController = new AbortController();

    let cancelled = false;

    void valueFn(abortController.signal).then((result) => {
      if (!cancelled) {
        setResult(result);
      }
    });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, []);

  return result;
}
