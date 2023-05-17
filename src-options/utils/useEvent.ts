import { useRef, useInsertionEffect, useCallback } from 'react';

export function useEvent(fn: Function) {
  const ref = useRef<Function|null>(null);
  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: any[]) => {
    const f = ref.current;
    return f?.(...args);
  }, []);
}
