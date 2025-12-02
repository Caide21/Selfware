import Card from '@/components/CardKit/Card';
import { useCardPersistence } from '@/modules/cards/useCardPersistence';
import { hasEditAccess } from '@/lib/auth/permissions';

export default function InventoryCard({
  item,
  user,
  onAddToLoadout,
  onEdit,
  onDuplicate,
  onRemove,
  footer,
  children,
}) {
  const { updateCard, deleteCard, duplicateCard } = useCardPersistence({ table: 'inventory_items' });
  const canEdit = hasEditAccess(user);
  const quantity = item.quantity ?? item.qty ?? item.details?.quantity ?? null;

  const handleEdit = () => {
    if (onEdit) return onEdit(item);
    return updateCard(item.id, { ...item });
  };

  const handleDuplicate = () => {
    if (onDuplicate) return onDuplicate(item);
    return duplicateCard(item.id);
  };

  const handleRemove = () => {
    if (onRemove) return onRemove(item);
    return deleteCard(item.id);
  };

  const defaultFooter =
    canEdit && (
      <div className="flex gap-2">
        <button onClick={() => onAddToLoadout?.(item)} className="btn btn-soft">
          Add to Loadout...
        </button>
        <button onClick={handleEdit} className="btn">
          Edit
        </button>
        <button onClick={handleDuplicate} className="btn">
          Duplicate
        </button>
        <button onClick={handleRemove} className="btn btn-danger">
          Remove
        </button>
      </div>
    );

  return (
    <Card
      variant="info"
      title={item.name}
      subtitle={item.kind}
      meta={quantity != null ? `x${quantity}` : null}
      interactive={canEdit}
      footer={footer ?? defaultFooter}
    >
      {children ?? item.description ?? item.details?.description ?? item.details?.notes}
    </Card>
  );
}
