import { initERSCore } from './autoInject';

export function initERS({ endpoint, onFeedback, config = {} }) {
  initERSCore({ endpoint, onFeedback, config });
}