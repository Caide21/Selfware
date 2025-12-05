// modules/cards/cardSchemas.js
// Simple widget vocabulary for the editor. Start with quest.
export const CARD_SCHEMAS = {
  quest: {
    title: {
      widget: 'text',
      label: 'Title',
      required: true,
    },
    description: {
      widget: 'textarea',
      label: 'Description',
      // Maps to extra_info on the quest row.
    },
    status: {
      widget: 'select',
      label: 'Status',
      options: ['backlog', 'ready', 'in_progress', 'blocked', 'completed', 'archived'],
    },
    xpValue: {
      widget: 'number',
      label: 'XP',
      min: 0,
    },
  },
  habit: {
    title: {
      widget: 'text',
      label: 'Habit name',
      required: true,
    },
    description: {
      widget: 'textarea',
      label: 'Description',
    },
    cadence: {
      widget: 'text',
      label: 'Cadence',
    },
    streak: {
      widget: 'number',
      label: 'Streak',
      min: 0,
    },
    status: {
      widget: 'select',
      label: 'Status',
      options: ['active', 'paused', 'completed'],
    },
    xpValue: {
      widget: 'number',
      label: 'XP',
      min: 0,
    },
  },
  waiterTable: {
    table_number: {
      label: 'Table number',
      widget: 'text',
    },
    guests: {
      label: 'Guests',
      widget: 'number',
      min: 0,
    },
    bill_total: {
      label: 'Bill total',
      widget: 'number',
      min: 0,
    },
    tip_amount: {
      label: 'Tip amount',
      widget: 'number',
      min: 0,
    },
    payment_method: {
      label: 'Payment method',
      widget: 'select',
      options: ['card', 'cash', 'mixed'],
    },
    notes: {
      label: 'Notes',
      widget: 'textarea',
    },
  },
};
