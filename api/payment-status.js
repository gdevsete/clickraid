export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'API key não configurada' });
  }

  const { transactionId } = req.query;
  if (!transactionId) {
    return res.status(400).json({ success: false, message: 'transactionId é obrigatório' });
  }

  try {
    const response = await fetch(
      `https://api.blackcatpay.com.br/api/sales/${transactionId}/status`,
      {
        headers: { 'X-API-Key': apiKey },
      }
    );

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[payment-status] Error:', error);
    return res.status(500).json({ success: false, message: 'Erro ao consultar status' });
  }
}
