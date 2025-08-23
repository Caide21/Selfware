// hooks/useResonance.js
import { useEffect, useState } from "react";

export function useResonance(frequency = 0.6, min = 0.2, max = 1.0) {
  const [opacity, setOpacity] = useState(min);

  useEffect(() => {
    let animationFrameId;

    const update = (time) => {
      const t = time / 1000; // convert to seconds
      const wave = min + (max - min) * (0.5 + 0.5 * Math.sin(t * frequency));
      setOpacity(wave);
      animationFrameId = requestAnimationFrame(update);
    };

    animationFrameId = requestAnimationFrame(update);

    return () => cancelAnimationFrame(animationFrameId);
  }, [frequency, min, max]);

  return opacity;
}
