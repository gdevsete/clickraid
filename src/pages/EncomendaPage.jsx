import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';

const showcaseProducts = products.filter(p => p.category !== 'acessorios').slice(0, 6);

const BenefitItem = ({ icon, title, text }) => (
  <div className="flex gap-4">
    <div className="w-10 h-10 bg-brand-gold/10 border border-brand-gold/40 flex items-center justify-center flex-shrink-0 text-brand-gold mt-0.5">
      {icon}
    </div>
    <div>
      <p className="text-sm font-bold text-white uppercase tracking-wider">{title}</p>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{text}</p>
    </div>
  </div>
);

const atacadoFaixas = [
  { qtd: '5–9 unidades', desconto: '10% de desconto', cor: 'text-gray-300' },
  { qtd: '10–24 unidades', desconto: '20% de desconto', cor: 'text-brand-gold' },
  { qtd: '25–49 unidades', desconto: '30% de desconto', cor: 'text-brand-gold' },
  { qtd: '50+ unidades', desconto: '40% de desconto', cor: 'text-green-400' },
];

export default function EncomendaPage() {
  const [form, setForm] = useState({
    nome: '', email: '', telefone: '',
    tipo: 'encomenda', modelo: '', quantidade: '', observacoes: '',
  });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <section className="relative py-24 bg-brand-dark border-b border-brand-border overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="https://clickraidofficial.com/cdn/shop/files/NEW_14.png?v=1773855238&width=990"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark via-brand-dark/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Personalizado para você</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h1 className="section-title text-5xl md:text-7xl mb-4">ENCOMENDAS<br />&amp; ATACADO</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm leading-relaxed">
            Quer um modelo específico ou precisa de grandes quantidades? A Clickraid™ aceita encomendas personalizadas
            com prazo de produção de <span className="text-brand-gold font-semibold">4 dias úteis</span>, e oferece
            preços especiais para revendedores e compras no atacado.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a href="#solicitar" className="btn-primary">
              Fazer Encomenda
            </a>
            <a href="#atacado" className="btn-outline">
              Ver Preços Atacado
            </a>
          </div>
        </div>
      </section>

      {/* MODELOS DISPONÍVEIS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="h-px w-8 bg-brand-gold" />
            <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Galeria</span>
            <div className="h-px w-8 bg-brand-gold" />
          </div>
          <h2 className="section-title text-3xl md:text-4xl">MODELOS DISPONÍVEIS PARA ENCOMENDA</h2>
          <p className="text-gray-500 text-sm mt-2">Escolha um dos nossos modelos ou solicite um personalizado</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {showcaseProducts.map(p => (
            <Link
              key={p.id}
              to={`/produto/${p.slug}`}
              className="group relative overflow-hidden bg-brand-card border border-brand-border hover:border-brand-gold/50 transition-all duration-300"
            >
              <div className="aspect-square overflow-hidden bg-brand-dark">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-white tracking-wide truncate">{p.shortName || p.name}</p>
                <p className="text-xs text-brand-gold mt-0.5">
                  {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          Não encontrou o modelo que procura?{' '}
          <a href="#solicitar" className="text-brand-gold hover:underline">Solicite uma encomenda personalizada →</a>
        </p>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 bg-brand-dark border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="section-title text-3xl md:text-4xl">COMO FUNCIONA A ENCOMENDA</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 relative">
            {[
              {
                num: '01',
                title: 'Escolha o Modelo',
                text: 'Selecione entre os nossos modelos disponíveis ou descreva o modelo desejado no formulário.',
              },
              {
                num: '02',
                title: 'Pagamento PIX',
                text: 'Após confirmar sua encomenda, realize o pagamento via PIX. 5% de desconto garantido.',
              },
              {
                num: '03',
                title: 'Produção em 4 Dias',
                text: 'Nossa equipe inicia a produção imediatamente após a confirmação do pagamento.',
              },
              {
                num: '04',
                title: 'Entrega',
                text: 'Enviamos para todo o Brasil com código de rastreamento em até 7 dias úteis.',
              },
            ].map((step, i) => (
              <div key={step.num} className="relative flex flex-col items-center text-center px-6 py-8 border border-brand-border">
                <span className="font-heading text-5xl text-brand-gold/20 mb-3">{step.num}</span>
                <p className="text-sm font-bold text-white uppercase tracking-wider mb-2">{step.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{step.text}</p>
                {i < 3 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 bg-brand-gold items-center justify-center text-brand-black text-xs font-bold">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ATACADO */}
      <section id="atacado" className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Revenda</span>
            </div>
            <h2 className="section-title text-3xl md:text-4xl mb-4">VENDEMOS NO ATACADO</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Seja um revendedor Clickraid™. Oferecemos preços especiais para compras em quantidade,
              ideais para lojas, feiras, eventos e revendedores autônomos.
              Pagamento via PIX com desconto progressivo conforme volume.
            </p>

            <div className="space-y-4 mb-8">
              <BenefitItem
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
                title="Desconto Progressivo"
                text="Quanto maior o pedido, maior o desconto. A partir de 5 unidades já há desconto garantido."
              />
              <BenefitItem
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>}
                title="Envio Direto"
                text="Embalagem neutra disponível. Entregamos para todo o Brasil com nota fiscal."
              />
              <BenefitItem
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
                title="Mix de Modelos"
                text="Monte seu kit com modelos diferentes. Combine pistolas, fuzis e acessórios."
              />
            </div>
          </div>

          <div className="bg-brand-card border border-brand-border p-6">
            <h3 className="font-heading text-xl text-white tracking-wide mb-6 pb-4 border-b border-brand-border">
              TABELA DE DESCONTOS
            </h3>
            <div className="space-y-3">
              {atacadoFaixas.map((f, i) => (
                <div key={i} className={`flex items-center justify-between py-3 px-4 border ${i === atacadoFaixas.length - 1 ? 'border-green-500/30 bg-green-500/5' : 'border-brand-border'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-brand-gold" />
                    <span className="text-sm text-gray-300 font-medium">{f.qtd}</span>
                  </div>
                  <span className={`text-sm font-bold ${f.cor}`}>{f.desconto}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-4 border-t border-brand-border pt-4">
              * Descontos aplicados sobre o preço de tabela. Pagamento via PIX. Para pedidos acima de 100 unidades, entre em contato para negociação especial.
            </p>
            <a href="#solicitar" className="btn-primary w-full mt-4 block text-center">
              Solicitar Orçamento Atacado
            </a>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO */}
      <section id="solicitar" className="py-20 bg-brand-dark border-t border-brand-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Contato</span>
              <div className="h-px w-8 bg-brand-gold" />
            </div>
            <h2 className="section-title text-3xl md:text-4xl">SOLICITAR ENCOMENDA</h2>
            <p className="text-gray-500 text-sm mt-2">Preencha o formulário e entraremos em contato em até 24h</p>
          </div>

          {sent ? (
            <div className="bg-brand-card border border-brand-gold/30 p-10 text-center animate-fade-in">
              <div className="w-16 h-16 bg-brand-gold/10 border border-brand-gold mx-auto flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 className="font-heading text-2xl text-white mb-2">SOLICITAÇÃO ENVIADA!</h3>
              <p className="text-gray-400 text-sm mb-1">Recebemos seu pedido, <span className="text-brand-gold">{form.nome.split(' ')[0]}</span>.</p>
              <p className="text-gray-500 text-xs mb-6">Nossa equipe entrará em contato via <span className="text-white">{form.email || form.telefone}</span> em até 24h.</p>
              <button onClick={() => setSent(false)} className="btn-outline text-sm py-2 px-6">
                Fazer Nova Solicitação
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-brand-card border border-brand-border p-6 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Pedido</label>
                <div className="flex gap-2">
                  {[
                    { id: 'encomenda', label: 'Encomenda' },
                    { id: 'atacado', label: 'Atacado / Revenda' },
                  ].map(t => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setForm(f => ({ ...f, tipo: t.id }))}
                      className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider border transition-all ${
                        form.tipo === t.id
                          ? 'bg-brand-gold text-brand-black border-brand-gold'
                          : 'bg-brand-dark text-gray-400 border-brand-border hover:border-gray-500'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Nome Completo *</label>
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  required
                  placeholder="João Silva"
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              {/* Email + Tel */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">E-mail *</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="joao@email.com"
                    className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">WhatsApp *</label>
                  <input
                    type="tel"
                    name="telefone"
                    value={form.telefone}
                    onChange={handleChange}
                    required
                    placeholder="(11) 99999-9999"
                    className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                  />
                </div>
              </div>

              {/* Modelo */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Modelo Desejado *</label>
                <input
                  type="text"
                  name="modelo"
                  value={form.modelo}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Glock 17 preta, Beretta dourada..."
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                />
              </div>

              {/* Quantidade */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quantidade *</label>
                <input
                  type="number"
                  name="quantidade"
                  value={form.quantidade}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Ex: 1, 10, 50..."
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors"
                />
                {form.tipo === 'atacado' && Number(form.quantidade) >= 5 && (
                  <p className="text-xs text-green-400 mt-1">
                    {Number(form.quantidade) >= 50 ? '40%' : Number(form.quantidade) >= 25 ? '30%' : Number(form.quantidade) >= 10 ? '20%' : '10%'} de desconto aplicado nesta quantidade!
                  </p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Observações</label>
                <textarea
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Cor, variante, personalização especial, prazo desejado..."
                  className="w-full bg-brand-dark border border-brand-border px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary w-full py-4">
                  Enviar Solicitação
                </button>
                <p className="text-xs text-gray-600 text-center mt-3">
                  Prazo de produção: <span className="text-brand-gold">4 dias úteis</span> · Pagamento via PIX · Resposta em até 24h
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}
