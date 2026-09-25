export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const { clientId } = req.body || {};
    return res.status(200).json({
      success: true,
      token: 'jwt_mock_token_apollo',
      user: {
        clientId: clientId || 'MER-882190',
        labName: 'Apollo Diagnostic Center',
        role: 'Chief Lab Director',
        totalAnalyzers: 3,
      },
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
