/**
 * ERS_STATE_MODE
 * ------------------------------------------
 * PASSIVE     – system logs behaviour only; no visual output
 * ACTIVE      – fog & symbolic feedback enabled after first phrase
 * REFLECTIVE  – advanced state: behaviour + phrase fusion with prompts
 *
 * Import wherever ERS state control is required.
 */

const ERS_STATE_MODE = Object.freeze({
    PASSIVE: 'passive',
    ACTIVE: 'active',
    REFLECTIVE: 'reflective',
  });
  
  export default ERS_STATE_MODE;
  