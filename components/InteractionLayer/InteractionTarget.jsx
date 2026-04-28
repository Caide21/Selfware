import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { getAllowedInteractionActions, runInteractionAction } from '@/lib/interactions/actionRegistry';

export default function InteractionTarget({ target, children, className = '', actionContext = {} }) {
  const router = useRouter();
  const [menu, setMenu] = useState(null);
  const actions = useMemo(() => getAllowedInteractionActions(target), [target]);

  useEffect(() => {
    if (!menu) return undefined;

    const closeMenu = () => setMenu(null);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    window.addEventListener('click', closeMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', closeMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menu]);

  const handleContextMenu = (event) => {
    if (!actions.length) return;

    event.preventDefault();
    setMenu({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleAction = async (actionKey) => {
    await runInteractionAction(actionKey, target, { ...actionContext, router });
    setMenu(null);
  };

  return (
    <div
      className={['relative inline-block max-w-full', className].filter(Boolean).join(' ')}
      data-interaction-target-type={target?.type}
      data-interaction-target-id={target?.id}
      onContextMenu={handleContextMenu}
    >
      {children}

      {menu ? (
        <div
          className="fixed z-50 w-fit max-w-[220px] rounded-md border border-white/10 bg-white/20 px-2 py-1 text-sm text-text/85 backdrop-blur-md shadow-[0_0_20px_rgba(148,163,184,0.10)]"
          style={{ left: menu.x, top: menu.y }}
          role="menu"
          aria-label={`${target?.label || 'Target'} actions`}
          onClick={(event) => event.stopPropagation()}
        >
          {actions.map((action) => (
            <button
              key={action.key}
              type="button"
              className="block rounded px-2 py-1 text-left font-normal transition hover:bg-white/10 hover:text-text focus:bg-white/10 focus:text-text focus:outline-none"
              role="menuitem"
              onClick={() => handleAction(action.key)}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
