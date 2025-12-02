import { useEffect } from 'react';

export function useEditorEscape({ onExit, ref = null }) {
  useEffect(() => {
    const target = ref?.current || window;
    if (!target) return undefined;

    const handler = (event) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onExit?.();
      }
    };

    target.addEventListener('keydown', handler, { capture: true });
    return () => target.removeEventListener('keydown', handler, { capture: true });
  }, [onExit, ref]);
}
