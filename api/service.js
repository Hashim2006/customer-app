export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      activeTickets: [
        {
          ticketId: 'MER-90214',
          analyzer: 'Meril Quant-Mate 400',
          issueType: 'Flow-cell optical sensor calibration error',
          status: 'In Progress',
          slaTarget: '4 Hours (Emergency SOS)',
          assignedEngineer: {
            name: 'Rajesh Sharma',
            role: 'Senior Field Specialist',
            etaMins: 25,
            phone: '+91 98200 11223',
            distanceKm: 3.4,
          },
          verificationOtp: '5892',
        },
      ],
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
