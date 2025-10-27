// index.ts — Supabase Edge Function: XP Agent Router (deploy with --no-verify-jwt)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import * as djwt from "https://deno.land/x/djwt@v2.9/mod.ts";

/* ========= Env (fail fast, clear logs) ========= */
function requireEnv(name: string): string {
  const v = Deno.env.get(name);
  if (!v || !v.trim()) {
    console.error(`[xp-gpt] Missing env: ${name}`);
    throw new Error(`Missing env: ${name}`);
  }
  return v;
}
const SUPABASE_URL       = requireEnv("SUPABASE_URL");
const SERVICE_KEY        = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
const GPT_TRANSPORT_KEY  = requireEnv("GPT_TRANSPORT_KEY");
const GPT_JWT_SECRET     = requireEnv("GPT_JWT_SECRET");
const JWT_KEY            = new TextEncoder().encode(GPT_JWT_SECRET);

/* ========= CORS ========= */
const ORIGIN = "*"; // tighten in prod (e.g., "https://selfware.app")
const corsHeaders = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-gpt-key, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json", ...corsHeaders } });

/* ========= Supabase (service role) ========= */
const svc = createClient(SUPABASE_URL, SERVICE_KEY);

/* ========= JWT helpers (gpt_token) ========= */
async function issueGptToken(user_id: string) {
  const payload = { sub: user_id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 60 * 30 }; // 30m
  return await djwt.create({ alg: "HS256", typ: "JWT" }, payload, JWT_KEY);
}
async function verifyGptToken(token?: string | null): Promise<string | null> {
  if (!token) return null;
  try {
    const pld = (await djwt.verify(token, JWT_KEY, "HS256")) as { sub: string };
    return pld.sub;
  } catch {
    return null;
  }
}

/* ========= Validation ========= */
const COMPLEXITY = new Set(["easy", "medium", "hard", "epic"]);
const IMPACT     = new Set(["low", "med", "high"]);
const isComplexity = (x: unknown): x is "easy"|"medium"|"hard"|"epic" => typeof x === "string" && COMPLEXITY.has(x);
const isImpact     = (x: unknown): x is "low"|"med"|"high" => typeof x === "string" && IMPACT.has(x);

/* ========= Helpers ========= */
async function lookupQuestId(titleOrId: string): Promise<string | null> {
  const isUuid = /^[0-9a-f-]{36}$/i.test(titleOrId);
  if (isUuid) {
    const { data } = await svc.from("quests").select("id").eq("id", titleOrId).maybeSingle();
    return (data as any)?.id ?? null;
  }
  const { data } = await svc.from("quests").select("id").ilike("title", titleOrId).limit(1);
  return Array.isArray(data) && data.length ? (data[0] as { id: string }).id : null;
}

/** Tolerant extractor for /link: JSON, ?code=, form, raw text JSON */
async function extractCode(req: Request, url: URL, body: any): Promise<string | null> {
  // JSON body
  if (body && typeof body === "object" && typeof body.code === "string" && body.code.trim()) {
    return body.code.trim();
  }
  // Query ?code=
  const qs = url.searchParams.get("code");
  if (qs && qs.trim()) return qs.trim();

  // application/x-www-form-urlencoded
  const ctype = req.headers.get("content-type") || "";
  if (ctype.includes("application/x-www-form-urlencoded")) {
    const raw = await req.text();
    try {
      const params = new URLSearchParams(raw);
      const v = params.get("code");
      if (v && v.trim()) return v.trim();
    } catch { /* ignore */ }
  }

  // text/plain containing JSON
  if (ctype.includes("text/plain")) {
    const raw = (await req.text()).trim();
    try {
      const maybe = JSON.parse(raw);
      if (maybe?.code && String(maybe.code).trim()) return String(maybe.code).trim();
    } catch { /* ignore */ }
  }
  return null;
}

