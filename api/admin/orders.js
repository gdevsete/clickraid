import { adminClient, requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  // GET: list all orders
  if (req.method === 'GET') {
    const { status, search, limit = 100, offset = 0 } = req.query;

    let query = sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status && status !== 'all') query = query.eq('status', status);

    const { data: orders, error } = await query;
    if (error) return res.status(500).json({ error: error.message });

    if (!orders || orders.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // Fetch profiles separately (no direct FK between orders.user_id and profiles.id)
    const userIds = [...new Set(orders.map(o => o.user_id).filter(Boolean))];
    const { data: profiles } = userIds.length
      ? await sb.from('profiles').select('id, full_name, phone, cpf, address').in('id', userIds)
      : { data: [] };

    // Fetch emails from auth.users via admin API
    const emailMap = {};
    if (userIds.length) {
      try {
        const { data: { users } } = await sb.auth.admin.listUsers({ perPage: 1000 });
        (users || []).forEach(u => { emailMap[u.id] = u.email; });
      } catch {}
    }

    const profileMap = {};
    (profiles || []).forEach(p => { profileMap[p.id] = { ...p, email: emailMap[p.id] || null }; });

    let merged = orders.map(o => ({
      ...o,
      profiles: profileMap[o.user_id] || (o.user_id && emailMap[o.user_id] ? { email: emailMap[o.user_id] } : null),
    }));

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      merged = merged.filter(o =>
        o.transaction_id?.toLowerCase().includes(q) ||
        o.profiles?.full_name?.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({ success: true, data: merged });
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
