// supabase/functions/pat-create/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const svc = createClient(URL, SERVICE_KEY);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s=200)=> new Response(JSON.stringify(b), {status:s, headers:{"content-type":"application/json", ...cors}});

function randBytes(n=32){ // 32 bytes -> 256-bit
  const a = new Uint8Array(n); crypto.getRandomValues(a); return a;
}
function b64url(bytes: Uint8Array){
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function sha256hex(s: string){
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", {headers:cors});
  if (req.method !== "POST") return json({error:"method not allowed"},405);

  const auth = req.headers.get("authorization");
  if (!auth) return json({error:"missing Authorization"},401);

  const userClient = createClient(URL, ANON, { global:{ headers:{ Authorization: auth }}});
  const { data:{ user }, error: uerr } = await userClient.auth.getUser();
  if (uerr || !user) return json({error:"invalid user token"},401);

  // generate token, hash, store
  const token = b64url(randBytes()); // show once
  const key_hash = await sha256hex(token);

  const { error: insErr } = await svc.from("gpt_user_keys").insert({
    user_id: user.id, key_hash
  });
  if (insErr) return json({error: insErr.message},500);

  return json({ pat: token });
});
