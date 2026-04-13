import { adminClient, requireAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  const [{ data: orders }, { count: customerCount }] = await Promise.all([
    sb.from('orders').select('*').order('created_at', { ascending: false }),
    sb.from('profiles').select('*', { count: 'exact', head: true }),
  ]);

  const all = orders || [];
  const paid = all.filter(o => o.status === 'paid');
  const thisMonth = paid.filter(o => o.created_at >= startOfMonth);
  const lastMonth = paid.filter(o => o.created_at >= startOfLastMonth && o.created_at < startOfMonth);

  const totalRevenue = paid.reduce((s, o) => s + o.amount, 0);
  const monthRevenue = thisMonth.reduce((s, o) => s + o.amount, 0);
  const lastMonthRevenue = lastMonth.reduce((s, o) => s + o.amount, 0);

  // Last 30 days daily revenue for chart
  const daily = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    daily.push({
      date: key,
      revenue: paid.filter(o => o.created_at.slice(0, 10) === key).reduce((s, o) => s + o.amount, 0),
      orders: all.filter(o => o.created_at.slice(0, 10) === key).length,
    });
  }

  // Top products
  const productMap = {};
  paid.forEach(o => {
    (o.items || []).forEach(item => {
      if (!productMap[item.name]) productMap[item.name] = { name: item.name, qty: 0, revenue: 0 };
      productMap[item.name].qty += item.quantity || 1;
      productMap[item.name].revenue += (item.price || 0) * (item.quantity || 1) * 100;
    });
  });
  const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      monthRevenue,
      lastMonthRevenue,
      totalOrders: all.length,
      paidOrders: paid.length,
      pendingOrders: all.filter(o => o.status === 'pending').length,
      cancelledOrders: all.filter(o => o.status === 'cancelled').length,
      monthOrders: thisMonth.length,
      customerCount: customerCount || 0,
      avgTicket: paid.length ? Math.round(totalRevenue / paid.length) : 0,
      recentOrders: all.slice(0, 8),
      daily,
      topProducts,
      statusBreakdown: {
        paid: paid.length,
        pending: all.filter(o => o.status === 'pending').length,
        cancelled: all.filter(o => o.status === 'cancelled').length,
      },
    },
  });
}
