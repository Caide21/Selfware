import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendConfirmationEmail({ to, name, focusAreas, status, pdfBuffer }) {
  const subject = `🧾 Your Selfware Invoice`;

  const html = `
    <div style="font-family: sans-serif; padding: 20px; color: #111;">
      <h2>📜 Hello ${name},</h2>
      <p>Thank you for booking a 1-hour Selfware session.</p>
      <p>We've attached your invoice for your records.</p>
      <p><strong>Focus:</strong> ${focusAreas.join(", ")}<br/>
         <strong>Status:</strong> ${status || "Pending"}</p>
      <br/>
      <p>🧠 <em>See you in the Mirror.</em></p>
    </div>
  `;

  return await resend.emails.send({
    from: "Selfware <noreply@selfware.space>",
    to,
    subject,
    html,
    attachments: [
      {
        filename: "Selfware-Invoice.pdf",
        content: pdfBuffer.toString("base64"),
        type: "application/pdf"
      }
    ]
  });
}
