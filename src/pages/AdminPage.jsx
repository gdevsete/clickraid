import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtShort = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '—';

const STATUS_CONFIG = {
  paid:      { label: 'Pago',       bg: 'bg-green-500/15 text-green-400 border-green-500/30' },
  pending:   { label: 'Aguardando', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  cancelled: { label: 'Cancelado',  bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
  shipped:   { label: 'Enviado',    bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  delivered: { label: 'Entregue',   bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
};

const Badge = ({ status }) => {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <span className={`text-xs px-2 py-0.5 border font-medium rounded-sm ${c.bg}`}>{c.label}</span>;
};

const Spinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
  </div>
);

// Mini SVG area chart for revenue
function AreaChart({ data, color = '#C9A84C' }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d => d.revenue), 1);
  const W = 400, H = 80, pad = 4;
  const points = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (W - pad * 2);
    const y = H - pad - ((d.revenue / max) * (H - pad * 2));
    return `${x},${y}`;
  });
  const area = `M${points[0]} L${points.join(' L')} L${W - pad},${H} L${pad},${H} Z`;
  const line = `M${points[0]} L${points.join(' L')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#grad)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, chart, icon, color = 'text-brand-gold' }) {
  return (
    <div className="bg-[#111] border border-brand-border rounded p-5 relative overflow-hidden">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">{label}</p>
          <p className={`font-heading text-3xl ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl opacity-20">{icon}</span>
      </div>
      {chart && <div className="h-12 -mx-1">{chart}</div>}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState('dashboard');

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Customers
  const [customers, setCustomers] = useState([]);
  const [custLoading, setCustLoading] = useState(false);
  const [custSearch, setCustSearch] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token;
  };

  const apiFetch = useCallback(async (path, opts = {}) => {
    const token = await getToken();
    const res = await fetch(path, {
      ...opts,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
    });
    return res.json();
  }, []);

  // Auth check
  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    supabase.from('profiles').select('is_admin, full_name').eq('id', user.id).single()
      .then(({ data }) => {
        if (!data?.is_admin) { navigate('/'); return; }
        setProfile(data);
        setAuthChecked(true);
      });
  }, [user, loading]);

  // Load stats
  useEffect(() => {
    if (!authChecked) return;
    apiFetch('/api/admin/stats').then(({ data }) => { setStats(data); setStatsLoading(false); });
  }, [authChecked]);

  // Load orders when tab active
  useEffect(() => {
    if (!authChecked || tab !== 'pedidos') return;
    setOrdersLoading(true);
    apiFetch(`/api/admin/orders?status=${orderFilter}`).then(({ data }) => {
      setOrders(data || []);
      setOrdersLoading(false);
    });
  }, [authChecked, tab, orderFilter]);

  // Load customers when tab active
  useEffect(() => {
    if (!authChecked || tab !== 'clientes') return;
    setCustLoading(true);
    apiFetch('/api/admin/customers').then(({ data }) => {
      setCustomers(data || []);
      setCustLoading(false);
    });
  }, [authChecked, tab]);

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrder(orderId);
    await apiFetch('/api/admin/orders', {
      method: 'PATCH',
      body: JSON.stringify({ id: orderId, status }),
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (stats) {
      setStats(prev => ({ ...prev })); // trigger re-render
    }
    setUpdatingOrder(null);
  };

  const exportCSV = () => {
    const rows = [['ID Transação', 'Cliente', 'Data', 'Valor', 'Status', 'Itens']];
    orders.forEach(o => {
      rows.push([
        o.transaction_id,
        o.profiles?.full_name || '—',
        fmtDate(o.created_at),
        fmt(o.amount),
        o.status,
        (o.items || []).map(i => `${i.name} x${i.quantity}`).join('; '),
      ]);
    });
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `pedidos_clickraid_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading || !authChecked) return (
    <div className="flex items-center justify-center min-h-screen bg-brand-black">
      <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const filteredOrders = orders.filter(o => {
    if (!orderSearch) return true;
    const q = orderSearch.toLowerCase();
    return o.transaction_id?.toLowerCase().includes(q) || o.profiles?.full_name?.toLowerCase().includes(q);
  });

  const filteredCustomers = customers.filter(c => {
    if (!custSearch) return true;
    const q = custSearch.toLowerCase();
    return c.full_name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.cpf?.includes(q);
  });

  const TABS = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'pedidos',   icon: '📦', label: 'Pedidos' },
    { id: 'clientes',  icon: '👥', label: 'Clientes' },
    { id: 'produtos',  icon: '🔫', label: 'Produtos' },
    { id: 'links',     icon: '🔗', label: 'Links de Venda' },
  ];

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-[#111] border-r border-brand-border flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-brand-border">
          <Link to="/" className="font-brand text-lg text-brand-gold tracking-widest">CLICK<span className="text-white">RAID</span></Link>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest mt-0.5">Painel Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors text-left ${
                tab === t.id
                  ? 'bg-brand-gold/10 text-brand-gold border-r-2 border-brand-gold font-medium'
                  : 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-brand-border">
          <p className="text-xs text-gray-600 mb-1 truncate">{user.email}</p>
          <button onClick={() => { signOut(); navigate('/'); }} className="text-xs text-gray-600 hover:text-brand-red transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
            Sair
          </button>
        </div>
      </aside>

      {/* ── MAIN ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-6 max-w-6xl mx-auto">

          {/* ══ DASHBOARD ════════════════════════════════════════════════ */}
          {tab === 'dashboard' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="font-heading text-3xl text-white">DASHBOARD</h1>
                  <p className="text-gray-600 text-sm mt-0.5">Visão geral do negócio</p>
                </div>
                <button onClick={() => { setStatsLoading(true); apiFetch('/api/admin/stats').then(({ data }) => { setStats(data); setStatsLoading(false); }); }}
                  className="text-xs text-gray-500 hover:text-white border border-brand-border px-3 py-2 transition-colors">
                  ↻ Atualizar
                </button>
              </div>

              {statsLoading ? <Spinner /> : stats && (
                <>
                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    <StatCard
                      label="Faturamento total"
                      value={fmt(stats.totalRevenue)}
                      sub={`${stats.paidOrders} pedidos pagos`}
                      icon="💰"
                      chart={<AreaChart data={stats.daily} />}
                    />
                    <StatCard
                      label="Este mês"
                      value={fmt(stats.monthRevenue)}
                      sub={`${stats.monthOrders} pedidos`}
                      icon="📅"
                      color={stats.monthRevenue >= stats.lastMonthRevenue ? 'text-green-400' : 'text-red-400'}
                    />
                    <StatCard label="Ticket médio" value={fmt(stats.avgTicket)} icon="🎯" />
                    <StatCard label="Clientes" value={stats.customerCount} icon="👤" color="text-blue-400" />
                  </div>

                  {/* Status breakdown */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { label: 'Pagos', count: stats.statusBreakdown.paid, color: 'text-green-400', bg: 'border-green-500/30' },
                      { label: 'Aguardando', count: stats.statusBreakdown.pending, color: 'text-yellow-400', bg: 'border-yellow-500/30' },
                      { label: 'Cancelados', count: stats.statusBreakdown.cancelled, color: 'text-red-400', bg: 'border-red-500/30' },
                    ].map(s => (
                      <div key={s.label} className={`bg-[#111] border ${s.bg} rounded p-4 text-center`}>
                        <p className={`font-heading text-4xl ${s.color}`}>{s.count}</p>
                        <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
                    {/* Revenue chart */}
                    <div className="bg-[#111] border border-brand-border rounded p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Receita — últimos 30 dias</p>
                      <div className="h-24">
                        <AreaChart data={stats.daily} />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-700 mt-2">
                        <span>{fmtShort(stats.daily[0]?.date)}</span>
                        <span>{fmtShort(stats.daily[stats.daily.length - 1]?.date)}</span>
                      </div>
                    </div>

                    {/* Top products */}
                    <div className="bg-[#111] border border-brand-border rounded p-5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-4">Produtos mais vendidos</p>
                      {stats.topProducts.length === 0
                        ? <p className="text-gray-600 text-sm">Sem dados ainda</p>
                        : stats.topProducts.map((p, i) => {
                          const maxRev = stats.topProducts[0].revenue;
                          return (
                            <div key={p.name} className="mb-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-300 truncate max-w-[60%]">{p.name}</span>
                                <span className="text-brand-gold">{p.qty} un.</span>
                              </div>
                              <div className="h-1.5 bg-brand-border rounded-full overflow-hidden">
                                <div className="h-full bg-brand-gold rounded-full" style={{ width: `${(p.revenue / maxRev) * 100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Recent orders */}
                  <div className="bg-[#111] border border-brand-border rounded">
                    <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between">
                      <p className="text-sm font-bold text-white uppercase tracking-widest">Pedidos Recentes</p>
                      <button onClick={() => setTab('pedidos')} className="text-xs text-brand-gold hover:underline">Ver todos →</button>
                    </div>
                    <div className="divide-y divide-brand-border">
                      {stats.recentOrders.map(o => (
                        <div key={o.id} className="px-5 py-3 flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-xs text-gray-400 font-mono truncate">{o.transaction_id}</p>
                            <p className="text-[10px] text-gray-600">{fmtDate(o.created_at)}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <Badge status={o.status} />
                            <span className="text-brand-gold font-bold text-sm font-heading">{fmt(o.amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ PEDIDOS ══════════════════════════════════════════════════ */}
          {tab === 'pedidos' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h1 className="font-heading text-3xl text-white">PEDIDOS</h1>
                  <p className="text-gray-600 text-sm">{filteredOrders.length} resultado{filteredOrders.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={exportCSV} className="text-xs border border-brand-border text-gray-400 hover:text-white px-3 py-2 transition-colors">
                    ↓ Exportar CSV
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {['all', 'paid', 'pending', 'shipped', 'delivered', 'cancelled'].map(s => (
                  <button key={s} onClick={() => setOrderFilter(s)}
                    className={`text-xs px-3 py-1.5 border transition-colors ${
                      orderFilter === s ? 'bg-brand-gold text-brand-black border-brand-gold font-bold' : 'border-brand-border text-gray-500 hover:text-white'
                    }`}>
                    {s === 'all' ? 'Todos' : STATUS_CONFIG[s]?.label || s}
                  </button>
                ))}
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Buscar por ID ou cliente..."
                  className="ml-auto text-xs bg-[#111] border border-brand-border text-white px-3 py-1.5 focus:outline-none focus:border-brand-gold w-56"
                />
              </div>

              {ordersLoading ? <Spinner /> : (
                <div className="bg-[#111] border border-brand-border rounded overflow-hidden">
                  {filteredOrders.length === 0
                    ? <p className="text-center text-gray-600 py-16">Nenhum pedido encontrado.</p>
                    : filteredOrders.map(o => (
                      <div key={o.id} className="border-b border-brand-border last:border-0">
                        <div
                          className="px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-xs font-mono text-gray-300">{o.transaction_id}</p>
                              <Badge status={o.status} />
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {o.profiles?.full_name || 'Cliente'} · {fmtDate(o.created_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-brand-gold font-bold font-heading text-lg">{fmt(o.amount)}</span>
                            <svg className={`w-4 h-4 text-gray-600 transition-transform ${expandedOrder === o.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                            </svg>
                          </div>
                        </div>

                        {expandedOrder === o.id && (
                          <div className="px-5 pb-5 bg-black/30 border-t border-brand-border animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                              {/* Items */}
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Itens</p>
                                <div className="space-y-1">
                                  {(o.items || []).map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                      <span className="text-gray-400">{item.name} × {item.quantity}</span>
                                      <span className="text-gray-500">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Customer info */}
                              <div>
                                <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Cliente</p>
                                <p className="text-xs text-white">{o.profiles?.full_name || '—'}</p>
                                <p className="text-xs text-gray-500">{o.profiles?.phone || '—'}</p>
                                <p className="text-xs text-gray-500">{o.profiles?.cpf || '—'}</p>
                                {o.profiles?.address && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {o.profiles.address.rua}, {o.profiles.address.numero} · {o.profiles.address.cidade}/{o.profiles.address.estado}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Status update */}
                            <div className="mt-4 flex items-center gap-2 flex-wrap">
                              <p className="text-[10px] uppercase tracking-widest text-gray-600">Alterar status:</p>
                              {['paid', 'shipped', 'delivered', 'cancelled'].map(s => (
                                <button
                                  key={s}
                                  disabled={o.status === s || updatingOrder === o.id}
                                  onClick={() => updateOrderStatus(o.id, s)}
                                  className={`text-xs px-3 py-1.5 border transition-colors disabled:opacity-40 disabled:cursor-default ${
                                    o.status === s
                                      ? 'border-brand-gold text-brand-gold'
                                      : 'border-brand-border text-gray-500 hover:border-white hover:text-white'
                                  }`}
                                >
                                  {updatingOrder === o.id ? '...' : STATUS_CONFIG[s]?.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ══ CLIENTES ═════════════════════════════════════════════════ */}
          {tab === 'clientes' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <h1 className="font-heading text-3xl text-white">CLIENTES</h1>
                  <p className="text-gray-600 text-sm">{filteredCustomers.length} cadastrado{filteredCustomers.length !== 1 ? 's' : ''}</p>
                </div>
                <input
                  type="text"
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou CPF..."
                  className="text-xs bg-[#111] border border-brand-border text-white px-3 py-2 focus:outline-none focus:border-brand-gold w-72"
                />
              </div>

              {custLoading ? <Spinner /> : (
                <div className="bg-[#111] border border-brand-border rounded overflow-hidden">
                  {/* Header */}
                  <div className="grid grid-cols-12 px-5 py-3 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-600">
                    <div className="col-span-3">Nome</div>
                    <div className="col-span-3">E-mail</div>
                    <div className="col-span-2">Telefone</div>
                    <div className="col-span-1 text-center">Pedidos</div>
                    <div className="col-span-2 text-right">Total gasto</div>
                    <div className="col-span-1 text-center">Admin</div>
                  </div>

                  {filteredCustomers.length === 0
                    ? <p className="text-center text-gray-600 py-16">Nenhum cliente encontrado.</p>
                    : filteredCustomers.map(c => (
                      <div key={c.id} className="border-b border-brand-border last:border-0">
                        <div
                          className="grid grid-cols-12 px-5 py-3 items-center cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => setExpandedCustomer(expandedCustomer === c.id ? null : c.id)}
                        >
                          <div className="col-span-3 text-xs text-white font-medium truncate">{c.full_name || '—'}</div>
                          <div className="col-span-3 text-xs text-gray-400 truncate">{c.email || '—'}</div>
                          <div className="col-span-2 text-xs text-gray-500">{c.phone || '—'}</div>
                          <div className="col-span-1 text-center text-xs text-gray-400">{c.orders}</div>
                          <div className="col-span-2 text-right text-xs text-brand-gold font-medium">{fmt(c.total_spent)}</div>
                          <div className="col-span-1 text-center">
                            {c.is_admin && <span className="text-[10px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded">ADMIN</span>}
                          </div>
                        </div>

                        {expandedCustomer === c.id && (
                          <div className="px-5 pb-4 bg-black/30 border-t border-brand-border grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 animate-fade-in">
                            {[
                              ['CPF', c.cpf],
                              ['Membro desde', fmtDate(c.created_at)],
                              ['Cidade', c.address ? `${c.address.cidade}/${c.address.estado}` : null],
                              ['CEP', c.address?.cep],
                              ['Endereço', c.address ? `${c.address.rua}, ${c.address.numero}` : null],
                              ['Bairro', c.address?.bairro],
                            ].map(([label, val]) => val ? (
                              <div key={label}>
                                <p className="text-[10px] text-gray-600 uppercase tracking-widest">{label}</p>
                                <p className="text-xs text-gray-300 mt-0.5">{val}</p>
                              </div>
                            ) : null)}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ══ PRODUTOS ═════════════════════════════════════════════════ */}
          {tab === 'produtos' && <ProductsAdminTab />}

          {/* ══ LINKS DE VENDA ═══════════════════════════════════════════ */}
          {tab === 'links' && <PaymentLinksTab />}

        </div>
      </main>
    </div>
  );
}

// ─── Products Tab (reads from local catalog) ─────────────────────────────────
import { products } from '../data/products';

const CATEGORY_LABELS = {
  pistolas: 'Pistolas',
  fuzis: 'Fuzis',
  metralhadoras: 'Metralhadoras',
  lancadores: 'Lançadores',
  acessorios: 'Acessórios',
};

function ProductsAdminTab() {
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => {
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalValue = filtered.reduce((s, p) => s + p.price, 0);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl text-white">CATÁLOGO</h1>
          <p className="text-gray-600 text-sm">{filtered.length} produto{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto..."
          className="text-xs bg-[#111] border border-brand-border text-white px-3 py-2 focus:outline-none focus:border-brand-gold w-60"
        />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['all', ...Object.keys(CATEGORY_LABELS)].map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`text-xs px-3 py-1.5 border transition-colors ${
              catFilter === c ? 'bg-brand-gold text-brand-black border-brand-gold font-bold' : 'border-brand-border text-gray-500 hover:text-white'
            }`}>
            {c === 'all' ? 'Todos' : CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="bg-[#111] border border-brand-border rounded overflow-hidden">
        <div className="grid grid-cols-12 px-4 py-3 border-b border-brand-border text-[10px] uppercase tracking-widest text-gray-600">
          <div className="col-span-1">Foto</div>
          <div className="col-span-4">Nome</div>
          <div className="col-span-2">Categoria</div>
          <div className="col-span-2">Preço</div>
          <div className="col-span-1">Destaque</div>
          <div className="col-span-2">Avaliação</div>
        </div>
        {filtered.map(p => (
          <div key={p.id} className="grid grid-cols-12 px-4 py-3 items-center border-b border-brand-border last:border-0 hover:bg-white/5 transition-colors">
            <div className="col-span-1">
              <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 object-cover bg-brand-dark" />
            </div>
            <div className="col-span-4">
              <p className="text-xs text-white font-medium">{p.name}</p>
              <p className="text-[10px] text-gray-600">ID {p.id} · {p.reviews} avaliações</p>
            </div>
            <div className="col-span-2 text-xs text-gray-400">{CATEGORY_LABELS[p.category] || p.category}</div>
            <div className="col-span-2">
              <p className="text-xs text-brand-gold font-bold">R$ {p.price.toFixed(2)}</p>
              {p.originalPrice && <p className="text-[10px] text-gray-600 line-through">R$ {p.originalPrice.toFixed(2)}</p>}
            </div>
            <div className="col-span-1">
              {p.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  p.badge === 'hot' ? 'bg-brand-red/20 text-brand-red' :
                  p.badge === 'new' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>{p.badgeText || p.badge}</span>
              )}
            </div>
            <div className="col-span-2 text-xs text-yellow-400">
              {'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.floor(p.rating))}
              <span className="text-gray-600 ml-1">{p.rating}</span>
            </div>
          </div>
        ))}
        <div className="px-4 py-3 border-t border-brand-border flex justify-between text-xs">
          <span className="text-gray-600">{filtered.length} itens no catálogo</span>
          <span className="text-brand-gold font-bold">Valor médio: R$ {filtered.length ? (totalValue / filtered.length).toFixed(2) : '0'}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Links Tab ────────────────────────────────────────────────────────
const LINK_STATUS = {
  pending:   { label: 'Aguardando', bg: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
  paid:      { label: 'Pago',       bg: 'bg-green-500/15 text-green-400 border-green-500/30' },
  cancelled: { label: 'Cancelado',  bg: 'bg-red-500/15 text-red-400 border-red-500/30' },
  expired:   { label: 'Expirado',   bg: 'bg-gray-500/15 text-gray-400 border-gray-500/30' },
};

function LinkBadge({ status }) {
  const c = LINK_STATUS[status] || LINK_STATUS.pending;
  return <span className={`text-xs px-2 py-0.5 border font-medium rounded-sm ${c.bg}`}>{c.label}</span>;
}

function PaymentLinksTab() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerName: '', customerEmail: '', customerPhone: '', discountPct: 0, expiresInHours: 48 });
  // Each row: { mode: 'catalog'|'custom', productId: '', customName: '', customPrice: '', quantity: 1 }
  const [selectedProducts, setSelectedProducts] = useState([{ mode: 'catalog', productId: '', customName: '', customPrice: '', quantity: 1 }]);
  const [formError, setFormError] = useState('');

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` };
  };

  const loadLinks = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const r = await fetch('/api/admin/payment-links', { headers });
      const d = await r.json();
      if (d.success) setLinks(d.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadLinks(); }, [loadLinks]);

  const copyLink = (token) => {
    navigator.clipboard.writeText(`https://www.clickraidofc.com.br/p/${token}`);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const updateRow = (idx, patch) =>
    setSelectedProducts(prev => prev.map((x, i) => i === idx ? { ...x, ...patch } : x));

  const handleCreate = async () => {
    setFormError('');
    if (!form.customerName.trim()) { setFormError('Nome do cliente é obrigatório.'); return; }

    const items = selectedProducts.map(sp => {
      if (sp.mode === 'catalog') {
        if (!sp.productId) return null;
        const p = products.find(x => x.id === parseInt(sp.productId));
        if (!p) return null;
        return { id: p.id, name: p.shortName || p.name, price: p.price, quantity: parseInt(sp.quantity) || 1, image: p.images?.[0] || '' };
      } else {
        // custom product
        if (!sp.customName.trim() || !sp.customPrice) return null;
        return { id: `custom-${Date.now()}`, name: sp.customName.trim(), price: parseFloat(sp.customPrice), quantity: parseInt(sp.quantity) || 1, image: '' };
      }
    }).filter(Boolean);

    if (!items.length) { setFormError('Adicione ao menos 1 produto válido.'); return; }

    setCreating(true);
    try {
      const headers = await getAuthHeaders();
      const r = await fetch('/api/admin/payment-links', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...form, items }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error);
      setShowForm(false);
      setForm({ customerName: '', customerEmail: '', customerPhone: '', discountPct: 0, expiresInHours: 48 });
      setSelectedProducts([{ mode: 'catalog', productId: '', customName: '', customPrice: '', quantity: 1 }]);
      loadLinks();
      setTimeout(() => copyLink(d.token), 300);
    } catch (e) {
      setFormError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCancel = async (id) => {
    const headers = await getAuthHeaders();
    await fetch('/api/admin/payment-links', { method: 'PATCH', headers, body: JSON.stringify({ id, status: 'cancelled' }) });
    loadLinks();
  };

  const totalAmount = (items, discountPct) => {
    const base = (items || []).reduce((s, i) => s + i.price * i.quantity, 0);
    return base * (1 - (discountPct || 0) / 100) * 0.95;
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl text-white">LINKS DE VENDA</h1>
          <p className="text-gray-600 text-sm">Crie links personalizados para vendas manuais</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="btn-primary px-6 py-3 text-sm">
          {showForm ? '✕ Fechar' : '+ Novo Link'}
        </button>
      </div>

      {/* ── Create Form ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="bg-[#111] border border-brand-gold/30 p-6 mb-8 animate-fade-in">
          <h3 className="font-heading text-lg text-brand-gold tracking-wide mb-5">CRIAR NOVO LINK</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Nome do Cliente <span className="text-brand-gold">*</span></label>
              <input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="João da Silva"
                className="w-full bg-brand-dark border border-brand-border px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">E-mail (opcional)</label>
              <input type="email" value={form.customerEmail} onChange={e => setForm(f => ({ ...f, customerEmail: e.target.value }))} placeholder="joao@email.com"
                className="w-full bg-brand-dark border border-brand-border px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp (opcional)</label>
              <input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="(11) 99999-9999"
                className="w-full bg-brand-dark border border-brand-border px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Desconto Extra %</label>
                <input type="number" min="0" max="80" value={form.discountPct} onChange={e => setForm(f => ({ ...f, discountPct: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-brand-dark border border-brand-border px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-widest mb-1.5">Expira em (horas)</label>
                <select value={form.expiresInHours} onChange={e => setForm(f => ({ ...f, expiresInHours: parseInt(e.target.value) }))}
                  className="w-full bg-brand-dark border border-brand-border px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold">
                  <option value={24}>24 horas</option>
                  <option value={48}>48 horas</option>
                  <option value={72}>72 horas</option>
                  <option value={168}>7 dias</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="mb-4">
            <label className="block text-xs text-gray-400 uppercase tracking-widest mb-2">Produtos <span className="text-brand-gold">*</span></label>
            <div className="space-y-3">
              {selectedProducts.map((sp, idx) => (
                <div key={idx} className="bg-brand-dark border border-brand-border p-3">
                  {/* Mode toggle */}
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => updateRow(idx, { mode: 'catalog', customName: '', customPrice: '' })}
                      className={`text-xs px-3 py-1 font-bold uppercase tracking-wide transition-all ${sp.mode === 'catalog' ? 'bg-brand-gold text-brand-black' : 'bg-transparent text-gray-500 border border-brand-border hover:text-white'}`}
                    >Do Catálogo</button>
                    <button
                      onClick={() => updateRow(idx, { mode: 'custom', productId: '' })}
                      className={`text-xs px-3 py-1 font-bold uppercase tracking-wide transition-all ${sp.mode === 'custom' ? 'bg-brand-gold text-brand-black' : 'bg-transparent text-gray-500 border border-brand-border hover:text-white'}`}
                    >Personalizado</button>
                    {selectedProducts.length > 1 && (
                      <button onClick={() => setSelectedProducts(prev => prev.filter((_, i) => i !== idx))}
                        className="ml-auto text-xs text-gray-600 hover:text-red-400 transition-colors">✕ Remover</button>
                    )}
                  </div>

                  {sp.mode === 'catalog' ? (
                    <div className="flex gap-2">
                      <select
                        value={sp.productId}
                        onChange={e => updateRow(idx, { productId: e.target.value })}
                        className="flex-1 bg-brand-black border border-brand-border px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-gold"
                      >
                        <option value="">— Selecionar produto —</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.shortName || p.name} — R$ {p.price.toFixed(2)}</option>
                        ))}
                      </select>
                      <input
                        type="number" min="1" max="99" value={sp.quantity}
                        onChange={e => updateRow(idx, { quantity: parseInt(e.target.value) || 1 })}
                        className="w-16 bg-brand-black border border-brand-border px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-brand-gold"
                        placeholder="Qtd"
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={sp.customName}
                        onChange={e => updateRow(idx, { customName: e.target.value })}
                        placeholder="Nome do produto"
                        className="flex-1 bg-brand-black border border-brand-border px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold"
                      />
                      <input
                        type="number" min="0.01" step="0.01" value={sp.customPrice}
                        onChange={e => updateRow(idx, { customPrice: e.target.value })}
                        placeholder="R$ preço"
                        className="w-28 bg-brand-black border border-brand-border px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold"
                      />
                      <input
                        type="number" min="1" max="99" value={sp.quantity}
                        onChange={e => updateRow(idx, { quantity: parseInt(e.target.value) || 1 })}
                        placeholder="Qtd"
                        className="w-16 bg-brand-black border border-brand-border px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-brand-gold"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedProducts(p => [...p, { mode: 'catalog', productId: '', customName: '', customPrice: '', quantity: 1 }])}
              className="text-xs text-brand-gold hover:underline mt-2 block"
            >+ Adicionar produto</button>
          </div>

          {formError && <p className="text-xs text-red-400 mb-3">{formError}</p>}

          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={creating}
              className="btn-primary px-8 py-3 flex items-center gap-2">
              {creating ? <><div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" /> Criando...</> : '🔗 Gerar Link'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-dark px-6 py-3 text-sm">Cancelar</button>
          </div>
        </div>
      )}

      {/* ── Links Table ──────────────────────────────────────────────────── */}
      {loading ? <Spinner /> : links.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <div className="text-4xl mb-3">🔗</div>
          <p>Nenhum link criado ainda. Clique em "Novo Link" para começar.</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-brand-border">
          <div className="grid grid-cols-12 px-4 py-3 text-[10px] font-bold text-gray-600 uppercase tracking-widest border-b border-brand-border">
            <div className="col-span-3">Cliente</div>
            <div className="col-span-3">Produtos</div>
            <div className="col-span-2">Valor PIX</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1">Expira</div>
            <div className="col-span-2 text-right">Ações</div>
          </div>
          {links.map(link => {
            const val = totalAmount(link.items, link.discount_pct);
            const isExpired = link.expires_at && new Date(link.expires_at) < new Date() && link.status === 'pending';
            const statusDisplay = isExpired ? 'expired' : link.status;
            return (
              <div key={link.id} className="grid grid-cols-12 px-4 py-4 items-center border-b border-brand-border last:border-0 hover:bg-white/5 transition-colors">
                <div className="col-span-3">
                  <p className="text-sm text-white font-medium">{link.customer_name}</p>
                  {link.customer_email && <p className="text-xs text-gray-600 truncate">{link.customer_email}</p>}
                </div>
                <div className="col-span-3">
                  {(link.items || []).slice(0, 2).map((i, idx) => (
                    <p key={idx} className="text-xs text-gray-400 truncate">{i.name} ×{i.quantity}</p>
                  ))}
                  {link.items?.length > 2 && <p className="text-xs text-gray-600">+{link.items.length - 2} mais</p>}
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-brand-gold font-bold">{fmt(val)}</p>
                  {link.discount_pct > 0 && <p className="text-xs text-green-400">-{link.discount_pct}% extra</p>}
                </div>
                <div className="col-span-1"><LinkBadge status={statusDisplay} /></div>
                <div className="col-span-1">
                  <p className="text-xs text-gray-600">{link.expires_at ? fmtShort(link.expires_at) : '—'}</p>
                </div>
                <div className="col-span-2 flex gap-2 justify-end">
                  {(link.status === 'pending' && !isExpired) && (
                    <>
                      <button
                        onClick={() => copyLink(link.token)}
                        className={`text-xs px-3 py-1.5 font-bold uppercase tracking-wide transition-all ${copiedId === link.token ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-black hover:bg-brand-gold-light'}`}
                      >
                        {copiedId === link.token ? '✓ Copiado' : 'Copiar'}
                      </button>
                      <button onClick={() => handleCancel(link.id)} className="text-xs text-gray-600 hover:text-red-400 transition-colors px-1">✕</button>
                    </>
                  )}
                  {(link.status === 'paid') && (
                    <span className="text-xs text-green-400 font-medium">✓ Pago</span>
                  )}
                  {(link.status === 'cancelled' || link.status === 'expired' || isExpired) && (
                    <span className="text-xs text-gray-600">Inativo</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

