function isMissingRpc(error) {
  const message = String(error?.message || '').toLowerCase();
  return error?.code === 'PGRST202' || error?.code === '42883' || message.includes('could not find the function');
}

async function deleteViaClient(supabase, noteId) {
  const { error: financeError } = await supabase
    .from('finance_transactions')
    .delete()
    .eq('source_note_id', noteId);

  if (financeError) {
    throw new Error(`Could not delete finance data for this note: ${financeError.message}`);
  }

  const { error: eventError } = await supabase
    .from('note_events')
    .delete()
    .eq('note_id', noteId);

  if (eventError) {
    throw new Error(`Could not delete command events for this note: ${eventError.message}`);
  }

  const { data, error: noteError } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .select('id')
    .maybeSingle();

  if (noteError) {
    throw new Error(`Command data was deleted, but the note could not be deleted: ${noteError.message}`);
  }

  if (!data?.id) {
    throw new Error('Note was not deleted. It may already be gone, or you may not have permission to delete it.');
  }

  return data;
}

export async function deleteNoteWithDerivedData(supabase, noteId) {
  if (!supabase) throw new Error('Supabase client is required to delete notes.');
  if (!noteId) throw new Error('Note id is required to delete notes.');

  const { error: rpcError } = await supabase.rpc('delete_note_with_derived_data', {
    target_note_id: noteId,
  });

  if (!rpcError) return { id: noteId };
  if (!isMissingRpc(rpcError)) throw rpcError;

  return deleteViaClient(supabase, noteId);
}
