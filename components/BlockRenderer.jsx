export default function BlockRenderer({ blocks }) {
  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        console.log("🔎 Block type:", block.type, block);

        switch (block.type) {
          case 'paragraph': {
            const textContent = block.paragraph.rich_text
              ?.map((text) => text.plain_text)
              .join('');

            const hasChildren = block.children && block.children.length > 0;

            return (
              <div key={block.id} className="space-y-2">
                {textContent && (
                  <p className="text-theme-muted">{textContent}</p>
                )}
                {hasChildren && (
                  <BlockRenderer blocks={block.children} />
                )}
              </div>
            );
          }

          case 'heading_1':
            return (
              <h2 key={block.id} className="text-2xl font-bold">
                {block.heading_1.rich_text
                  .map((text) => text.plain_text)
                  .join('')}
              </h2>
            );

          case 'heading_2':
            return (
              <h3 key={block.id} className="text-xl font-semibold">
                {block.heading_2.rich_text
                  .map((text) => text.plain_text)
                  .join('')}
              </h3>
            );

          case 'quote':
            return (
              <blockquote
                key={block.id}
                className="border-l-4 border-theme-muted pl-4 italic text-theme-muted"
              >
                {block.quote.rich_text
                  .map((text) => text.plain_text)
                  .join('')}
              </blockquote>
            );

          case 'bulleted_list_item':
            return (
              <ul key={block.id} className="list-disc pl-6">
                <li>
                  {block.bulleted_list_item.rich_text
                    .map((text) => text.plain_text)
                    .join('')}
                </li>
              </ul>
            );

          case 'numbered_list_item':
            return (
              <ol key={block.id} className="list-decimal pl-6">
                <li>
                  {block.numbered_list_item.rich_text
                    .map((text) => text.plain_text)
                    .join('')}
                </li>
              </ol>
            );

          case 'callout':
            return (
              <div
                key={block.id}
                className="p-4 bg-theme-muted/10 rounded border-l-4 border-theme-muted"
              >
                {block.callout.rich_text
                  .map((text) => text.plain_text)
                  .join('')}
              </div>
            );

          case 'divider':
            return (
              <hr
                key={block.id}
                className="border-theme-muted/20 my-6"
              />
            );

          case 'synced_block':
            console.log('🌀 Synced block children:', block.children);
            return (
              <div
                key={block.id}
                className="ml-4 border-l border-theme-muted pl-4"
              >
                <BlockRenderer blocks={block.children} />
              </div>
            );

          default:
            return (
              <p key={block.id} className="text-red-500">
                ❌ Unsupported block: {block.type}
              </p>
            );
        }
      })}
    </div>
  );
}
