/**
 * ERS Snapshot Schema
 * --------------------------------------------------------
 * Formal JSON-Schema describing the structure of behaviour
 * snapshots collected while ERS is in PASSIVE mode.
 *
 *  Field                   Type            Description
 * ─────────────────────────────────────────────────────────
 *  timestamp               string (ISO)    Capture time
 *  signalType              enum            idle | scroll-freeze |
 *                                          hover-hesitation |
 *                                          interaction-abort
 *  value                   number          Seconds (or 0)
 *  label                   string|null     Optional element label
 *  ersStateAtCapture       enum            passive | active | reflective
 *  confidence              number?         0-1 (optional, future use)
 */

const ERS_SNAPSHOT_SCHEMA = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'ERS Behaviour Snapshot',
    type: 'object',
    additionalProperties: false,
    required: ['timestamp', 'signalType', 'value', 'ersStateAtCapture'],
    properties: {
      timestamp: { type: 'string', format: 'date-time' },
      signalType: {
        type: 'string',
        enum: [
          'idle',
          'scroll-freeze',
          'hover-hesitation',
          'interaction-abort',
        ],
      },
      value: { type: 'number', minimum: 0 },
      label: { type: ['string', 'null'] },
      ersStateAtCapture: {
        type: 'string',
        enum: ['passive', 'active', 'reflective'],
      },
      confidence: { type: 'number', minimum: 0, maximum: 1 },
    },
  };
  
  export default ERS_SNAPSHOT_SCHEMA;
  