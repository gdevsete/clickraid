import { adminClient, requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key não configurada' });

  // Se veio um transactionId específico, buscar apenas aquele
  const { transactionId: singleTxId } = req.body || {};
  if (singleTxId) {
    try {
      const r = await fetch(`https://api.blackcatpay.com.br/api/sales/${singleTxId}/status`, {
        headers: { 'X-API-Key': apiKey },
      });
      const d = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: `Gateway retornou ${r.status}` });

      const status = (d.data?.status || d.status || '').toUpperCase();
      const mappedStatus = status === 'PAID' ? 'paid' : status === 'CANCELLED' || status === 'FAILED' || status === 'EXPIRED' ? 'cancelled' : 'pending';
      const sale = d.data || d;
      const customer = sale.customer || {};
      const customerData = {
        name: customer.name || null,
        email: customer.email || null,
        phone: customer.phone || null,
        cpf: customer.document?.number || null,
        address: sale.shipping ? {
          rua: sale.shipping.street, numero: sale.shipping.number,
          bairro: sale.shipping.neighborhood, cidade: sale.shipping.city,
          estado: sale.shipping.state, cep: sale.shipping.zipCode,
        } : null,
      };
      const items = (sale.items || []).map(i => ({ name: i.title || i.name, price: (i.unitPrice || 0) / 100, quantity: i.quantity || 1 }));
      await sb.from('orders').upsert({
        transaction_id: singleTxId,
        items,
        amount: sale.amount || 0,
        status: mappedStatus,
        customer_data: customerData,
        created_at: sale.createdAt || new Date().toISOString(),
      }, { onConflict: 'transaction_id', ignoreDuplicates: false });
      return res.status(200).json({ success: true, synced: 1, message: `Pedido ${singleTxId} importado como "${mappedStatus}"` });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  try {
    // Tentar endpoints conhecidos para listar vendas
    const endpoints = [
      'https://api.blackcatpay.com.br/api/sales?page=1&limit=100',
      'https://api.blackcatpay.com.br/api/sales/list?page=1&limit=100',
      'https://api.blackcatpay.com.br/api/transactions?page=1&limit=100',
      'https://api.blackcatpay.com.br/api/v1/sales?page=1&limit=100',
    ];

    let gwData = null;
    let lastStatus = null;

    for (const url of endpoints) {
      const gwRes = await fetch(url, { headers: { 'X-API-Key': apiKey } });
      lastStatus = gwRes.status;
      if (gwRes.ok) {
        gwData = await gwRes.json();
        break;
      }
    }

    if (!gwData) {
      return res.status(404).json({
        error: `Nenhum endpoint de listagem funcionou (último status: ${lastStatus}). Verifique a documentação da Black Cat Pay e informe a URL correta.`,
      });
    }

    // A API pode retornar { data: [...] } ou { sales: [...] } ou array direto
    const sales = gwData.data || gwData.sales || gwData.items || (Array.isArray(gwData) ? gwData : []);

    if (!sales.length) {
      return res.status(200).json({ success: true, synced: 0, message: 'Nenhuma venda encontrada na gateway' });
    }

    let synced = 0;
    let errors = 0;

    for (const sale of sales) {
      const transactionId = sale.transactionId || sale.id || sale.transaction_id;
      if (!transactionId) continue;

      const status = (sale.status || '').toUpperCase();
      const mappedStatus = status === 'PAID' ? 'paid'
        : status === 'CANCELLED' || status === 'FAILED' || status === 'EXPIRED' ? 'cancelled'
        : 'pending';

      const amount = sale.amount || sale.total || 0;
      const customer = sale.customer || {};
      const items = sale.items || [];

      const customerData = {
        name: customer.name || customer.nome || null,
        email: customer.email || null,
        phone: customer.phone || customer.telefone || null,
        cpf: customer.document?.number || customer.cpf || null,
        address: sale.shipping ? {
          rua: sale.shipping.street || sale.shipping.rua,
          numero: sale.shipping.number || sale.shipping.numero,
          complemento: sale.shipping.complement || sale.shipping.complemento,
          bairro: sale.shipping.neighborhood || sale.shipping.bairro,
          cidade: sale.shipping.city || sale.shipping.cidade,
          estado: sale.shipping.state || sale.shipping.estado,
          cep: sale.shipping.zipCode || sale.shipping.cep,
        } : null,
      };

      const orderItems = items.map(i => ({
        name: i.title || i.name,
        price: (i.unitPrice || i.price || 0) / 100,
        quantity: i.quantity || 1,
      }));

      const { error } = await sb.from('orders').upsert({
        transaction_id: transactionId,
        items: orderItems,
        amount: typeof amount === 'number' && amount > 100 ? amount : Math.round(amount * 100),
        status: mappedStatus,
        customer_data: customerData,
        created_at: sale.createdAt || sale.created_at || new Date().toISOString(),
      }, { onConflict: 'transaction_id', ignoreDuplicates: false });

      if (error) errors++;
      else synced++;
    }

    return res.status(200).json({
      success: true,
      synced,
      errors,
      total: sales.length,
      message: `${synced} vendas sincronizadas da gateway`,
    });
  } catch (err) {
    console.error('[sync-gateway] Error:', err);
    return res.status(500).json({ error: err.message });
  }
}
