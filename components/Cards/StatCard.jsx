import Card from '@/components/CardKit/Card';

export default function StatCard({ card, stat }) {
  const data = card || stat || {};

  return (
    <Card variant="success" accent="#22c55e" title={data.label || 'Stat'} meta="Stat">
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-semibold text-emerald-700">{data.value ?? '--'}</div>
        {data.unit ? <div className="text-sm text-text/60">{data.unit}</div> : null}
      </div>
    </Card>
  );
}
