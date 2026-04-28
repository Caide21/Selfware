import { INTERACTION_ACTIONS } from './actionRegistry';

export function createReflectionInteractionTarget(reflection) {
  const firstLine = reflection?.content?.split('\n')?.[0]?.trim();
  const label = reflection?.title?.trim() || firstLine;

  return {
    id: reflection?.id,
    type: 'reflection',
    label: label?.slice(0, 80) || 'Untitled reflection',
    zone: reflection?.zone || 'general',
    allowedActions: [INTERACTION_ACTIONS.deleteReflection.key],
  };
}
