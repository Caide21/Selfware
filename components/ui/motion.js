export const MOTION_STATES = {
  idle: '',
  hover: 'motion-hover',
  selected: 'motion-selected',
  equipped: 'motion-equipped',
  today: 'motion-today',
  new: 'motion-new',
  error: 'motion-error',
  pending: 'motion-pending',
};

export const MOTION_INTENTS = {
  quiet: 'motion-quiet',
  active: 'motion-active',
  alert: 'motion-alert',
  celebrate: 'motion-celebrate',
};

export function motionFor({ state = 'idle', intent = 'quiet' } = {}) {
  const stateKey = state in MOTION_STATES ? state : 'idle';
  const intentKey = intent in MOTION_INTENTS ? intent : 'quiet';

  const classNames = [MOTION_STATES[stateKey], MOTION_INTENTS[intentKey]]
    .filter(Boolean)
    .join(' ');

  return {
    className: classNames,
    attrs: {
      'data-state': stateKey,
      'data-intent': intentKey,
    },
  };
}
