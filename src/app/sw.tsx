'use client';

import { useEffect } from 'react';

export const Sw = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  return null;
};
