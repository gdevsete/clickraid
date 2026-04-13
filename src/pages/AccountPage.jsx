import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const formatPrice = (v) => (v / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

const statusLabel = {
  paid: { label: 'Pago', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  pending: { label: 'Aguardando', color: 'text-brand-gold bg-brand-gold/10 border-brand-gold/30' },
  cancelled: { label: 'Cancelado', color: 'text-brand-red bg-brand-red/10 border-brand-red/30' },
};

export default function AccountPage() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setOrdersLoading(false);
      });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <p className="text-gray-500 text-sm uppercase tracking-widest mb-1">Minha Conta</p>
          <h1 className="font-heading text-4xl text-white">OLÁ, {firstName.toUpperCase()}</h1>
          <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs text-gray-500 hover:text-brand-red transition-colors uppercase tracking-widest border border-brand-border px-4 py-2"
        >
          Sair
        </button>
      </div>

      {/* Orders */}
      <div className="bg-brand-card border border-brand-border">
        <div className="px-6 py-4 border-b border-brand-border">
          <h2 className="font-heading text-xl text-white tracking-wide">MEUS PEDIDOS</h2>
        </div>

        {ordersLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <svg className="w-12 h-12 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p className="text-gray-500 text-sm mb-6">Nenhum pedido encontrado.</p>
            <Link to="/produtos" className="btn-primary">Ver Produtos</Link>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {orders.map((order) => {
              const st = statusLabel[order.status] || statusLabel.pending;
              const items = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="px-6 py-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-mono mb-1">{order.transaction_id}</p>
                      <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 border font-medium ${st.color}`}>{st.label}</span>
                      <span className="text-brand-gold font-bold font-heading text-lg">{formatPrice(order.amount)}</span>
                    </div>
                  </div>
                  {items.length > 0 && (
                    <div className="space-y-1">
                      {items.map((item, i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-gray-400">{item.name} × {item.quantity}</span>
                          <span className="text-gray-500">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-600 mt-6 text-center">
        Dúvidas? Entre em contato pelo{' '}
        <a href="https://wa.me/5511999999999" className="text-brand-gold hover:underline" target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </p>
    </div>
  );
}
