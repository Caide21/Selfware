export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { signalType, value, label, timestamp } = req.body;
  
      console.log('📡 ERS SIGNAL:', { signalType, value, label, timestamp });
  
      // Return fake response for now
      return res.status(200).json({
        emotion: 'curiosity',
        fog: 'curiosity',
        label
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  }
  