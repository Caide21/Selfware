// pages/api/create-paystack-session.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email = "test@example.com", amount = 25000 } = req.body; // in kobo (ZAR cents)

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount,
        currency: 'ZAR',
        callback_url: `${req.headers.origin}/caide/success`,
        metadata: {
          service: '1-Hour AI Session'
        }
      })
    });

    const data = await response.json();

    if (!data.status) {
      return res.status(500).json({ error: data.message || 'Failed to initialize transaction' });
    }

    res.status(200).json({ url: data.data.authorization_url });
  } catch (err) {
    console.error('Paystack Error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
}
