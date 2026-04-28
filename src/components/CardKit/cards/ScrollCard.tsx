import BlockRenderer from '@/components/BlockRenderer';

export interface ScrollCardProps {
  title?: string;
  blocks?: any[];
}

export default function ScrollCard({ title, blocks = [] }: ScrollCardProps) {
  return (
    <div className="theme-scroll-card w-full rounded-xl px-4 py-4 sm:px-6 sm:py-6 space-y-3 bg-black text-white">
      <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
      <BlockRenderer blocks={blocks} />
    </div>
  );
}
