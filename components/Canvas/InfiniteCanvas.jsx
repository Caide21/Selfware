// components/Canvas/InfiniteCanvas.jsx
import { useEffect, useMemo, useRef, useState } from 'react';

export default function InfiniteCanvas({
  initialNodes = [],
  renderNode,
  onNodesChange,
  gridSize = 48,
  snapToGrid: snapDefault = true,
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [snapToGrid, setSnapToGrid] = useState(snapDefault);
  const [nodes, setNodes] = useState(initialNodes);
  const fittedRef = useRef(false);
  const rootRef = useRef(null);

  // Sync internal nodes whenever initialNodes changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // Notify parent
  useEffect(() => {
    onNodesChange?.(nodes);
  }, [nodes, onNodesChange]);

  const toWorld = (clientX, clientY) => ({
    x: (clientX - offset.x) / scale,
    y: (clientY - offset.y) / scale,
  });

  const clampScale = (s) => Math.min(2.5, Math.max(0.2, s));

  const onWheel = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const worldBefore = toWorld(cx, cy);

    const zoom = Math.exp(-e.deltaY * 0.0015);
    const newScale = clampScale(scale * zoom);

    const newOffset = {
      x: cx - worldBefore.x * newScale,
      y: cy - worldBefore.y * newScale,
    };

    setScale(newScale);
    setOffset(newOffset);
  };

  const stateRef = useRef({
    panning: false,
    draggingId: null,
    start: { x: 0, y: 0 },
    originOffset: { x: 0, y: 0 },
    nodeOrigin: { x: 0, y: 0 },
  });

  const beginPan = (x, y) => {
    stateRef.current.panning = true;
    stateRef.current.start = { x, y };
    stateRef.current.originOffset = { ...offset };
  };

  const onPointerDown = (e) => {
    // left or middle button
    if (e.button === 1 || e.button === 0) beginPan(e.clientX, e.clientY);
  };

  const onPointerMove = (e) => {
    const s = stateRef.current;
    if (s.panning && !s.draggingId) {
      const dx = e.clientX - s.start.x;
      const dy = e.clientY - s.start.y;
      setOffset({ x: s.originOffset.x + dx, y: s.originOffset.y + dy });
    }
  };

  const onPointerUp = () => {
    stateRef.current.panning = false;
  };

  // Node drag
  const onNodePointerDown = (id, e) => {
    e.stopPropagation();
    const s = stateRef.current;
    s.draggingId = id;
    s.panning = false;
    s.start = { x: e.clientX, y: e.clientY };
    const node = nodes.find((n) => n.id === id);
    s.nodeOrigin = { x: node.x, y: node.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onNodePointerMove = (e) => {
    const s = stateRef.current;
    if (!s.draggingId) return;

    const dx = (e.clientX - s.start.x) / scale;
    const dy = (e.clientY - s.start.y) / scale;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === s.draggingId
          ? {
              ...n,
              x: snapToGrid ? snap(n.x + dx, gridSize) : n.x + dx,
              y: snapToGrid ? snap(n.y + dy, gridSize) : n.y + dy,
            }
          : n
      )
    );
  };

  const onNodePointerUp = () => {
    stateRef.current.draggingId = null;
  };

  const snap = (v, g) => Math.round(v / g) * g;

  const addNodeAt = (clientX, clientY, payload = {}) => {
    const world = toWorld(clientX, clientY);
    const x = snapToGrid ? snap(world.x, gridSize) : world.x;
    const y = snapToGrid ? snap(world.y, gridSize) : world.y;

    setNodes((prev) => [
      ...prev,
      {
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        x,
        y,
        w: 280,
        h: 140,
        payload,
      },
    ]);
  };

  const onDoubleClick = (e) =>
    addNodeAt(e.clientX, e.clientY, {
      title: 'New Node',
      emoji: '✨',
      description: 'Describe me.',
    });

  // Auto-fit/center once we have nodes
  useEffect(() => {
    if (fittedRef.current) return;
    if (!rootRef.current) return;
    if (!nodes || nodes.length === 0) return;

    const rect = rootRef.current.getBoundingClientRect();
    const padding = 120;

    const minX = Math.min(...nodes.map((n) => n.x));
    const minY = Math.min(...nodes.map((n) => n.y));
    const maxX = Math.max(...nodes.map((n) => n.x + (n.w || 320)));
    const maxY = Math.max(...nodes.map((n) => n.y + (n.h || 170)));

    const worldW = maxX - minX;
    const worldH = maxY - minY;

    const sx = (rect.width - padding) / worldW;
    const sy = (rect.height - padding) / worldH;
    const fitScale = clampScale(Math.min(sx, sy, 1.25));
    const ox = (rect.width - worldW * fitScale) / 2 - minX * fitScale;
    const oy = (rect.height - worldH * fitScale) / 2 - minY * fitScale;

    setScale(fitScale);
    setOffset({ x: ox, y: oy });
    fittedRef.current = true;
  }, [nodes]);

  const gridStyle = useMemo(() => {
    const g = gridSize * scale;
    const dot = Math.max(1, Math.floor(2 * scale));
    const ox = offset.x % g;
    const oy = offset.y % g;
    return {
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.12) ${dot}px, transparent ${dot + 0.5}px)`,
      backgroundSize: `${g}px ${g}px`,
      backgroundPosition: `${ox}px ${oy}px`,
    };
  }, [gridSize, offset, scale]);

  const resetView = () => {
    fittedRef.current = false; // refit on next effect
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const nodeStyle = (n) => ({
    transform: `translate(${n.x * scale + offset.x}px, ${
      n.y * scale + offset.y
    }px) scale(${scale})`,
    transformOrigin: 'top left',
    position: 'absolute',
    width: `${n.w}px`,
    height: `${n.h}px`,
    touchAction: 'none',
  });

  return (
    <div
      ref={rootRef}
      className="relative w-full h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-white/10 bg-black/60"
    >
      {/* Interaction layer */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        style={gridStyle}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
      />

      {/* Nodes */}
      <div className="absolute inset-0">
        {nodes.map((n) => (
          <div
            key={n.id}
            style={nodeStyle(n)}
            onPointerDown={(e) => onNodePointerDown(n.id, e)}
            onPointerMove={onNodePointerMove}
            onPointerUp={onNodePointerUp}
          >
            <div className="w-full h-full">
              {renderNode ? (
                renderNode(n, stateRef.current.draggingId === n.id)
              ) : (
                <div className="theme-card w-full h-full p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
                  <div className="text-2xl mb-1">{n.payload?.emoji ?? '📦'}</div>
                  <div className="font-semibold">{n.payload?.title ?? 'Node'}</div>
                  <div className="text-theme-muted text-xs line-clamp-3">
                    {n.payload?.description ?? ''}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
