import React from 'react';

type BlockRendererProps = {
  blocks?: any[];
};

export default function BlockRenderer({ blocks = [] }: BlockRendererProps) {
  // Fallback renderer: render JSON if no richer renderer is present.
  return (
    <pre className="whitespace-pre-wrap text-sm text-slate-700">
      {JSON.stringify(blocks, null, 2)}
    </pre>
  );
}
