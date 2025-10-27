import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useCardStore } from '@/components/CardBuilder/useCardStore';

export default function useLoadUserCards(enabled = true) {
  const setCards = useCardStore((state) => state.setCards);
  const setAttachments = useCardStore((state) => state.setAttachments);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelled) return;

      const { data: cards, error: cardsError } = await supabase
        .from('cards')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (cardsError || cancelled) {
        console.error('[useLoadUserCards] cards error', cardsError);
        return;
      }

      setCards(cards || []);

      const ids = (cards || []).map((card) => card.id);
      if (!ids.length || cancelled) return;

      const { data: attachments, error: attachmentsError } = await supabase
        .from('attachments')
        .select('*')
        .in('card_id', ids);

      if (attachmentsError || cancelled) {
        console.error('[useLoadUserCards] attachments error', attachmentsError);
        return;
      }

      const grouped = {};
      (attachments || []).forEach((attachment) => {
        if (!grouped[attachment.card_id]) grouped[attachment.card_id] = [];
        grouped[attachment.card_id].push(attachment);
      });

      Object.entries(grouped).forEach(([cardId, list]) => {
        setAttachments(cardId, list);
      });
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [enabled, setCards, setAttachments]);
}
