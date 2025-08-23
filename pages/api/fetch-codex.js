import { notion } from "@/lib/notion";

export default async function handler(req, res) {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ error: "Missing title parameter." });
  }

  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_CODEX_REPOSITORY_ID,
      filter: {
        property: "Name",
        title: { equals: title }
      },
    });

    if (!response.results.length) {
      return res.status(404).json({ error: "No page found with that title." });
    }

    const page = response.results[0];

    // You can return whichever props you need
    res.status(200).json({
      title: page.properties.Name.title[0]?.plain_text || "",
      slug: page.properties.Slug?.rich_text?.[0]?.plain_text || "",
      type: page.properties.Type?.select?.name || "Unknown",
      description: page.properties.Description?.rich_text?.[0]?.plain_text || "",
      updated: page.last_edited_time || "",
      properties: page.properties,
    });
  } catch (error) {
    console.error("Fetch Codex API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
