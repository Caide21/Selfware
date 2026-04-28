export const INTERACTION_ACTIONS = {
  createReflectionFromNote: {
    key: 'createReflectionFromNote',
    label: 'Create Reflection',
    targetTypes: ['note'],
  },
  deleteNote: {
    key: 'deleteNote',
    label: 'Delete Note',
    targetTypes: ['note'],
  },
  deleteReflection: {
    key: 'deleteReflection',
    label: 'Delete Reflection',
    targetTypes: ['reflection'],
  },
};

export function getAllowedInteractionActions(target) {
  if (!target?.allowedActions?.length) return [];

  return target.allowedActions
    .map((actionKey) => INTERACTION_ACTIONS[actionKey])
    .filter((action) => action && action.targetTypes.includes(target.type));
}

async function runDeleteAction({ target, context, table, confirmMessage, onSuccess, errorLabel }) {
  if (!target?.id) {
    console.warn(`[InteractionLayer] Missing target id for ${errorLabel}`, target);
    return;
  }

  if (!context.supabase) {
    console.warn(`[InteractionLayer] Missing Supabase client for ${errorLabel}`, target);
    return;
  }

  const confirmed = window.confirm(confirmMessage);
  if (!confirmed) return;

  try {
    const { error } = await context.supabase.from(table).delete().eq('id', target.id);
    if (error) throw error;

    onSuccess?.(target.id);
  } catch (deleteError) {
    console.error(`[InteractionLayer] Failed to ${errorLabel}`, deleteError);
    window.alert(`Could not ${errorLabel}.`);
  }
}

export async function runInteractionAction(actionKey, target, context = {}) {
  if (actionKey === INTERACTION_ACTIONS.createReflectionFromNote.key) {
    if (!target?.id) {
      console.warn('[InteractionLayer] Missing note id for reflection action', target);
      return;
    }

    context.router?.push({
      pathname: '/reflections',
      query: { sourceNoteId: target.id },
    });
    return;
  }

  if (actionKey === INTERACTION_ACTIONS.deleteNote.key) {
    await runDeleteAction({
      target,
      context,
      table: 'notes',
      confirmMessage: 'Delete this note?',
      onSuccess: context.onDeleteNote,
      errorLabel: 'delete note',
    });
    return;
  }

  if (actionKey === INTERACTION_ACTIONS.deleteReflection.key) {
    await runDeleteAction({
      target,
      context,
      table: 'reflections',
      confirmMessage: 'Delete this reflection?',
      onSuccess: context.onDeleteReflection,
      errorLabel: 'delete reflection',
    });
    return;
  }

  console.warn('[InteractionLayer] Unknown action', { actionKey, target });
}
