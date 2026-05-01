const FINANCE_COMMANDS = new Set(['income', 'expense', 'savings']);

function amountValue(value) {
  const num = Number(String(value || '').replace(/,/g, '').replace(/[Rr]\s*/, ''));
  return Number.isFinite(num) ? num : null;
}

function dateKey(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

export function parseFinanceCommand(rawNote) {
  const raw = String(rawNote || '');
  const trimmed = raw.trim();
  const match = trimmed.match(/^\/([a-z]+)(?:\s+([\s\S]*))?$/i);
  if (!match) return null;

  const command = match[1].toLowerCase();
  if (!FINANCE_COMMANDS.has(command)) return null;

  const rest = (match[2] || '').trim();
  const amountMatch = rest.match(/^(?:R\s*)?([+-]?\d[\d,]*(?:\.\d+)?)(?:\s+([\s\S]*))?$/i);
  const amount = amountMatch ? amountValue(amountMatch[1]) : null;
  if (amount == null || amount <= 0) {
    return {
      valid: false,
      command,
      type: command,
      event_type: `finance.${command}`,
      raw,
      error: `/${command} needs a positive amount, like /${command} 500 groceries.`,
    };
  }

  const detail = (amountMatch[2] || '').trim();
  if (command === 'income' && !detail) {
    return {
      valid: false,
      command,
      type: command,
      event_type: `finance.${command}`,
      raw,
      error: '/income needs amount and source, like /income 9200 Bossa April verified total.',
    };
  }

  const [categoryToken, ...descriptionParts] = detail.split(/\s+/).filter(Boolean);
  const source = command === 'income' ? detail : null;
  const category = command === 'income' ? source : categoryToken || null;
  const description = command === 'income' ? null : descriptionParts.join(' ').trim() || detail || null;

  return {
    valid: true,
    command,
    type: command,
    event_type: `finance.${command}`,
    amount,
    amounts: { amount },
    source,
    category,
    label: category || command,
    description,
    payload: command === 'income' ? { source, rawContent: raw } : { category },
    summary: `${command[0].toUpperCase()}${command.slice(1)} detected: R${amount.toFixed(2)}${detail ? ` ${detail}` : ''}.`,
    raw,
  };
}

export function createFinanceTransactionRow({ parsed, ownerId, sourceNote }) {
  if (!parsed?.valid || !ownerId || !sourceNote?.id) return null;

  return {
    owner_id: ownerId,
    source_note_id: sourceNote.id,
    type: parsed.type,
    amount: parsed.amount,
    category: parsed.category,
    description: parsed.description,
    occurred_on: dateKey(sourceNote.created_at),
  };
}
