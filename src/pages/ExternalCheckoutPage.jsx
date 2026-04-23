import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pixelPurchase, pixelInitiateCheckout } from '../lib/pixel';
import { isValidDoc, maskDoc, docLabel, getGatewayCPF } from '../lib/docUtils';

const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const maskPhone = (v) => {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (v.length > 6) return v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
  if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return v;
};

// ── Countdown timer ──────────────────────────────────────────────────────────
function Countdown({ expiresAt }) {
  const [left, setLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt) - Date.now();
      if (diff <= 0) { setLeft('Expirado'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return <span className="font-mono font-bold">{left}</span>;
}

// ── PIX QR Logo ──────────────────────────────────────────────────────────────
const PixLogo = ({ className = 'h-7 w-auto' }) => (
  <svg viewBox="0 0 124 40" className={className} xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(20,20) rotate(45)">
      <rect x="-16" y="-16" width="12" height="12" rx="2.5" fill="#32BCAD"/>
      <rect x="4"   y="-16" width="12" height="12" rx="2.5" fill="#32BCAD"/>
      <rect x="-16" y="4"   width="12" height="12" rx="2.5" fill="#32BCAD"/>
      <rect x="4"   y="4"   width="12" height="12" rx="2.5" fill="#32BCAD"/>
    </g>
    <text x="46" y="27" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="800" fontStyle="italic" fill="#32BCAD">Pix</text>
  </svg>
);

const REVIEWS = [
  { name: 'Rafael M***', text: 'Produto incrível, muito bem feito! Detalhes perfeitos.', stars: 5 },
  { name: 'Lucas S***', text: 'Chegou rápido e bem embalado. Recomendo muito!', stars: 5 },
  { name: 'Gabriel F***', text: 'Qualidade premium, parece o real. Meu chaveiro favorito.', stars: 5 },
];

export default function ExternalCheckoutPage() {
  const { token } = useParams();
  const [linkData, setLinkData] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading|error|expired|paid|ready

  const [form, setForm] = useState({ email: '', telefone: '', cpf: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '' });
  const [cpfError, setCpfError] = useState('');
  const [cepStatus, setCepStatus] = useState('idle');
  const [creating, setCreating] = useState(false);
  const [payError, setPayError] = useState('');
  const [pixData, setPixData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState('form'); // form | pix | success
  const [accountMsg, setAccountMsg] = useState('');
  const pollRef = useRef(null);

  // Load link data
  useEffect(() => {
    if (!token) { setLoadState('error'); return; }
    fetch(`/api/payment-link?token=${token.toUpperCase()}`)
      .then(r => r.json())
      .then(d => {
        if (!d.success) {
          setLoadState(d.error === 'expired' ? 'expired' : 'error');
          return;
        }
        if (d.data.status === 'paid') { setLoadState('paid'); setLinkData(d.data); return; }
        if (d.data.status === 'expired' || d.data.status === 'cancelled') { setLoadState('expired'); return; }
        setLinkData(d.data);
        setForm(f => ({
          ...f,
          email: d.data.customer_email || '',
          telefone: d.data.customer_phone || '',
        }));
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [token]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  if (!linkData && loadState === 'loading') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadState === 'expired') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⏰</div>
          <h2 className="font-heading text-3xl text-white mb-2">LINK EXPIRADO</h2>
          <p className="text-gray-400 text-sm mb-6">Este link de pagamento não está mais disponível. Entre em contato para gerar um novo.</p>
          <a href="https://wa.me/5511996754217" className="btn-primary inline-block px-8 py-3">Falar no WhatsApp</a>
        </div>
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="font-heading text-3xl text-white mb-2">LINK NÃO ENCONTRADO</h2>
          <p className="text-gray-400 text-sm">Verifique o link recebido ou entre em contato.</p>
        </div>
      </div>
    );
  }

  if (loadState === 'paid') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-500/10 border-2 border-green-500 mx-auto flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="font-heading text-3xl text-white mb-2">PAGAMENTO CONFIRMADO</h2>
          <p className="text-gray-400 text-sm">Seu pedido foi confirmado! Você receberá atualizações por e-mail.</p>
        </div>
      </div>
    );
  }

  const { customer_name, customer_email, items = [], discount_pct = 0, expires_at } = linkData;

  // Price calculations
  const baseTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const afterDiscount = discount_pct > 0 ? baseTotal * (1 - discount_pct / 100) : baseTotal;
  const pixDiscount = afterDiscount * 0.05;
  const finalTotal = afterDiscount * 0.95;

  // CEP lookup
  const handleCepChange = async (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    setForm(f => ({ ...f, cep: formatted }));
    if (raw.length < 8) { setCepStatus('idle'); return; }
    setCepStatus('loading');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (data.erro) { setCepStatus('notfound'); return; }
      setForm(f => ({ ...f, rua: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }));
      setCepStatus('success');
    } catch { setCepStatus('error'); }
  };

  const startPolling = (txId) => {
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`/api/payment-status?transactionId=${txId}`);
        const d = await r.json();
        const status = d.data?.status;
        if (status === 'PAID') {
          clearInterval(pollRef.current);
          pixelPurchase({ value: finalTotal, transactionId: txId, items: items.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })) });
          // Register user
          fetch('/api/register-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: form.email,
              name: customer_name,
              phone: form.telefone,
              cpf: form.cpf,
              address: { rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, estado: form.estado, cep: form.cep },
              transactionId: txId,
              orderItems: items,
              total: finalTotal,
            }),
          }).then(r => r.json()).then(d => setAccountMsg(d.message || '')).catch(() => {});
          // Mark link as paid
          fetch('/api/admin/payment-links', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: linkData.id, status: 'paid' }),
          }).catch(() => {});
          setStep('success');
        } else if (status === 'CANCELLED') {
          clearInterval(pollRef.current);
          setPayError('PIX expirado ou cancelado. Clique em "Tentar Novamente".');
          setStep('form');
        }
      } catch {}
    }, 5000);
  };

  const handleGeneratePix = async () => {
    if (!isValidDoc(form.cpf)) { setCpfError('Documento inválido.'); return; }
    if (!form.email) { setPayError('E-mail é obrigatório.'); return; }
    setCpfError(''); setPayError('');
    setCreating(true);
    const externalRef = `CRL-${token}-${Date.now()}`;
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ name: i.name, price: parseFloat((i.price * (1 - discount_pct / 100)).toFixed(2)), quantity: i.quantity })),
          customer: { nome: customer_name, email: form.email, telefone: form.telefone, cpf: getGatewayCPF(form.cpf) },
          shipping: { rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, estado: form.estado, cep: form.cep },
          total: afterDiscount,
          externalRef,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao criar PIX');
      const pd = data.data?.paymentData || data.data?.pix || data.data || {};
      const copyPaste = pd.copyPaste || pd.pixCopyPaste || pd.qrCode || pd.emv || '';
      const rawQr = pd.qrCodeBase64 || pd.qrcode || pd.qr_code_base64 || pd.qrCodeImage || pd.pixQrCode || '';
      const qrCodeUrl = rawQr
        ? (rawQr.startsWith('data:') ? rawQr : `data:image/png;base64,${rawQr}`)
        : `https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(copyPaste)}`;
      const txId = data.data.transactionId;
      setPixData({ qrCodeUrl, copyPaste, transactionId: txId });
      // Salvar pedido pendente imediatamente para aparecer no admin
      fetch('/api/save-pending-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: txId,
          items: items.map(i => ({ name: i.name, price: parseFloat((i.price * (1 - discount_pct / 100)).toFixed(2)), quantity: i.quantity })),
          amount: afterDiscount,
          customerData: {
            name: customer_name,
            email: form.email,
            phone: form.telefone,
            cpf: form.cpf,
            address: { rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, estado: form.estado, cep: form.cep },
          },
        }),
      }).catch(() => {});
      setStep('pix');
      startPolling(txId);
      pixelInitiateCheckout({ total: finalTotal, numItems: items.reduce((s, i) => s + i.quantity, 0), contentIds: items.map(i => i.id) });
    } catch (err) {
      setPayError(err.message);
    } finally {
      setCreating(false);
    }
  };

  // ── SUCCESS ─────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full text-center animate-fade-in">
          <div className="w-24 h-24 bg-brand-gold/10 border-2 border-brand-gold mx-auto flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
          </div>
          <h2 className="font-heading text-4xl text-white mb-2">PAGAMENTO CONFIRMADO!</h2>
          <p className="text-gray-400 mb-1">Obrigado, <span className="text-white font-semibold">{customer_name.split(' ')[0]}</span>!</p>
          <p className="text-gray-500 text-sm mb-6">Confirmação enviada para <span className="text-brand-gold">{form.email}</span></p>
          <div className="bg-brand-card border border-brand-gold/30 p-5 mb-6 text-left">
            <p className="text-white text-sm font-bold mb-1">📧 Sua conta foi criada!</p>
            <p className="text-gray-400 text-xs">
              {accountMsg || `Enviamos um e-mail para ${form.email} com um link para você criar sua senha e acompanhar seus pedidos.`}
            </p>
          </div>
          <div className="bg-brand-card border border-brand-border p-5 text-left mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Resumo</p>
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between text-sm py-1.5 border-b border-brand-border last:border-0">
                <span className="text-gray-400">{i.name} × {i.quantity}</span>
                <span className="text-white">{fmt(i.price * i.quantity)}</span>
              </div>
            ))}
            {discount_pct > 0 && (
              <div className="flex justify-between text-green-400 text-sm mt-2">
                <span>Desconto especial ({discount_pct}%)</span>
                <span>-{fmt(baseTotal - afterDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-green-400 text-sm mt-1">
              <span>Desconto PIX (5%)</span>
              <span>-{fmt(pixDiscount)}</span>
            </div>
            <div className="flex justify-between font-bold text-brand-gold mt-2 pt-2 border-t border-brand-border">
              <span>Total pago</span>
              <span>{fmt(finalTotal)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-600">Prazo de produção: <span className="text-brand-gold">4 dias úteis</span></p>
        </div>
      </div>
    );
  }

  // ── PIX SCREEN ──────────────────────────────────────────────────────────────
  if (step === 'pix' && pixData) {
    return (
      <div className="min-h-screen bg-brand-black py-10 px-4">
        <div className="max-w-md mx-auto animate-fade-in">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/"><img src="/clickraid-logo.png" alt="ClickRaid" className="h-10 mx-auto mb-4 opacity-80" /></Link>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <p className="text-green-400 text-sm font-medium uppercase tracking-wider">Aguardando seu pagamento</p>
            </div>
            <h2 className="font-heading text-3xl text-white">ESCANEIE O QR CODE</h2>
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4">
              <img src={pixData.qrCodeUrl} alt="QR Code PIX" className="w-56 h-56 object-contain"
                onError={(e) => { if (!e.target.dataset.fallback) { e.target.dataset.fallback='1'; e.target.src=`https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(pixData.copyPaste)}`; }}} />
            </div>
          </div>

          {/* Amount */}
          <div className="text-center mb-6">
            <p className="font-heading text-5xl text-brand-gold">{fmt(finalTotal)}</p>
            <p className="text-green-400 text-xs mt-1">5% de desconto PIX aplicado!</p>
          </div>

          {/* Copy-paste */}
          <div className="bg-brand-card border border-brand-border p-4 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Código PIX — Copia e Cola</p>
            <p className="text-xs text-gray-400 break-all font-mono bg-brand-dark p-3 border border-brand-border select-all mb-3">{pixData.copyPaste}</p>
            <button
              onClick={() => { navigator.clipboard.writeText(pixData.copyPaste); setCopied(true); setTimeout(() => setCopied(false), 3000); }}
              className={`w-full py-3 text-sm font-bold uppercase tracking-widest transition-all ${copied ? 'bg-green-500 text-white' : 'bg-brand-gold text-brand-black hover:bg-brand-gold-light'}`}
            >
              {copied ? '✓ Código Copiado!' : 'Copiar Código PIX'}
            </button>
          </div>

          {/* Steps */}
          <div className="bg-brand-dark border border-brand-border p-4 mb-4">
            <p className="text-xs font-bold text-white uppercase tracking-widest mb-3">Como pagar:</p>
            <div className="space-y-2">
              {['Abra o app do seu banco', 'Acesse PIX → "Pagar com QR Code" ou "Copia e Cola"', 'Escaneie ou cole o código', 'Confirme o valor e finalize', 'A página atualiza automaticamente'].map((s, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                  <p className="text-xs text-gray-400">{s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-xs">
            <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
            Verificando pagamento a cada 5 segundos...
          </div>
        </div>
      </div>
    );
  }

  // ── MAIN CHECKOUT FORM ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-black">

      {/* ── Countdown bar ─────────────────────────────────────────────────── */}
      {expires_at && (
        <div className="bg-brand-gold text-brand-black text-center py-2.5 text-xs font-bold uppercase tracking-wider sticky top-0 z-50">
          ⏰ Este link expira em: <Countdown expiresAt={expires_at} /> — Garanta seu produto agora!
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 py-10">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/"><img src="/clickraid-logo.png" alt="ClickRaid" className="h-10 mx-auto mb-4" /></Link>
        </div>

        {/* ── Hero personalized ───────────────────────────────────────────── */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-widest px-4 py-2 mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Produto reservado para você
          </div>
          <h1 className="font-heading text-4xl text-white mb-2">
            Olá, {customer_name.split(' ')[0]}! 🎯
          </h1>
          <p className="text-gray-400 text-sm">Seu pedido está esperando — finalize o pagamento para garantir.</p>
        </div>

        {/* ── Product card(s) ─────────────────────────────────────────────── */}
        <div className="bg-brand-card border border-brand-border mb-6">
          {items.map((item, idx) => (
            <div key={idx} className={`flex gap-4 p-4 ${idx < items.length - 1 ? 'border-b border-brand-border' : ''}`}>
              <div className="w-24 h-24 bg-brand-dark flex-shrink-0 overflow-hidden">
                <img src={item.image || item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base leading-tight mb-1">{item.name}</p>
                {item.selectedVariant && <p className="text-xs text-gray-500 mb-1">{item.selectedVariant}</p>}
                <p className="text-xs text-gray-500 mb-2">Qtd: {item.quantity}</p>
                <div className="flex items-baseline gap-2">
                  {discount_pct > 0 && (
                    <span className="text-gray-600 text-sm line-through">{fmt(item.price * item.quantity)}</span>
                  )}
                  <span className="text-brand-gold font-bold text-lg">
                    {fmt(item.price * item.quantity * (1 - discount_pct / 100))}
                  </span>
                  {discount_pct > 0 && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 font-bold">-{discount_pct}%</span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Price summary */}
          <div className="bg-brand-dark/50 px-4 py-3 border-t border-brand-border">
            {discount_pct > 0 && (
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Desconto especial ({discount_pct}%)</span>
                <span className="text-green-400">-{fmt(baseTotal - afterDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Desconto PIX (5%)</span>
              <span className="text-green-400">-{fmt(pixDiscount)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2 pt-2 border-t border-brand-border">
              <span className="text-white font-heading tracking-wide">TOTAL PIX</span>
              <span className="text-brand-gold font-heading text-xl">{fmt(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* ── PIX highlight ───────────────────────────────────────────────── */}
        <div className="bg-brand-gold/10 border border-brand-gold/40 p-4 mb-6 flex items-center gap-4">
          <PixLogo />
          <div>
            <p className="text-white text-sm font-bold">Pague via PIX — mais rápido e seguro</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Economize <span className="text-green-400 font-bold">{fmt(pixDiscount)}</span> com 5% de desconto no PIX
            </p>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <div className="bg-brand-card border border-brand-border p-6 mb-6">
          <h3 className="font-heading text-lg text-white tracking-wide mb-5">SEUS DADOS</h3>

          <div className="space-y-4">
            {/* Name (readonly) */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Nome</label>
              <input value={customer_name} readOnly className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-gray-500 cursor-default" />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">E-mail <span className="text-brand-gold">*</span></label>
              <input
                type="email" value={form.email} placeholder="seu@email.com" required
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>

            {/* Phone + CPF row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp <span className="text-brand-gold">*</span></label>
                <input
                  value={form.telefone} placeholder="(11) 99999-9999" required
                  onChange={e => setForm(f => ({ ...f, telefone: maskPhone(e.target.value) }))}
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{docLabel(form.cpf)} / Documento <span className="text-brand-gold">*</span></label>
                <input
                  value={form.cpf} placeholder="CPF, CUIT ou DNI" required
                  onChange={e => { setForm(f => ({ ...f, cpf: maskDoc(e.target.value) })); if (cpfError) setCpfError(''); }}
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                />
                {cpfError && <p className="text-xs text-red-400 mt-1">{cpfError}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="pt-2 border-t border-brand-border">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Endereço de Entrega</p>
              <div className="space-y-3">
                <div className="relative">
                  <label className="block text-xs text-gray-500 mb-1">CEP <span className="text-brand-gold">*</span></label>
                  <input
                    value={form.cep} placeholder="00000-000" maxLength={9}
                    onChange={handleCepChange}
                    className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors pr-10"
                  />
                  <div className="absolute right-3 top-[calc(50%+4px)] -translate-y-1/2">
                    {cepStatus === 'loading' && <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />}
                    {cepStatus === 'success' && <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">Rua <span className="text-brand-gold">*</span></label>
                    <input value={form.rua} onChange={e => setForm(f => ({ ...f, rua: e.target.value }))} placeholder="Rua das Flores"
                      className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nº <span className="text-brand-gold">*</span></label>
                    <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} placeholder="123"
                      className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors" />
                  </div>
                </div>
                <input value={form.complemento} onChange={e => setForm(f => ({ ...f, complemento: e.target.value }))} placeholder="Complemento (opcional)"
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors" />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cidade <span className="text-brand-gold">*</span></label>
                    <input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="São Paulo"
                      className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Estado <span className="text-brand-gold">*</span></label>
                    <input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} placeholder="SP" maxLength={2}
                      className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors uppercase" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Review mini ─────────────────────────────────────────────────── */}
        <div className="bg-brand-card border border-brand-border p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            {[1,2,3,4,5].map(s => <svg key={s} className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
            <span className="text-brand-gold text-sm font-bold">4.9</span>
            <span className="text-gray-500 text-xs">· 2.500+ clientes</span>
          </div>
          {REVIEWS.map((r, i) => (
            <div key={i} className={`py-3 ${i < REVIEWS.length - 1 ? 'border-b border-brand-border' : ''}`}>
              <p className="text-gray-300 text-xs italic mb-1">"{r.text}"</p>
              <p className="text-gray-600 text-xs">— {r.name}</p>
            </div>
          ))}
        </div>

        {/* ── Error ───────────────────────────────────────────────────────── */}
        {payError && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
            {payError}
          </div>
        )}

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <button
          onClick={handleGeneratePix}
          disabled={creating}
          className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 mb-4"
        >
          {creating ? (
            <><div className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" /> Gerando PIX...</>
          ) : (
            <><PixLogo className="h-8 w-auto" /> Pagar {fmt(finalTotal)} via PIX</>
          )}
        </button>

        {/* Trust badges */}
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            ['🔒', 'Pagamento', 'Seguro'],
            ['⚡', 'Confirmação', 'Imediata'],
            ['📦', 'Entrega', 'Garantida'],
          ].map(([icon, l1, l2]) => (
            <div key={l1} className="bg-brand-card border border-brand-border p-3 text-center">
              <div className="text-xl mb-1">{icon}</div>
              <p className="text-white text-xs font-bold">{l1}</p>
              <p className="text-gray-500 text-xs">{l2}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-700">
          © ClickRaid · <a href="https://www.clickraidofc.com.br" className="hover:text-gray-500">clickraidofc.com.br</a>
        </p>
      </div>
    </div>
  );
}
