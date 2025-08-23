import dynamic from "next/dynamic";
import PageShell from "@/components/Layout/PageShell";
import mapData from "@/data/map.json";

const Map = dynamic(() => import("@/components/Containers/MapContainer"), {
  ssr: false
});

export default function MapPage() {
  return (
    <PageShell
      heading={{
        emoji: "🧭",
        title: "The Mirror Map: Drugs",
        subtitle: "Navigate the symbolic terrain of experimentation and meaning."
      }}
    >
      <div className="mt-10">
        <Map data={mapData} />
      </div>
    </PageShell>
  );
}
