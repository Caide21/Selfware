import { createOrUpdateSession } from '../../../utils/sessionManager';



console.log("Session API hit");

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { fingerprint, meta } = req.body;
  console.log("Received fingerprint:", fingerprint);

  if (!fingerprint) {
    return res.status(400).json({ error: 'Fingerprint is required' });
  }

  const session = createOrUpdateSession(fingerprint, meta || {});
  return res.status(200).json({ session });
}