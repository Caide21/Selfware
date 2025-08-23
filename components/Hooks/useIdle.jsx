import { useEffect, useState } from 'react';

export default function useIdle(timeout = 8000) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer = null;

    const resetTimer = () => {
      clearTimeout(timer);
      setIsIdle(false);
      timer = setTimeout(() => setIsIdle(true), timeout);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];

    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // initialize timer

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [timeout]);

  return isIdle;
}
