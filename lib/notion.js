// lib/notion.js

import { Client } from '@notionhq/client';

// ✅ Notion client
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// ✅ Fetch a Codex page by slug
export async function fetchCodexPageBySlug(slug) {
  const databaseId = process.env.NOTION_CODEX_REPOSITORY_ID;

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Slug",
      rich_text: { equals: slug }
    },
  });

  if (response.results.length === 0) throw new Error("Not found");

  const page = response.results[0];
  const pageId = page.id;

  const blocks = await getAllBlocks(pageId);

  return {
    title: page.properties.Name.title[0]?.plain_text || '',
    slug: page.properties.Slug.rich_text[0]?.plain_text || '',
    updated: page.last_edited_time || '',
    blocks,
    properties: page.properties, // Pass raw if needed
  };
}

// ✅ Fetch a Scroll page (Quests) by slug
export async function fetchScrollPageBySlug(slug) {
  const databaseId = process.env.NOTION_SCROLL_REPOSITORY_ID;

  const response = await notion.databases.query({
    database_id: databaseId,
    filter: {
      property: "Slug",
      rich_text: { equals: slug }
    },
  });

  if (response.results.length === 0) throw new Error("Not found");

  const page = response.results[0];
  const pageId = page.id;

  const blocks = await getAllBlocks(pageId);

  return {
    title: page.properties.Name.title[0]?.plain_text || '',
    slug: page.properties.Slug.rich_text[0]?.plain_text || '',
    updated: page.last_edited_time || '',
    blocks,
    properties: page.properties, // Pass raw if needed
  };
}

// ✅ Recursive helper for blocks
async function getAllBlocks(blockId) {
  const res = await notion.blocks.children.list({ block_id: blockId });
  const blocks = await Promise.all(
    res.results.map(async (block) => {
      if (block.has_children) {
        block.children = await getAllBlocks(block.id);
      }
      return block;
    })
  );
  return blocks;
}
