const PARSE_VERSION = 1;

const SUPPORTED_COMMANDS = new Set([
  'expense',
  'income',
  'salary',
  'tips',
  'tipfix',
  'loan',
  'repay',
  'updatefunds',
  'sharedexpense',
  'contribute',
  'retained',
  'cashup',
  'table',
  'clockin',
  'clockout',
  'weeklyshifts',
  'partytime',
  'endpartytime',
  'quest',
  'reflection',
  'grimoire',
  'routine',
]);

const EVENT_TYPES = {
  expense: 'finance.expense',
  income: 'finance.income',
  salary: 'finance.salary',
  tips: 'finance.tips',
  tipfix: 'finance.tipfix',
  loan: 'finance.loan',
  repay: 'finance.repay',
  updatefunds: 'finance.updatefunds',
  sharedexpense: 'shared_finance.sharedexpense',
  contribute: 'shared_finance.contribute',
  retained: 'finance.retained',
  cashup: 'waitering.cashup',
  table: 'waitering.table',
  clockin: 'waitering.clockin',
  clockout: 'waitering.clockout',
  weeklyshifts: 'waitering.weeklyshifts',
  partytime: 'personal.partytime.start',
  endpartytime: 'personal.partytime.end',
  quest: 'quest',
  reflection: 'reflection',
  grimoire: 'grimoire',
  routine: 'maintenance.routine',
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

function formatTime(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

function parseShiftToken(token) {
  const normalized = String(token || '').trim().toLowerCase();
  if (normalized === 'off') {
    return {
      input: token,
      status: 'off',
      start_time: null,
      end_time: null,
      label: 'Off',
    };
  }

  const match = normalized.match(/^(\d{1,2})-(\d{1,2})$/);
  if (!match) return null;

  let startHour = Number(match[1]);
  let endHour = Number(match[2]);
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) return null;
  if (startHour < 1 || startHour > 12 || endHour < 1 || endHour > 12) return null;

  if (startHour < 7) startHour += 12;
  if (endHour <= startHour) endHour += 12;
  if (endHour > 23) return null;

  return {
    input: token,
    status: 'scheduled',
    start_time: formatTime(startHour),
    end_time: formatTime(endHour),
    label: `${formatTime(startHour)}-${formatTime(endHour)}`,
  };
}

function baseResult({ raw, command, eventType, valid, type = eventType, label = '', description = '', amounts = {}, payload = {}, summary = '', error = null }) {
  return {
    valid,
    command,
    event_type: eventType,
    type,
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

  if (['expense', 'retained'].includes(command)) {
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

  if (command === 'income') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const source = parts.slice(1).join(' ').trim();
    if (amount == null || !source) {
      return invalidResult(raw, command, eventType, '/income needs amount and source, like /income 9200 Bossa April total.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: source,
      description: source,
      amounts: { amount },
      payload: { source, rawContent: raw },
      summary: `Income detected: ${formatCurrency(amount)} from ${source}.`,
    });
  }

  if (command === 'cashup') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const turnover = parseAmountToken(parts[0]);
    const retained = parseAmountToken(parts[1]);
    const cashHome = parseAmountToken(parts[2]);
    if (turnover == null || retained == null || cashHome == null) {
      return invalidResult(raw, command, eventType, '/cashup needs turnover, retained, and cashHome, like /cashup 7000 800 100.');
    }

    const nonCashRetained = retained - cashHome;
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
        cash: cashHome,
        cashHome,
        nonCashRetained,
        retainedPercentage,
      },
      payload: {},
      summary: `Cashup detected: ${formatCurrency(turnover)} turnover, ${formatCurrency(retained)} retained, ${formatCurrency(cashHome)} cashHome, ${formatPercent(retainedPercentage)} retained.`,
    });
  }

  if (command === 'salary') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const source = parts.slice(1).join(' ').trim();
    if (amount == null || !source) {
      return invalidResult(raw, command, eventType, '/salary needs amount and source, like /salary 4500 Bossa.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: source,
      description: source,
      amounts: { amount },
      payload: { source, rawContent: raw },
      summary: `Salary detected: ${formatCurrency(amount)} from ${source}.`,
    });
  }

  if (command === 'tips') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const source = parts.slice(1).join(' ').trim();
    if (amount == null || !source) {
      return invalidResult(raw, command, eventType, '/tips needs amount and source, like /tips 740 Bossa shift.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: source,
      description: source,
      amounts: { amount },
      payload: { source, rawContent: raw },
      summary: `Tips detected: ${formatCurrency(amount)} from ${source}.`,
    });
  }

  if (command === 'tipfix') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const reason = parts.slice(1).join(' ').trim();
    if (amount == null || !reason) {
      return invalidResult(raw, command, eventType, '/tipfix needs amount and reason, like /tipfix 820 corrected tips.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: reason,
      description: reason,
      amounts: { amount },
      payload: { reason, rawContent: raw },
      summary: `Tip correction detected: ${formatCurrency(amount)} for ${reason}.`,
    });
  }

  if (command === 'loan') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const person = parts[1] || '';
    const direction = (parts[2] || '').toLowerCase();
    const reason = parts.slice(3).join(' ').trim();

    if (amount == null || !person || !direction) {
      return invalidResult(raw, command, eventType, '/loan needs amount, person, direction, and reason, like /loan 500 Dad borrowed food.');
    }

    if (!['borrowed', 'lent'].includes(direction)) {
      return invalidResult(raw, command, eventType, '/loan direction must be borrowed or lent, like /loan 300 Justin lent petrol.');
    }

    if (!reason) {
      return invalidResult(raw, command, eventType, '/loan needs a reason after the direction, like /loan 500 Dad borrowed food.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: `${person} ${direction}`,
      description: reason,
      amounts: { amount },
      payload: { person, direction, reason, rawContent: raw },
      summary: `Loan detected: ${formatCurrency(amount)} ${direction} ${direction === 'borrowed' ? 'from' : 'to'} ${person} for ${reason}.`,
    });
  }

  if (command === 'repay') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const person = parts[1] || '';
    const reason = parts.slice(2).join(' ').trim();

    if (amount == null || !person || !reason) {
      return invalidResult(raw, command, eventType, '/repay needs amount, person, and reason, like /repay 200 Dad partial food loan.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: `${person} repayment`,
      description: reason,
      amounts: { amount },
      payload: { person, reason, rawContent: raw },
      summary: `Repayment detected: ${formatCurrency(amount)} for ${person}, ${reason}.`,
    });
  }

  if (command === 'updatefunds') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const reason = parts.slice(1).join(' ').trim();

    if (amount == null || !reason) {
      return invalidResult(raw, command, eventType, '/updatefunds needs amount and reason, like /updatefunds 3200 cash-on-hand after untracked expenses.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: 'Funds update',
      description: reason,
      amounts: { amount },
      payload: { reason, rawContent: raw },
      summary: `Funds update detected: ${formatCurrency(amount)} actual funds, ${reason}.`,
    });
  }

  if (command === 'sharedexpense') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const category = parts[1] || '';
    const reason = parts.slice(2).join(' ').trim();

    if (amount == null || !category || !reason) {
      return invalidResult(raw, command, eventType, '/sharedexpense needs amount, category, and reason, like /sharedexpense 12000 rent expected monthly rent.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: category,
      description: reason,
      amounts: { amount },
      payload: { category, reason, rawContent: raw },
      summary: `Shared expense detected: ${formatCurrency(amount)} for ${category}, ${reason}.`,
    });
  }

  if (command === 'contribute') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const amount = parseAmountToken(parts[0]);
    const goal = parts[1] || '';
    const reason = parts.slice(2).join(' ').trim();

    if (amount == null || !goal || !reason) {
      return invalidResult(raw, command, eventType, '/contribute needs amount, goal, and reason, like /contribute 3000 moveout Caide May contribution.');
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label: goal,
      description: reason,
      amounts: { amount },
      payload: { goal, reason, rawContent: raw },
      summary: `Contribution detected: ${formatCurrency(amount)} toward ${goal}, ${reason}.`,
    });
  }

  if (command === 'routine') {
    const parts = rest.split(/\s+/).filter(Boolean);
    const action = (parts[0] || '').toLowerCase();
    const title = parts.slice(1).join(' ').trim();

    if (!['add', 'done', 'remove', 'due'].includes(action)) {
      return invalidResult(raw, command, eventType, '/routine needs add, done, remove, or due.');
    }

    if (action !== 'due' && !title) {
      return invalidResult(raw, command, eventType, `/routine ${action} needs a title, like /routine ${action} Lock doors.`);
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: 'routine',
      valid: true,
      label: title || 'Due maintenance loops',
      description: title,
      amounts: {},
      payload: { action, title, rawContent: raw },
      summary: action === 'due'
        ? 'Routine due check detected.'
        : `Routine ${action} detected: ${title}.`,
    });
  }

  if (command === 'weeklyshifts') {
    const tokens = rest.split(/\s+/).filter(Boolean);
    if (tokens.length !== 7) {
      return invalidResult(raw, command, eventType, '/weeklyshifts needs exactly 7 shift tokens, Monday through Sunday.');
    }

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const shifts = [];

    for (let index = 0; index < tokens.length; index += 1) {
      const parsedShift = parseShiftToken(tokens[index]);
      if (!parsedShift) {
        return invalidResult(
          raw,
          command,
          eventType,
          `Could not parse ${weekdays[index]} shift "${tokens[index]}". Use off or a simple range like 8-4.`
        );
      }

      shifts.push({
        ...parsedShift,
        day_of_week: index + 1,
        day: weekdays[index],
      });
    }

    return baseResult({
      raw,
      command,
      eventType,
      type: 'weeklyshifts',
      valid: true,
      label: 'Weekly shifts',
      description: shifts.map((shift) => `${shift.day}: ${shift.label}`).join(', '),
      amounts: {},
      payload: { shifts, rawContent: raw },
      summary: `Weekly shifts detected: ${shifts.map((shift) => shift.label).join(', ')}.`,
    });
  }

  if (['clockin', 'clockout'].includes(command)) {
    const label = rest || 'Bossa shift';
    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label,
      description: label,
      amounts: {},
      payload: { label, rawContent: raw },
      summary: `${command === 'clockin' ? 'Clock-in' : 'Clock-out'} detected: ${label}.`,
    });
  }

  if (['partytime', 'endpartytime'].includes(command)) {
    const label = 'partytime';
    return baseResult({
      raw,
      command,
      eventType,
      type: command,
      valid: true,
      label,
      description: label,
      amounts: {},
      payload: { rawContent: raw },
      summary: command === 'partytime'
        ? 'Party Time start detected.'
        : 'Party Time end detected.',
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
