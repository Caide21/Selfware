import EntryCard from '@/components/MindArsenal/EntryCard';

type MindFunction = Record<string, any>;

export interface MindFunctionCardProps {
  card?: MindFunction;
  [key: string]: any;
}

export default function MindFunctionCard({ card, ...rest }: MindFunctionCardProps) {
  const data = card || {};

  return (
    <EntryCard title={data.alias || data.title} summary={data.description} status={data.status} tags={data.tags} {...rest} />
  );
}
