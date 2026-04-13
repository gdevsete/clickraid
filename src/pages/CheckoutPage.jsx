import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const maskCPF = (v) => {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length > 9) return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  if (v.length > 6) return v.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  if (v.length > 3) return v.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  return v;
};

const maskPhone = (v) => {
  v = v.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) return v.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (v.length > 6) return v.replace(/(\d{2})(\d{4,5})(\d{0,4})/, '($1) $2-$3');
  if (v.length > 2) return v.replace(/(\d{2})(\d{0,5})/, '($1) $2');
  return v;
};

const Field = ({ label, required, children, colSpan = 2 }) => (
  <div className={`col-span-${colSpan}`}>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
      {label} {required && <span className="text-brand-gold">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ readOnly, ...props }) => (
  <input
    {...props}
    readOnly={readOnly}
    className={`w-full bg-brand-dark border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none transition-colors ${
      readOnly
        ? 'border-brand-border text-gray-500 cursor-default'
        : 'border-brand-border focus:border-brand-gold'
    }`}
  />
);

const StepBar = ({ step }) => {
  const steps = ['Dados', 'Endereço', 'Revisão'];
  const active = typeof step === 'number' ? step : 3;
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = active > num;
        const current = active === num;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all ${
                done || current ? 'bg-brand-gold text-brand-black' : 'bg-brand-card border border-brand-border text-gray-600'
              }`}>
                {done
                  ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>
                  : num}
              </div>
              <span className={`text-[10px] uppercase tracking-wider ${done || current ? 'text-brand-gold' : 'text-gray-600'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-px mx-2 mb-4 transition-colors ${done ? 'bg-brand-gold' : 'bg-brand-border'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

const PixLogo = () => (
  <svg viewBox="0 0 124 40" className="h-8 w-auto" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(20,20) rotate(45)">
      <rect x="-16" y="-16" width="12" height="12" rx="2.5" fill="#32BCAD"/>
      <rect x="4"   y="-16" width="12" height="12" rx="2.5" fill="#32BCAD"/>
      <rect x="-16" y="4"   width="12" height="12" rx="2.5" fill="#32BCAD"/>
      <rect x="4"   y="4"   width="12" height="12" rx="2.5" fill="#32BCAD"/>
    </g>
    <text x="46" y="27" fontFamily="Arial, sans-serif" fontSize="22" fontWeight="800" fontStyle="italic" fill="#32BCAD">Pix</text>
  </svg>
);

export default function CheckoutPage() {
  const { items, subtotal, shipping, total, clearCart } = useCart();

  const [step, setStep] = useState(1); // 1 | 2 | 3 | 'pix' | 'success'
  const [cepStatus, setCepStatus] = useState('idle');
  const [autoFilled, setAutoFilled] = useState([]);
  const [creating, setCreating] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [payError, setPayError] = useState(null);
  const pollRef = useRef(null);

  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', cpf: '',
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  });

  // Stop polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const set = (name, value) => setForm(f => ({ ...f, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const handleCepChange = async (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 8);
    const formatted = raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5)}` : raw;
    set('cep', formatted);
    if (raw.length < 8) { setCepStatus('idle'); setAutoFilled([]); return; }
    setCepStatus('loading');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
      const data = await res.json();
      if (data.erro) { setCepStatus('notfound'); setAutoFilled([]); return; }
      setForm(f => ({ ...f, rua: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }));
      setAutoFilled(['rua', 'bairro', 'cidade', 'estado']);
      setCepStatus('success');
    } catch {
      setCepStatus('error'); setAutoFilled([]);
    }
  };

  const startPolling = (txId) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-status?transactionId=${txId}`);
        const data = await res.json();
        const status = data.data?.status;
        if (status === 'PAID') {
          clearInterval(pollRef.current);
          setStep('success');
          clearCart();
        } else if (status === 'CANCELLED') {
          clearInterval(pollRef.current);
          setPayError('PIX expirado ou cancelado. Clique em "Tentar Novamente".');
          setStep(3);
        }
      } catch {}
    }, 5000);
  };

  const handleGeneratePix = async () => {
    setCreating(true);
    setPayError(null);
    const externalRef = `CR-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    try {
      const res = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({ name: i.shortName || i.name, price: i.price, quantity: i.quantity })),
          customer: { nome: form.nome, email: form.email, telefone: form.telefone, cpf: form.cpf },
          shipping: { rua: form.rua, numero: form.numero, complemento: form.complemento, bairro: form.bairro, cidade: form.cidade, estado: form.estado, cep: form.cep },
          total,
          externalRef,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Erro ao criar cobrança PIX');
      const pd = data.data.paymentData;
      setPixData({
        qrCodeBase64: pd.qrCodeBase64?.startsWith('data:') ? pd.qrCodeBase64 : `data:image/png;base64,${pd.qrCodeBase64}`,
        copyPaste: pd.copyPaste,
        expiresAt: pd.expiresAt,
      });
      setTransactionId(data.data.transactionId);
      setStep('pix');
      startPolling(data.data.transactionId);
    } catch (err) {
      setPayError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = () => {
    if (!pixData?.copyPaste) return;
    navigator.clipboard.writeText(pixData.copyPaste);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const discountedTotal = total * 0.95;
  const discount = total * 0.05;

  // ── Empty cart ──────────────────────────────────────────────────────────────
  if (items.length === 0 && step !== 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-fade-in">
        <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <h2 className="font-heading text-3xl text-white mb-4">Carrinho Vazio</h2>
        <p className="text-gray-500 mb-6">Adicione produtos ao carrinho para continuar.</p>
        <Link to="/produtos" className="btn-primary">Ver Produtos</Link>
      </div>
    );
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center animate-fade-in">
        <div className="w-24 h-24 bg-brand-gold/10 border-2 border-brand-gold mx-auto flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
          </svg>
        </div>
        <h2 className="font-heading text-5xl text-white mb-3">PAGAMENTO CONFIRMADO!</h2>
        <p className="text-gray-400 mb-1">Obrigado pela sua compra, <span className="text-white font-semibold">{form.nome.split(' ')[0]}</span>!</p>
        <p className="text-gray-500 text-sm mb-1">
          Confirmação enviada para <span className="text-brand-gold">{form.email}</span>
        </p>
        {transactionId && (
          <p className="text-gray-600 text-xs mb-1">ID da transação: <span className="font-mono text-gray-500">{transactionId}</span></p>
        )}
        <p className="text-xs text-gray-600 mb-8">
          Prazo de produção: <span className="text-brand-gold">4 dias úteis</span> · Rastreio enviado por e-mail
        </p>
        <div className="bg-brand-card border border-brand-border p-5 mb-8 text-left">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Resumo</p>
          {items.map(i => (
            <div key={i.id} className="flex justify-between text-sm py-1.5 border-b border-brand-border last:border-0">
              <span className="text-gray-400">{i.shortName || i.name} × {i.quantity}</span>
              <span className="text-white">{formatPrice(i.price * i.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between text-green-400 text-sm mt-2">
            <span>Desconto PIX 5%</span>
            <span>-{formatPrice(discount)}</span>
          </div>
          <div className="flex justify-between text-brand-gold font-bold mt-2 pt-2 border-t border-brand-border">
            <span>Total pago</span>
            <span>{formatPrice(discountedTotal)}</span>
          </div>
        </div>
        <Link to="/" className="btn-primary">Voltar ao Início</Link>
      </div>
    );
  }

  // ── Main layout ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* ── LEFT: Form ────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">

          {typeof step === 'number' && <StepBar step={step} />}

          {/* ── STEP 1: DADOS PESSOAIS ──────────────────────────────────── */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="font-heading text-3xl text-white tracking-wide mb-6">DADOS PESSOAIS</h2>
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="grid grid-cols-2 gap-4">
                <Field label="Nome Completo" required colSpan={2}>
                  <Input name="nome" value={form.nome} onChange={handleChange} placeholder="João da Silva" required />
                </Field>
                <Field label="E-mail" required colSpan={1}>
                  <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="joao@email.com" required />
                </Field>
                <Field label="WhatsApp" required colSpan={1}>
                  <Input name="telefone" value={form.telefone} onChange={(e) => set('telefone', maskPhone(e.target.value))} placeholder="(11) 99999-9999" required />
                </Field>
                <Field label="CPF" required colSpan={2}>
                  <Input name="cpf" value={form.cpf} onChange={(e) => set('cpf', maskCPF(e.target.value))} placeholder="000.000.000-00" required minLength={14} />
                </Field>
                <div className="col-span-2 flex justify-end pt-2">
                  <button type="submit" className="btn-primary px-12 py-4">
                    Continuar → Endereço
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── STEP 2: ENDEREÇO ────────────────────────────────────────── */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-heading text-3xl text-white tracking-wide mb-6">ENDEREÇO DE ENTREGA</h2>
              <form onSubmit={(e) => { e.preventDefault(); setStep(3); }} className="grid grid-cols-2 gap-4">
                {/* CEP */}
                <Field label="CEP" required colSpan={2}>
                  <div className="relative">
                    <Input
                      name="cep"
                      value={form.cep}
                      onChange={handleCepChange}
                      placeholder="00000-000"
                      required
                      maxLength={9}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {cepStatus === 'loading' && (
                        <div className="w-4 h-4 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
                      )}
                      {cepStatus === 'success' && (
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                        </svg>
                      )}
                      {(cepStatus === 'error' || cepStatus === 'notfound') && (
                        <svg className="w-4 h-4 text-brand-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      )}
                    </div>
                  </div>
                  {cepStatus === 'notfound' && <p className="text-xs text-brand-red mt-1">CEP não encontrado.</p>}
                </Field>

                <Field label="Rua / Logradouro" required colSpan={2}>
                  <Input name="rua" value={form.rua} onChange={handleChange} placeholder="Rua das Flores" required readOnly={autoFilled.includes('rua')} />
                </Field>
                <Field label="Número" required colSpan={1}>
                  <Input name="numero" value={form.numero} onChange={handleChange} placeholder="123" required />
                </Field>
                <Field label="Complemento" colSpan={1}>
                  <Input name="complemento" value={form.complemento} onChange={handleChange} placeholder="Apto 45 (opcional)" />
                </Field>
                <Field label="Bairro" required colSpan={1}>
                  <Input name="bairro" value={form.bairro} onChange={handleChange} placeholder="Centro" required readOnly={autoFilled.includes('bairro')} />
                </Field>
                <Field label="Cidade" required colSpan={1}>
                  <Input name="cidade" value={form.cidade} onChange={handleChange} placeholder="São Paulo" required readOnly={autoFilled.includes('cidade')} />
                </Field>
                <Field label="Estado (UF)" required colSpan={2}>
                  <Input name="estado" value={form.estado} onChange={handleChange} placeholder="SP" required maxLength={2} readOnly={autoFilled.includes('estado')} />
                </Field>

                <div className="col-span-2 flex gap-3 justify-between pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-dark px-8 py-4">← Voltar</button>
                  <button type="submit" className="btn-primary px-12 py-4">Continuar → Revisão</button>
                </div>
              </form>
            </div>
          )}

          {/* ── STEP 3: REVISÃO ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="font-heading text-3xl text-white tracking-wide mb-6">REVISÃO DO PEDIDO</h2>

              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-brand-card border border-brand-border p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Dados pessoais</p>
                  <p className="text-sm text-white font-semibold">{form.nome}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{form.email}</p>
                  <p className="text-xs text-gray-400">{form.telefone}</p>
                  <p className="text-xs text-gray-500 mt-0.5">CPF: {form.cpf}</p>
                  <button onClick={() => setStep(1)} className="text-xs text-brand-gold hover:underline mt-2 block">Editar</button>
                </div>
                <div className="bg-brand-card border border-brand-border p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Endereço de entrega</p>
                  <p className="text-sm text-white">{form.rua}, {form.numero}</p>
                  {form.complemento && <p className="text-xs text-gray-400">{form.complemento}</p>}
                  <p className="text-xs text-gray-400">{form.bairro}</p>
                  <p className="text-xs text-gray-400">{form.cidade} / {form.estado} · {form.cep}</p>
                  <button onClick={() => setStep(2)} className="text-xs text-brand-gold hover:underline mt-2 block">Editar</button>
                </div>
              </div>

              {/* PIX discount highlight */}
              <div className="bg-brand-gold/10 border border-brand-gold/40 p-4 mb-6 flex items-center gap-4">
                <PixLogo />
                <div>
                  <p className="text-white text-sm font-bold">5% de desconto pagando via PIX</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    De <span className="line-through">{formatPrice(total)}</span>{' '}
                    por <span className="text-green-400 font-bold text-sm">{formatPrice(discountedTotal)}</span>
                    {' '}<span className="text-green-400">(-{formatPrice(discount)})</span>
                  </p>
                </div>
              </div>

              {payError && (
                <div className="bg-brand-red/10 border border-brand-red/40 text-brand-red text-sm p-3 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  </svg>
                  {payError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn-dark px-8 py-4">← Voltar</button>
                <button
                  type="button"
                  onClick={handleGeneratePix}
                  disabled={creating}
                  className="btn-primary flex-1 py-4 flex items-center justify-center gap-3 text-base"
                >
                  {creating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <PixLogo />
                      Gerar Código PIX
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ── PIX SCREEN ──────────────────────────────────────────────── */}
          {step === 'pix' && pixData && (
            <div className="animate-fade-in">
              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <p className="text-green-400 text-sm font-medium uppercase tracking-wider">Aguardando pagamento</p>
              </div>

              <h2 className="font-heading text-3xl text-white tracking-wide text-center mb-6">
                ESCANEIE O QR CODE
              </h2>

              {/* QR Code */}
              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 inline-block">
                  <img
                    src={pixData.qrCodeBase64}
                    alt="QR Code PIX"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="text-center mb-6">
                <p className="font-heading text-4xl text-brand-gold">{formatPrice(discountedTotal)}</p>
                <p className="text-green-400 text-xs font-medium mt-1">5% de desconto PIX aplicado!</p>
              </div>

              {/* Copy-paste */}
              <div className="bg-brand-card border border-brand-border p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Código Pix — Copia e Cola</p>
                <div className="flex gap-3 items-start">
                  <p className="text-xs text-gray-400 break-all flex-1 leading-relaxed font-mono select-all bg-brand-dark p-3 border border-brand-border">
                    {pixData.copyPaste}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className={`w-full mt-3 py-3 text-sm font-bold uppercase tracking-widest transition-all ${
                    copied
                      ? 'bg-green-500 text-white'
                      : 'bg-brand-gold text-brand-black hover:bg-brand-gold-light'
                  }`}
                >
                  {copied ? '✓ Código Copiado!' : 'Copiar Código PIX'}
                </button>
              </div>

              {/* Instructions */}
              <div className="bg-brand-dark border border-brand-border p-4 mb-6">
                <p className="text-xs font-bold text-white uppercase tracking-widest mb-3">Como pagar:</p>
                <div className="space-y-2">
                  {[
                    'Abra o aplicativo do seu banco',
                    'Acesse a área PIX e escolha "Pagar com QR Code" ou "Copia e Cola"',
                    'Escaneie o QR Code ou cole o código copiado',
                    'Confirme o valor e finalize o pagamento',
                    'A página atualiza automaticamente após a confirmação',
                  ].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-5 h-5 bg-brand-gold/20 text-brand-gold text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                      <p className="text-xs text-gray-400 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-gray-600 text-xs">
                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                Verificando pagamento a cada 5 segundos...
              </div>
              {transactionId && (
                <p className="text-center text-xs text-gray-700 mt-2 font-mono">{transactionId}</p>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: Order summary ──────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="bg-brand-card border border-brand-border p-6 sticky top-24">
            <h3 className="font-heading text-xl text-white tracking-wide mb-6 pb-4 border-b border-brand-border">
              RESUMO DO PEDIDO
            </h3>

            <div className="space-y-4 mb-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 bg-brand-dark flex-shrink-0 overflow-hidden">
                    <img src={item.images?.[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium leading-tight truncate">{item.shortName || item.name}</p>
                    {item.selectedVariant && <p className="text-xs text-gray-600">{item.selectedVariant}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Qtd: {item.quantity}</p>
                  </div>
                  <span className="text-xs text-white whitespace-nowrap self-start">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-brand-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Frete</span>
                <span className={shipping === 0 ? 'text-brand-gold font-medium' : 'text-white'}>
                  {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                </span>
              </div>
              {(step === 3 || step === 'pix') && (
                <div className="flex justify-between text-sm text-green-400">
                  <span>Desconto PIX (5%)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-3 border-t border-brand-border">
                <span className="text-white font-heading tracking-wide text-lg">TOTAL</span>
                <span className="text-brand-gold font-heading text-xl">
                  {(step === 3 || step === 'pix') ? formatPrice(discountedTotal) : formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-brand-border space-y-1.5">
              {[
                ['Pagamento 100% via PIX', true],
                ['Prazo de produção: 4 dias úteis', false],
                ['Entrega para todo o Brasil', false],
              ].map(([text, gold]) => (
                <div key={text} className="flex items-center gap-2">
                  <svg className={`w-3.5 h-3.5 flex-shrink-0 ${gold ? 'text-brand-gold' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                  </svg>
                  <span className={`text-xs ${gold ? 'text-brand-gold font-medium' : 'text-gray-500'}`}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
