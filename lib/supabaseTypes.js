// Lightweight shared Supabase shapes (JSDoc only)

/**
 * @typedef {Object} InventoryItem
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {string=} kind
 * @property {any} details
 * @property {string=} location
 * @property {boolean} stackable
 * @property {string=} created_at
 * @property {string=} updated_at
 */

/**
 * @typedef {Object} LoadoutItemRow
 * @property {string} id
 * @property {string} loadout_id
 * @property {string} item_id
 * @property {number=} quantity
 * @property {string=} notes
 * @property {InventoryItem=} item
 */

/**
 * @typedef {Object} Loadout
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {any[]} tags
 * @property {boolean} is_today
 * @property {Array<LoadoutItemRow>=} items
 * @property {string=} created_at
 * @property {string=} updated_at
 */

/**
 * @typedef {Object} StatusPanelState
 * @property {string} user_id
 * @property {any[]} attributes
 * @property {any[]} conditions
 * @property {any[]} vitals
 * @property {string=} mood
 * @property {number=} hrv
 * @property {number=} sleep_debt
 * @property {string} updated_at
 */

export {};
