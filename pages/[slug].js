import { Client } from '@notionhq/client';
import SmartRenderer from '@/components/SmartRenderer';
import PageShell from '@/components/Layout/PageShell';

export async function getServerSideProps({ params }) {
  const notion = new Client({ auth: process.env.NOTION_TOKEN });
  const slug = params.slug;

  const dbs = [
    process.env.NOTION_SCROLLS_REPOSITORY_ID,
    process.env.NOTION_RITUALS_REPOSITORY_ID,
    process.env.NOTION_CODEX_REPOSITORY_ID,
    process.env.NOTION_QUESTS_REPOSITORY_ID,
  ].filter(Boolean);

  let page = null;
  let blocks = [];

  for (const id of dbs) {
    const res = await notion.databases.query({
      database_id: id,
      filter: {
        property: 'Slug',
        rich_text: { equals: slug },
      },
    });

    if (res.results.length > 0) {
      page = res.results[0];

      const blockRes = await notion.blocks.children.list({
        block_id: page.id,
      });

      blocks = blockRes.results;
      break;
    }
  }

  if (!page) return { notFound: true };

  return {
    props: { page, blocks },
  };
}

export default function SlugPage({ page, blocks }) {
  const title = page.properties?.Name?.title?.[0]?.plain_text ?? "Untitled";
  const emoji = page.properties?.Symbol?.rich_text?.[0]?.plain_text ?? "📄";
  const subtitle = page.properties?.Description?.rich_text?.[0]?.plain_text ?? "";

  return (
    <PageShell
      heading={{
        emoji,
        title,
        subtitle,
      }}
    >
      <div className="max-w-3xl mx-auto px-4">
        <SmartRenderer page={page} blocks={blocks} mode="detail" />
      </div>
    </PageShell>
  );
}
