import { INTERACTION_ACTIONS } from './actionRegistry';

export function createNoteInteractionTarget(note) {
  const firstLine = note?.content?.split('\n')?.[0]?.trim();

  return {
    id: note?.id,
    type: 'note',
    label: firstLine?.slice(0, 80) || 'Untitled note',
    zone: note?.zone || 'general',
    allowedActions: [
      INTERACTION_ACTIONS.createReflectionFromNote.key,
      INTERACTION_ACTIONS.deleteNote.key,
    ],
  };
}
