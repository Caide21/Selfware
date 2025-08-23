import ThreeScene from "../components/Enchantments/ThreeScene";

// ✅ 1️⃣ Your symbolic scroll data — unchanged
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
  

// ✅ 2️⃣ Your entire page = passes scrolls into the 3D layer
export default function Codex3DPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <ThreeScene entries={codexEntries} />
    </main>
  );
}
