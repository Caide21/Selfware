import React, { useState } from "react";

const RenderNode = ({ node, depth = 0 }) => {
  const [expanded, setExpanded] = useState(depth === 0); // Auto-expand root
  const toggle = () => setExpanded(!expanded);
  const isLeaf = !node.children;

  return (
    <div className={`ml-${depth * 4} my-4`}>
      <div
        className={`mirror-glass-card p-4 border rounded-xl transition-all shadow-md border-white/10`}
        style={{
          marginLeft: `${depth * 16}px`,
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderLeft: "3px solid rgba(255,255,255,0.1)",
        }}
      >
        <h3 className="text-lg font-semibold mb-2">{node.name}</h3>

        {!isLeaf && (
          <button
            onClick={toggle}
            className="text-xs text-blue-400 hover:underline mb-2"
          >
            {expanded ? "Collapse" : "Expand"}
          </button>
        )}

        {isLeaf && node.uses && (
          <div className="text-sm mt-2 space-y-1">
            <div><b>Risks:</b> {node.uses.risks.join(", ")}</div>
            <div><b>Rewards:</b> {node.uses.rewards.join(", ")}</div>
            <div><b>Mind:</b> {node.uses.effects.mind}</div>
            <div><b>Body:</b> {node.uses.effects.body}</div>
            <div><b>Soul:</b> {node.uses.effects.soul}</div>
          </div>
        )}
      </div>

      {expanded && node.children && (
        <div className="mt-2 space-y-2 pl-2 border-l border-white/10">
          {node.children.map((child, index) => (
            <RenderNode key={index} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const Map = ({ data }) => {
  return (
    <div className="p-4 min-h-screen bg-black text-white overflow-x-auto">
      <div className="max-w-screen-lg mx-auto">
        <RenderNode node={data} />
      </div>
    </div>
  );
};

export default Map;