const PARSE_VERSION = 1;

const SUPPORTED_COMMANDS = new Set([
  'expense',
  'income',
  'retained',
  'cashup',
  'table',
  'clockin',
  'clockout',
  'quest',
  'reflection',
  'grimoire',
]);

const EVENT_TYPES = {
  expense: 'finance.expense',
  income: 'finance.income',
  retained: 'finance.retained',
  cashup: 'waitering.cashup',
  table: 'waitering.table',
  clockin: 'waitering.clockin',
  clockout: 'waitering.clockout',
  quest: 'quest',
  reflection: 'reflection',
  grimoire: 'grimoire',
};

function normalizeAmount(value) {
  const parsed = Number(String(value || '').replace(/[Rr]\s*/, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(amount) {
  const num = Number(amount || 0);
  if (!Number.isFinite(num)) return 'R0.00';
  return `R${num.toFixed(2)}`;
}

function formatPercent(amount) {
  const num = Number(amount);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
}

function parseAmountToken(token) {
  return normalizeAmount(token);
}

function parseMoneyAndDescription(rest) {
  const parts = String(rest || '').trim().split(/\s+/).filter(Boolean);
  const amount = parseAmountToken(parts[0]);
  return {
    amount,
    description: parts.slice(1).join(' ').trim(),
  };
}

function baseResult({ raw, command, eventType, valid, label = '', description = '', amounts = {}, payload = {}, summary = '', error = null }) {
  return {
    valid,
    command,
    event_type: eventType,
    type: eventType,
    raw,
    label,
    description,
    amounts,
    payload,
    summary,
    parse_version: PARSE_VERSION,
    error,
  };
}

function invalidResult(raw, command, eventType, error) {
  return baseResult({
    raw,
    command,
    eventType,
    valid: false,
    error,
  });
}

export function parseNoteCommand(rawNote) {
  const raw = String(rawNote || '');
  const trimmed = raw.trimStart();
  if (!trimmed.startsWith('/')) return null;

  const commandMatch = trimmed.match(/^\/([a-z]+)(?:\s+([\s\S]*))?$/i);
  if (!commandMatch) {
    return invalidResult(raw, '', 'unknown', 'Use a command followed by details.');
  }

  const command = commandMatch[1].toLowerCase();
  const rest = (commandMatch[2] || '').trim();
  const eventType = EVENT_TYPES[command] || 'unknown';

  if (!SUPPORTED_COMMANDS.has(command)) {
    return invalidResult(raw, command, eventType, `Unsupported command: /${command}`);
  }

  if (['expense', 'income', 'retained'].includes(command)) {
    const { amount, description } = parseMoneyAndDescription(rest);
    if (amount == null) {
      return invalidResult(raw, command, eventType, `/${command} needs an amount, like /${command} R500 label.`);
    }

    const label = description || command;
    return baseResult({
      raw,
      command,
      eventType,
      valid: true,
      label,
      description,
      amounts: { amount },
      payload: { category: command },
      summary: `${command[0].toUpperCase()}${command.slice(1)} detected: ${formatCurrency(amount)}${description ? ` ${description}` : ''}.`,
    });
  }

  if (command === 'cashup') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const turnover = parseAmountToken(parts[0]);
    const retained = parseAmountToken(parts[1]);
    const cash = parseAmountToken(parts[2]);
    if (turnover == null || retained == null || cash == null) {
      return invalidResult(raw, command, eventType, '/cashup needs turnover, retained, and cash, like /cashup 7000 800 100.');
    }

    const nonCashRetained = retained - cash;
    const retainedPercentage = turnover > 0 ? (retained / turnover) * 100 : null;

    return baseResult({
      raw,
      command,
      eventType,
      valid: true,
      label: 'Cashup',
      description: parts.slice(3).join(' ').trim(),
      amounts: {
        turnover,
        retained,
        cash,
        nonCashRetained,
        retainedPercentage,
      },
      payload: {},
      summary: `Cashup detected: ${formatCurrency(turnover)} turnover, ${formatCurrency(retained)} retained, ${formatCurrency(cash)} cash, ${formatPercent(retainedPercentage)} retained.`,
    });
  }

  if (command === 'table') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const tableNumber = parts[0] || '';
    const billTotal = parseAmountToken(parts[1]);
    const amountTendered = parseAmountToken(parts[2]);
    if (!tableNumber || billTotal == null || amountTendered == null) {
      return invalidResult(raw, command, eventType, '/table needs table number, bill total, and amount tendered, like /table 308 857 957.');
    }

    const tip = amountTendered - billTotal;
    const tipPercentage = billTotal > 0 ? (tip / billTotal) * 100 : null;

    return baseResult({
      raw,
      command,
      eventType,
      valid: true,
      label: `Table ${tableNumber}`,
      description: parts.slice(3).join(' ').trim(),
      amounts: {
        billTotal,
        amountTendered,
        tip,
        tipPercentage,
      },
      payload: { tableNumber },
      summary: `Table ${tableNumber} detected: ${formatCurrency(billTotal)} bill, ${formatCurrency(amountTendered)} tendered, ${formatCurrency(tip)} tip, ${formatPercent(tipPercentage)} tip.`,
    });
  }

  const label = rest;
  if (!label) {
    return invalidResult(raw, command, eventType, `/${command} needs a label or description.`);
  }

  return baseResult({
    raw,
    command,
    eventType,
    valid: true,
    label,
    description: label,
    amounts: {},
    payload: {},
    summary: `${command[0].toUpperCase()}${command.slice(1)} detected: ${label}.`,
  });
}

export default parseNoteCommand;
