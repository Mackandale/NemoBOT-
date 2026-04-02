import { useState, useRef, useCallback } from 'react';

export const useLongPress = (callback: (e: any) => void, ms = 1000) => {
  const [startLongPress, setStartLongPress] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback((e: any) => {
    setStartLongPress(true);
    timerRef.current = setTimeout(() => {
      callback(e);
    }, ms);
  }, [callback, ms]);

  const stop = useCallback(() => {
    setStartLongPress(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return [{
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop
  }, startLongPress] as const;
};
