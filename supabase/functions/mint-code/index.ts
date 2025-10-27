
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY   = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY      = Deno.env.get("SUPABASE_ANON_KEY")!;

// CORS
const ORIGIN = "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { "content-type":"application/json", ...corsHeaders } });

const service = createClient(SUPABASE_URL, SERVICE_KEY);

function generateCode(): string {
  return String(Math.floor(Math.random() * 1e8)).padStart(8, "0");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "Missing Authorization header" }, 401);

    // Validate user JWT using anon client bound to the header
    const userClient = createClient(SUPABASE_URL, ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) return json({ error: "Invalid user token" }, 401);

    const code = generateCode();
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insErr } = await service.from("gpt_link_codes").insert({ code, user_id: user.id, expires_at });
    if (insErr) return json({ error: insErr.message }, 500);

    return json({ code, expires_at });
  } catch (e: any) {
    return json({ error: e.message ?? String(e) }, 500);
  }
});