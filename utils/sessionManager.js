// utils/sessionManager.js
import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'data', 'sessions.json');

function readSessions() {
  if (!fs.existsSync(dataPath)) return {};
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data || '{}');
}

function writeSessions(sessions) {
  fs.writeFileSync(dataPath, JSON.stringify(sessions, null, 2));
}

export function getSession(id) {
  const sessions = readSessions();
  return sessions[id] || null;
}

export function createOrUpdateSession(id, meta = {}) {
  const sessions = readSessions();
  const now = Date.now();

  const existing = sessions[id];
  const session = existing
    ? {
        ...existing,
        lastSeen: now,
        visitCount: (existing.visitCount || 1) + 1,
      }
    : {
        id,
        createdAt: now,
        lastSeen: now,
        visitCount: 1,
        state: 'Wanderer',
        ...meta,
      };

  sessions[id] = session;
  writeSessions(sessions);
  return session;
}
