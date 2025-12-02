import Card from '@/components/CardKit/Card';

export default function HomeInfoCard({ block, className, variant = 'neutral', interactive = false }) {
  return (
    <Card title={block.title} subtitle={block.subtitle} variant={variant} interactive={interactive} className={className}>
      {block.body}
    </Card>
  );
}
