import { useEffect, useRef } from 'react';

export default function useTimeout(callback: Function, delay: number) {
  const timeoutRef = useRef<number | null>(null);
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => savedCallback.current();
    if (typeof delay === 'number') {
      timeoutRef.current = window.setTimeout(tick, delay);
      return () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      };
    }
  }, [delay]);

  return timeoutRef;
}
