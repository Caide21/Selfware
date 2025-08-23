import Link from "next/link";
import { notion } from "../lib/notion";
import PageShell from "@/components/Layout/PageShell";

export default function CodexPage({ codexEntries }) {
  return (
    <PageShell
      heading={{
        emoji: "📜",
        title: "The Codex",
        subtitle: "Core beliefs, operating principles, and the grammar of The Mirror OS.",
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-2 sm:px-0 max-w-6xl mx-auto">
        {codexEntries.map(({ title, slug, description, symbol }) => (
          <Link key={slug} href={`/${slug}`}>
            <div className="bg-white/10 border border-white/10 rounded-xl p-6 hover:bg-white/20 transition">
              <h2 className="text-xl font-semibold mb-2">
                {symbol} {title}
              </h2>
              <p className="text-sm text-white/70">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

export async function getServerSideProps() {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_CODEX_REPOSITORY_ID,
  });

  const codexEntries = response.results.map((page) => ({
    title: page.properties.Name?.title?.[0]?.plain_text || "Untitled",
    slug: page.properties.Slug?.rich_text?.[0]?.plain_text || "",
    description: page.properties.Description?.rich_text?.[0]?.plain_text || "",
    symbol: page.properties.Symbol?.rich_text?.[0]?.plain_text || "",
  }));

  return { props: { codexEntries } };
}
