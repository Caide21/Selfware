import React from "react";

export default function RecentLogPanel({ logs = [] }) {
  return (
    <div className="bg-black/20 p-4 rounded-xl border">
      <div className="text-sm text-gray-400 mb-1">📜 Recent Logs</div>
      {logs.length > 0 ? (
        <ul className="text-sm text-gray-300 list-disc ml-5">
          {logs.map((log, idx) => (
            <li key={idx}>{log}</li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-gray-500">No recent logs</div>
      )}
    </div>
  );
}