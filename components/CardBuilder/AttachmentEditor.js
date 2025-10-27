import AutoGrowTextarea from '@/components/ui/AutoGrowTextarea';

export default function AttachmentEditor({ attachment, onChange }) {
  if (!attachment) return null;
  const type = attachment.type || 'text';

  if (type === 'text') {
    const value = attachment.payload?.content || '';
    const handleChange = (event) => {
      onChange?.({
        ...attachment,
        payload: {
          ...attachment.payload,
          content: event.target.value,
        },
      });
    };

    return (
      <AutoGrowTextarea
        value={value}
        onChange={handleChange}
        minRows={4}
        placeholder="Write content..."
      />
    );
  }

  return (
    <div className="text-xs text-white/60 italic">
      Editor unavailable for type: {type}
    </div>
  );
}
