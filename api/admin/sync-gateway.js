import { adminClient, requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  const apiKey = process.env.BLACKCAT_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key não configurada' });

  try {
    // Buscar vendas da Black Cat Pay (tenta com paginação)
    const gwRes = await fetch('https://api.blackcatpay.com.br/api/sales?page=1&limit=100', {
      headers: { 'X-API-Key': apiKey },
    });

    if (!gwRes.ok) {
      return res.status(gwRes.status).json({ error: `Gateway retornou ${gwRes.status}` });
    }

    const gwData = await gwRes.json();

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
