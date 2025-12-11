import HomeInfoCard from '@/modules/home/HomeInfoCard';

export default function HomeCard({ card, ...rest }) {
  const data = card || {};
  return (
    <HomeInfoCard
      block={{ title: data.label, subtitle: data.placeType, body: null }}
      {...rest}
    />
  );
}
