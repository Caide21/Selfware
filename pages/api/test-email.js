// pages/api/test-email.js
import { sendConfirmationEmail } from "@/lib/sendConfirmation";

export default async function handler(req, res) {
  try {
    await sendConfirmationEmail({
      name: "Christine",
      email: "caidetaylor8@gmail.com", // you can change this to any test email
      role: "Architect",
      focusAreas: ["Notion", "GPT"],
      time: "Tuesday, 11AM"
    });

    res.status(200).json({ message: "Test email sent ✅" });
  } catch (err) {
    console.error("Error sending test email:", err);
    res.status(500).json({ error: "Failed to send test email" });
  }
}