/* ========= Router ========= */
serve(async (req) => {
  // Preflight
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // Transport key guard
    if (req.headers.get("x-gpt-key") !== GPT_TRANSPORT_KEY) {
      return json({ error: "unauthorized" }, 401);
    }

    const url = new URL(req.url); // uses global URL (not shadowed)
    const path = url.pathname.toLowerCase(); // e.g., /functions/v1/xp-gpt/pomo.log
    const method = req.method;
    const body = method === "GET" ? {} : await req.json().catch(() => ({}));

    /* ----- POST /link ----- */
    if (path.endsWith("/link") && method === "POST") {
      const code = await extractCode(req, url, body);
      if (!code) return json({ error: "code required" }, 400);

      const { data, error } = await svc
        .from("gpt_link_codes")
        .select("user_id, expires_at, consumed_at")
        .eq("code", code)
        .maybeSingle();

      if (error || !data) return json({ error: "invalid code" }, 401);
      const consumed_at = (data as any).consumed_at as string | null;
      const expires_at  = new Date((data as any).expires_at as string);
      if (consumed_at) return json({ error: "code consumed" }, 401);
      if (expires_at < new Date()) return json({ error: "code expired" }, 401);

      await svc.from("gpt_link_codes").update({ consumed_at: new Date().toISOString() }).eq("code", code);
      const gpt_token = await issueGptToken((data as any).user_id as string);
      return json({ gpt_token });
    }

    // For all other routes, require a valid gpt_token
    const gpt_token = method === "GET" ? url.searchParams.get("gpt_token") : (body as any).gpt_token;
    const user_id = await verifyGptToken(gpt_token);
    if (!user_id) return json({ error: "invalid gpt_token" }, 401);

    /* ----- POST /quests.create ----- */
    if (path.endsWith("/quests.create") && method === "POST") {
      const { title, est_pomos, complexity = "medium", impact = "med", description } = body as any;
      if (!title) return json({ error: "title required" }, 400);
      if (!isComplexity(complexity)) return json({ error: "invalid complexity" }, 400);
      if (!isImpact(impact)) return json({ error: "invalid impact" }, 400);

      const { data, error } = await svc
        .from("quests")
        .insert({
          title,
          est_pomos: est_pomos ?? null,
          complexity,
          impact,
          description: description ?? null,
        })
        .select("id, complexity, impact")
        .single();

      if (error) return json({ error: error.message }, 500);
      return json({
        quest_id: (data as any).id,
        complexity: (data as any).complexity,
        impact: (data as any).impact,
      });
    }

    /* ----- POST /xp.award_quest ----- */
    if (path.endsWith("/xp.award_quest") && method === "POST") {
      const { title_or_id, pomos, complexity = null, impact = null } = body as any;
      if (!title_or_id) return json({ error: "title_or_id required" }, 400);
      if (complexity !== null && !isComplexity(complexity)) return json({ error: "invalid complexity" }, 400);
      if (impact !== null && !isImpact(impact)) return json({ error: "invalid impact" }, 400);

      const quest_id = await lookupQuestId(title_or_id);
      if (!quest_id) return json({ error: "quest not found" }, 404);

      const { data, error } = await svc.rpc("award_quest_xp", {
        p_user_id: user_id,
        p_quest_id: quest_id,
        p_pomos: pomos ?? null,
        p_complexity: complexity,
        p_impact: impact,
      });

      if (error) return json({ error: error.message }, 500);
      return json({ quest_id, amount: data });
    }

    /* ----- POST /pomo.log ----- */
    if (path.endsWith("/pomo.log") && method === "POST") {
      const { minutes, title_or_id } = body as any;
      if (!minutes) return json({ error: "minutes required" }, 400);

      const quest_id = title_or_id ? await lookupQuestId(title_or_id) : null;

      const { error } = await svc.from("xp_pomodoro_sessions").insert({
        user_id,
        quest_id,
        duration_min: minutes,
      });
      if (error) return json({ error: error.message }, 500);
      return json({ logged: true });
    }

    /* ----- GET /status.get ----- */
    if (path.endsWith("/status.get") && method === "GET") {
      const { data: pv } = await svc.from("progress_view").select("*").eq("user_id", user_id).maybeSingle();
      const { data: ev } = await svc
        .from("xp_events")
        .select("created_at, amount, source, meta")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      return json({
        ...(pv ?? { total_xp: 0, level: 1, xp_to_next: 0 }),
        recent: ev ?? [],
      });
    }

    return json({ error: "not found" }, 404);
  } catch (e: any) {
    console.error("[xp-gpt] error:", e?.message ?? e);
    return json({ error: e?.message ?? String(e) }, 500);
  }
});
