// components/SendReflection.js
import { useState } from "react";

export default function SendReflection() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const sendToBackend = async () => {
    const res = await fetch("http://127.0.0.1:8000/reflection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20 shadow-xl space-y-4">
      <textarea
        className="w-full p-4 text-white bg-black/30 rounded-md border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        placeholder="Write your reflection..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={5}
      />
      <button
        onClick={sendToBackend}
        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md transition-all"
      >
        Send to Aether
      </button>
      {response && (
        <div className="mt-4 p-4 bg-white/10 text-white border border-white/20 rounded-md">
          <strong>Response:</strong> {response}
        </div>
      )}
    </div>
  );
}
