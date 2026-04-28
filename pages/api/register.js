import { getAnonServerClient } from "@/lib/supabaseServer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const supabase = getAnonServerClient();

  const {
    name,
    email,
    role,
    focusAreas,
    project,
    phone,
    address,
    vat_number
  } = JSON.parse(req.body);

  // Save to Supabase
  const { error } = await supabase.from("registrations").insert({
    name,
    email,
    role,
    focus_areas: focusAreas,
    project,
    phone,
    address,
    vat_number
  });

  if (error) {
    console.error("âŒ Supabase Error:", error);
    return res.status(500).json({ error: "Failed to register" });
  }

  res.status(200).json({ message: "Registration successful" });
}
