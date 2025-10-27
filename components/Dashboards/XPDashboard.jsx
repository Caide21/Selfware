"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

/**
 * XPDashboard
 * - Level bar (progress_view)
 * - Start Pomodoro (xp_pomodoro_sessions) -> trigger awards XP
 * - Award Quest XP (rpc: award_quest_xp)
 * - Recent XP events
 * - NEW: Link GPT card -> mints 8-digit code via Edge Function and shows a live countdown
 */
export default function XPDashboard() {
  const [userId, setUserId] = useState(null);

  // Progress & data
  const [progress, setProgress] = useState(null); // { user_id, total_xp, level, xp_to_next }
  const [events, setEvents] = useState([]);       // [{ amount, source, created_at, meta }]
  const [quests, setQuests] = useState([]);       // [{ id, title, ... }]
  const [loading, setLoading] = useState(true);

  // Actions
  const [questId, setQuestId] = useState("");
  const [pomos, setPomos] = useState("");
  const [pomoMinutes, setPomoMinutes] = useState(25);

  // Link-GPT state
  const [linkCode, setLinkCode] = useState("");
  const [expiresAt, setExpiresAt] = useState(""); // ISO
  const [minting, setMinting] = useState(false);
  const [mintError, setMintError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const timerRef = useRef(null);

  const pct = useMemo(
    () => (progress ? Math.min(100, Math.round((progress.xp_to_next / 100) * 100)) : 0),
    [progress]
  );

  // Initial load
  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      setUserId(auth.user.id);
      await Promise.all([reload(auth.user.id), loadQuests()]);
      setLoading(false);
    })();
  }, []);

  async function reload(uid) {
    const [{ data: pv }, { data: ev }] = await Promise.all([
      supabase.from("progress_view").select("*").eq("user_id", uid).maybeSingle(),
      supabase
        .from("xp_events")
        .select("amount, source, created_at, meta")
        .eq("user_id", uid)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);
    if (pv) setProgress(pv);
    if (ev) setEvents(ev);
  }

  async function loadQuests() {
    const { data: questsData } = await supabase
      .from("quests")
      .select("id, title, est_pomos, complexity, impact")
      .order("title", { ascending: true });
    if (questsData) setQuests(questsData);
  }

  async function startPomodoro() {
    if (!userId) return;
    await supabase.from("xp_pomodoro_sessions").insert({
      user_id: userId,
      quest_id: questId || null,
      duration_min: pomoMinutes,
      completed: true,
    });
    await reload(userId);
  }

  async function awardQuest() {
    if (!userId || !questId) return;
    await supabase.rpc("award_quest_xp", {
      p_user_id: userId,
      p_quest_id: questId,
      p_pomos: pomos ? Number(pomos) : null,
    });
    await reload(userId);
    setPomos("");
  }

  // ---------- Link GPT helpers ----------
  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function startTimer(untilIso) {
    stopTimer();
    function tick() {
      const now = Date.now();
      const until = new Date(untilIso).getTime();
      const s = Math.max(0, Math.floor((until - now) / 1000));
      setTimeLeft(s);
      if (s <= 0) stopTimer();
    }
    tick();
    timerRef.current = setInterval(tick, 1000);
  }

  function fmt(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  async function mintLinkCode() {
    setMintError("");
    setMinting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not logged in");
      const res = await fetch(
        "https://shxeskoprscxgnyckbys.supabase.co/functions/v1/mint-code",
        { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` } }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Mint failed");
      setLinkCode(json.code);
      setExpiresAt(json.expires_at);
      startTimer(json.expires_at);
    } catch (e) {
      setMintError(e.message || "Mint failed");
      setLinkCode("");
      setExpiresAt("");
      stopTimer();
      setTimeLeft(0);
    } finally {
      setMinting(false);
    }
  }

  function copyCode() {
    if (!linkCode) return;
    navigator.clipboard.writeText(linkCode).catch(() => {});
  }

  useEffect(() => () => stopTimer(), []);

  // ---------- UI ----------
  if (loading) return <div className="p-6">Loading…</div>;
  if (!userId)
    return (
      <div className="p-6 space-y-3">
        <h1 className="text-xl font-semibold">Selfware</h1>
        <p>Please sign in to use the XP dashboard.</p>
      </div>
    );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Θ Selfware</h1>
      </header>

      {/* Level / progress */}
      <section className="rounded-2xl shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Level {progress?.level ?? 1}</h2>
          <div className="text-sm opacity-70">{progress?.total_xp ?? 0} XP</div>
        </div>
        <div className="mt-2 h-2 rounded bg-neutral-800 overflow-hidden">
          <div className="h-2 bg-indigo-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-xs mt-1 opacity-70">{progress?.xp_to_next ?? 0}/100 to next level</div>
      </section>

      {/* Actions row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Start Pomodoro */}
        <div className="rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">Start Pomodoro</h2>
          <label className="text-sm">Quest (optional)</label>
          <select className="w-full border rounded p-2" value={questId} onChange={(e) => setQuestId(e.target.value)}>
            <option value="">– None –</option>
            {quests.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title || q.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <label className="text-sm">Minutes</label>
          <input
            type="number"
            min={5}
            className="w-full border rounded p-2"
            value={pomoMinutes}
            onChange={(e) => setPomoMinutes(Number(e.target.value))}
          />
          <button onClick={startPomodoro} className="w-full py-2 rounded-xl bg-black text-white">
            + Log Pomodoro
          </button>
        </div>

        {/* Award Quest XP */}
        <div className="rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">Award Quest XP</h2>
          <label className="text-sm">Quest (required)</label>
          <select className="w-full border rounded p-2" value={questId} onChange={(e) => setQuestId(e.target.value)}>
            <option value="">– Select a quest –</option>
            {quests.map((q) => (
              <option key={q.id} value={q.id}>
                {q.title || q.id.slice(0, 8)}
              </option>
            ))}
          </select>
          <input
            className="w-full border rounded p-2"
            placeholder="Pomos (blank = use quest est_pomos)"
            value={pomos}
            onChange={(e) => setPomos(e.target.value)}
          />
          <button onClick={awardQuest} className="w-full py-2 rounded-xl bg-indigo-600 text-white">
            + Award Quest XP
          </button>
        </div>

        {/* Link GPT (NEW) */}
        <div className="rounded-2xl shadow p-4 space-y-3">
          <h2 className="font-semibold">Link GPT</h2>
          <p className="text-sm opacity-80">
            Generate a one-time code to link your Custom GPT to this account. Code expires in 10 minutes.
          </p>
          <button
            onClick={mintLinkCode}
            disabled={minting}
            className="w-full py-2 rounded-xl bg-emerald-600 text-white disabled:opacity-60"
          >
            {minting ? "Generating…" : "Generate Link Code"}
          </button>

          {mintError && <div className="text-sm text-red-500">{mintError}</div>}

          {linkCode && (
            <div className="mt-2 p-3 rounded-xl border flex items-center justify-between">
              <div>
                <div className="text-xs opacity-70">Code</div>
                <div className="font-mono text-xl tracking-widest">{linkCode}</div>
                <div className="text-xs opacity-70 mt-1">
                  Expires in <span className="font-semibold">{fmt(timeLeft)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={copyCode} className="px-3 py-1 rounded-lg border">
                  Copy
                </button>
                <button onClick={mintLinkCode} className="px-3 py-1 rounded-lg border">
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recent XP */}
      <section className="rounded-2xl shadow p-4">
        <h2 className="font-semibold mb-2">Recent XP</h2>
        <ul className="divide-y">
          {events.map((e, i) => (
            <li key={i} className="py-2 grid grid-cols-3 items-center text-sm">
              <span className="capitalize">{e.source}</span>
              <span className="opacity-70">{new Date(e.created_at).toLocaleString()}</span>
              <span className="font-mono justify-self-end">+{e.amount}</span>
            </li>
          ))}
          {!events.length && <li className="py-2 text-sm opacity-70">No events yet.</li>}
        </ul>
      </section>
    </div>
  );
}
