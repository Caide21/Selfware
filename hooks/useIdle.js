import { useEffect, useState } from 'react';

export default function useIdle(timeout = 6500) {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    let timer;

    const handleActivity = () => {
      clearTimeout(timer);
      setIsIdle(false);
      timer = setTimeout(() => setIsIdle(true), timeout);
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);
    window.addEventListener('touchstart', handleActivity);

    timer = setTimeout(() => setIsIdle(true), timeout);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
    };
  }, [timeout]);

  return isIdle;
}
