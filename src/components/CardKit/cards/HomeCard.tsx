import HomeInfoCard from '@/modules/home/HomeInfoCard';

type HomeData = Record<string, any>;

export interface HomeCardProps {
  card?: HomeData;
  className?: string;
  [key: string]: any;
}

export default function HomeCard({ card, className = '', ...rest }: HomeCardProps) {
  const data = card || {};
  return (
    <HomeInfoCard block={{ title: data.label, subtitle: data.placeType, body: null }} className={className} {...rest} />
  );
}
