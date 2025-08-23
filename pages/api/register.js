import { supabase } from "@/lib/supabase";
import { sendConfirmationEmail } from "@/lib/sendConfirmation";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

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
    console.error("❌ Supabase Error:", error);
    return res.status(500).json({ error: "Failed to register" });
  }

  try {
    // 📄 Generate invoice with pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const black = rgb(0, 0, 0);

    const lines = [
      "Selfware AI Session Invoice",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      `Address: ${address || "—"}`,
      `VAT: ${vat_number || "—"}`,
      "",
      `Focus Areas: ${focusAreas.join(", ")}`,
      `Project: ${project || "—"}`,
      "",
      `Status: Pending`,
      `Total: R250`,
      `Date: ${new Date().toLocaleDateString()}`
    ];

    lines.forEach((line, i) => {
      page.drawText(line, {
        x: 50,
        y: height - 60 - i * 20,
        size: 12,
        font,
        color: black
      });
    });

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    // 📧 Email it via Resend
    await sendConfirmationEmail({
      to: email,
      name,
      focusAreas,
      status: "Pending",
      pdfBuffer
    });

  } catch (err) {
    console.error("📤 PDF/Email error:", err);
  }

  res.status(200).json({ message: "Registration successful" });
}
