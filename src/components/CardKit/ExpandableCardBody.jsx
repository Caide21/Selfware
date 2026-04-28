import { useEffect, useRef, useState } from 'react';

export default function ExpandableCardBody({
  children,
  className = '',
  contentClassName = '',
  maxHeightClassName = 'max-h-40',
  expandLabel = 'Expand',
  collapseLabel = 'Collapse',
}) {
  const contentRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [children]);

  useEffect(() => {
    const node = contentRef.current;
    if (!node || expanded) return;

    setHasOverflow(node.scrollHeight > node.clientHeight + 1);
  }, [children, expanded]);

  return (
    <div className={['relative max-w-full', className].filter(Boolean).join(' ')}>
      {hasOverflow || expanded ? (
        <button
          type="button"
          className="absolute right-0 top-0 z-10 rounded-md bg-white/20 px-2 py-0.5 text-[11px] font-medium text-text/55 backdrop-blur transition hover:bg-white/30 hover:text-text focus:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
        >
          {expanded ? collapseLabel : expandLabel}
        </button>
      ) : null}

      <div
        ref={contentRef}
        className={[
          contentClassName,
          hasOverflow || expanded ? 'pr-20' : '',
          expanded ? '' : `${maxHeightClassName} overflow-hidden`,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
    </div>
  );
}
