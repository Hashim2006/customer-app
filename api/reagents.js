export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    reagents: [
      { id: '1', name: 'Meril SGOT / AST Clinical Pack', sku: 'MER-CH-012', price: 4850 },
      { id: '2', name: 'Direct Creatinine Kinetic Assay', sku: 'MER-CH-044', price: 3200 },
    ],
  });
}
