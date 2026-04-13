import { adminClient, requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  // GET: list all orders with profile join
  if (req.method === 'GET') {
    const { status, search, limit = 50, offset = 0 } = req.query;

    let query = sb
      .from('orders')
      .select(`*, profiles(full_name, phone, cpf, address)`)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });

    // Filter by search client-side (name/email/transactionId)
    let filtered = data || [];
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(o =>
        o.transaction_id?.toLowerCase().includes(q) ||
        o.profiles?.full_name?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, data: filtered });
  }

  // PATCH: update order status
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const valid = ['paid', 'pending', 'cancelled', 'shipped', 'delivered'];
    if (!id || !valid.includes(status)) {
      return res.status(400).json({ error: 'id e status válido são obrigatórios' });
    }
    const { error } = await sb.from('orders').update({ status }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
