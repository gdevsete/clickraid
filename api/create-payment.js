export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, message: 'API key não configurada' });
  }

  const { items, customer, shipping, total, externalRef } = req.body;

  // Apply 5% PIX discount
  const discountedTotal = Math.round(total * 0.95 * 100); // centavos

  const payload = {
    amount: discountedTotal,
    currency: 'BRL',
    paymentMethod: 'pix',
    items: items.map((item) => ({
      title: item.name,
      unitPrice: Math.round(item.price * 100),
      quantity: item.quantity,
      tangible: true,
    })),
    customer: {
      name: customer.nome,
      email: customer.email,
      phone: customer.telefone.replace(/\D/g, ''),
      document: {
        number: customer.cpf.replace(/\D/g, ''),
        type: 'cpf',
      },
    },
    shipping: {
      name: customer.nome,
      street: shipping.rua,
      number: shipping.numero,
      complement: shipping.complemento || undefined,
      neighborhood: shipping.bairro,
      city: shipping.cidade,
      state: shipping.estado,
      zipCode: shipping.cep.replace(/\D/g, ''),
    },
    pix: { expiresInDays: 1 },
    postbackUrl: 'https://www.clickraidofc.com.br/api/webhook',
    externalRef,
    metadata: 'Clickraid - Miniaturas Chaveiro',
  };

  try {
    const response = await fetch('https://api.blackcatpay.com.br/api/sales/create-sale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[create-payment] Error:', error);
    return res.status(500).json({ success: false, message: 'Erro interno ao criar pagamento' });
  }
}
