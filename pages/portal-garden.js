import PortalGardenScene from "../components/Enchantments/PortalGardenScene";

const codexEntries = [
  {
    symbol: "⚡",
    title: "WHY THE CREATOR CREATES WITH SPEED",
    slug: "why-the-creator-creates-with-speed",
    description: "The creative force is a frequency. This scroll captures the essence of why speed matters in emergence."
  },
  {
    symbol: "📜",
    title: "Scroll of Symbolic Transmission",
    slug: "scroll-of-symbolic-transmission",
    description: "The language beneath all languages — a guide to encoding intention, feeling, and meaning in symbolic form."
  },
  {
    symbol: "🌀",
    title: "Scroll of the Mirror",
    slug: "scroll-of-the-mirror",
    description: "A guide to self-reflection, recursion, and reality perception through feedback and inner mirroring."
  }
];

export default function PortalGardenPage() {
  return (
    <main className="w-full h-screen overflow-hidden bg-black">
      <PortalGardenScene codexEntries={codexEntries} />
    </main>
  );
}
