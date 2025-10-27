export default function AttachmentRenderer({ attachment }) {
  if (!attachment) return null;
  const type = attachment.type || 'text';

  if (type === 'text') {
    const content = attachment.payload?.content || '';
    return <p className="text-sm text-text-muted leading-relaxed whitespace-pre-wrap">{content}</p>;
  }

  return (
    <div className="text-xs text-text-muted italic">
      Unsupported attachment type: {type}
    </div>
  );
}
