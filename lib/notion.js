// lib/notion.js

import { Client } from '@notionhq/client';

// Notion client
export const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const isCodexDebug = process.env.CODEx_DEBUG === '1';

// Fetch lightweight Codex index for sync
export async function fetchCodexIndexFromNotion() {
  const databaseId = process.env.NOTION_CODEX_REPOSITORY_ID;

  if (!databaseId) throw new Error('Missing NOTION_CODEX_REPOSITORY_ID');

  const response = await notion.databases.query({
    database_id: databaseId,
  });

  if (isCodexDebug) {
    console.log(`[Codex Notion] Fetched ${response.results?.length || 0} entries from Notion`);
  }

  return (response.results || []).map((page) => {
    const title = page.properties?.Name?.title?.[0]?.plain_text || 'Untitled';
    const slug = page.properties?.Slug?.rich_text?.[0]?.plain_text || '';
    const description = page.properties?.Description?.rich_text?.[0]?.plain_text || '';
    const symbolProp = page.properties?.Symbol?.rich_text?.[0]?.plain_text || '';
    const iconEmoji = page.icon?.emoji || '';

    return {
      notion_page_id: page.id,
      title,
      slug,
      description,
      symbol: symbolProp || iconEmoji || '',
    };
  });
}

// Fetch a Codex page by slug
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

// Fetch a Scroll page (Quests) by slug
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

// Recursive helper for blocks
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
