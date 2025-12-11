import EntryCard from '@/components/MindArsenal/EntryCard';

export default function MindFunctionCard({ card, ...rest }) {
  const data = card || {};

  return (
    <EntryCard
      title={data.alias || data.title}
      summary={data.description}
      status={data.status}
      tags={data.tags}
      {...rest}
    />
  );
}
