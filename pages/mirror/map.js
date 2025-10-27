import dynamic from 'next/dynamic';
import { usePageHeading } from '@/components/Layout/PageShell';
import mapData from '@/data/map.json';

const Map = dynamic(() => import('@/components/Containers/MapContainer'), {
  ssr: false,
});

const PAGE_HEADING = {
  emoji: 'dY-',
  title: 'The Mirror Map: Drugs',
  subtitle: 'Navigate the symbolic terrain of experimentation and meaning.',
};

export default function MapPage() {
  usePageHeading(PAGE_HEADING);

  return (
    <div className="mt-10">
      <Map data={mapData} />
    </div>
  );
}
