import Link from "next/link";
import { supabase } from "../../lib/supabase";
import { ZONE_MAP } from "../../lib/zones";

export default function QuestsPage({ quests }) {
  console.log("Fetched quests:", quests);11
  return (
    <main className="min-h-screen px-6 py-20">
      <h1 className="text-4xl font-bold mb-8 text-center">🎯 Your Quests</h1>

      {quests.length === 0 && (
        <p className="text-center text-theme-muted">
          No quests found yet. Add some to your Supabase DB!
        </p>
      )}

      {Object.entries(
        quests.reduce((acc, quest) => {
          const zone = quest.zone || "Unzoned";
          if (!acc[zone]) acc[zone] = [];
          acc[zone].push(quest);
          return acc;
        }, {})
      ).map(([zone, zoneQuests]) => {
        const zoneMeta = ZONE_MAP[zone] || {
          name: zone,
          emoji: "❓",
          description: ""
        };

        return (
          <section key={zone} className="mb-16 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">
              {zoneMeta.emoji} {zoneMeta.name}
            </h2>
            {zoneMeta.description && (
              <p className="mb-4 text-sm text-theme-muted">
                {zoneMeta.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {zoneQuests.map(({ title, slug, description, symbol, tags }) => (
                <Link key={slug} href={`/${slug}`}>
                  <div className="bg-white/10 border border-white/10 rounded-xl p-6 hover:bg-white/20 transition">
                    <h3 className="text-xl font-semibold mb-2">
                      {symbol} {title}
                    </h3>
                    <p className="text-sm text-white/70">{description}</p>
                    {Array.isArray(tags) && tags.length > 0 && (
                      <p className="mt-2 text-xs text-theme-muted">
                        {tags.map((tag) => `#${tag}`).join(" ")}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

export async function getServerSideProps() {
  const { data: quests, error } = await supabase
    .from("quests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return { props: { quests: [] } };
  }

  return { props: { quests } };
}
