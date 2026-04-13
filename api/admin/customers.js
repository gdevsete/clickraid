import { adminClient, requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  const { search } = req.query;

  // Get all profiles
  const { data: profiles, error } = await sb
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  // Get all orders grouped by user_id
  const { data: orders } = await sb
    .from('orders')
    .select('user_id, amount, status, created_at');

  // Get auth users for emails
  const { data: { users: authUsers } } = await sb.auth.admin.listUsers({ perPage: 1000 });

  const emailMap = {};
  (authUsers || []).forEach(u => { emailMap[u.id] = { email: u.email, createdAt: u.created_at }; });

  const ordersByUser = {};
  (orders || []).forEach(o => {
    if (!ordersByUser[o.user_id]) ordersByUser[o.user_id] = { count: 0, total: 0 };
    ordersByUser[o.user_id].count++;
    if (o.status === 'paid') ordersByUser[o.user_id].total += o.amount;
  });

  let customers = (profiles || []).map(p => ({
    id: p.id,
    full_name: p.full_name,
    email: emailMap[p.id]?.email || '',
    phone: p.phone,
    cpf: p.cpf,
    address: p.address,
    is_admin: p.is_admin,
    created_at: emailMap[p.id]?.createdAt || p.updated_at,
    orders: ordersByUser[p.id]?.count || 0,
    total_spent: ordersByUser[p.id]?.total || 0,
  }));

  if (search) {
    const q = search.toLowerCase();
    customers = customers.filter(c =>
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.cpf?.includes(q) ||
      c.phone?.includes(q)
    );
  }

  return res.status(200).json({ success: true, data: customers });
}
