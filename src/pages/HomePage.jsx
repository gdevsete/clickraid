import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';

const featuredProducts = products.slice(0, 4);
const bestSellers = products.filter(p => p.badge === 'hot' || p.reviews > 200);

const BulletPoint = ({ children }) => (
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 bg-brand-gold/20 border border-brand-gold flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
      </svg>
    </div>
    <span className="text-sm text-gray-300">{children}</span>
  </div>
);

const FeatureCard = ({ icon, title, text }) => (
  <div className="flex flex-col items-center text-center p-6 bg-brand-card border border-brand-border hover:border-brand-gold/30 transition-all duration-300">
    <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center mb-4 text-brand-gold">
      {icon}
    </div>
    <h3 className="font-heading text-lg tracking-wide text-white mb-2">{title}</h3>
    <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
  </div>
);

const ReviewCard = ({ name, text, rating, product }) => (
  <div className="bg-brand-card border border-brand-border p-5 flex flex-col gap-3">
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= rating ? 'text-brand-gold' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
    <p className="text-sm text-gray-300 italic leading-relaxed">"{text}"</p>
    <div className="flex items-center justify-between mt-auto">
      <div>
        <p className="text-xs font-semibold text-white">{name}</p>
        <p className="text-xs text-gray-600">{product}</p>
      </div>
      <svg className="w-5 h-5 text-brand-gold opacity-40" fill="currentColor" viewBox="0 0 20 20">
        <path d="M5 13l4 4L19 7"/>
      </svg>
    </div>
  </div>
);

export default function HomePage() {
  return (
    <div className="animate-fade-in">

      {/* HERO */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-brand-black">
        {/* BG image with overlay */}
        <div className="absolute inset-0">
          <img
            src="https://clickraidofficial.com.br/wp-content/uploads/2024/07/AK47-1-scaled.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-transparent" />
        </div>

        {/* Decorative lines */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-brand-gold/20 to-transparent hidden lg:block" style={{right: '33%'}} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Coleção Exclusiva</span>
            </div>

            <h1 className="font-heading text-6xl sm:text-7xl md:text-8xl text-white leading-none tracking-wide mb-6">
              MINIATURAS
              <br />
              <span className="text-gradient-gold">PREMIUM</span>
              <br />
              CHAVEIRO
            </h1>

            <p className="text-gray-400 text-lg mb-4 leading-relaxed max-w-lg">
              As réplicas em miniatura mais detalhadas do mercado.
              Liga metálica, acabamento profissional e fidelidade total ao original.
            </p>

            <div className="space-y-2 mb-8">
              <BulletPoint>Liga de zinco premium com acabamento profissional</BulletPoint>
              <BulletPoint>Escala precisa com detalhes funcionais</BulletPoint>
              <BulletPoint>Entrega para todo o Brasil</BulletPoint>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/produtos" className="btn-primary text-center">
                Ver Coleção Completa
              </Link>
              <Link to="/produtos?badge=hot" className="btn-outline text-center">
                Mais Vendidos
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-brand-border">
              {[
                ['2.500+', 'Clientes Satisfeitos'],
                ['4.8★', 'Avaliação Média'],
                ['100%', 'Satisfação Garantida'],
              ].map(([num, label]) => (
                <div key={label}>
                  <div className="font-heading text-2xl text-brand-gold">{num}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-brand-dark border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-brand-border">
            {[
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
                title: 'ENCOMENDAS',
                text: 'Prazo de produção: 4 dias úteis'
              },
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
                title: 'COMPRA SEGURA',
                text: 'SSL 256-bit e pagamento protegido'
              },
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>,
                title: '30 DIAS',
                text: 'Política de troca e devolução'
              },
              {
                icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm12 6H6a2 2 0 01-2-2v-1h16v1a2 2 0 01-2 2z"/></svg>,
                title: 'PAGAMENTO VIA PIX',
                text: 'Rápido, seguro e sem taxas'
              },
            ].map(({ icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 px-6 py-4">
                <div className="text-brand-gold flex-shrink-0">{icon}</div>
                <div>
                  <p className="text-xs font-bold text-white tracking-widest">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENCOMENDAS BANNER */}
      <section className="py-10 bg-brand-black border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-brand-card border border-brand-gold/30 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-gold/10 border border-brand-gold flex items-center justify-center flex-shrink-0 text-brand-gold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <div>
                <p className="font-heading text-xl text-white tracking-wide">ACEITAMOS ENCOMENDAS</p>
                <p className="text-sm text-gray-400 mt-0.5">Prazo de produção: <span className="text-brand-gold font-semibold">4 dias úteis</span> · Pagamento via PIX · Entrega para todo o Brasil</p>
              </div>
            </div>
            <Link to="/produtos" className="btn-primary whitespace-nowrap flex-shrink-0">
              Fazer Encomenda
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Destaques</span>
            </div>
            <h2 className="section-title">MAIS VENDIDOS</h2>
          </div>
          <Link to="/produtos" className="hidden sm:flex items-center gap-2 text-sm text-gray-400 hover:text-brand-gold transition-colors group">
            Ver todos
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>

        <div className="flex justify-center mt-8 sm:hidden">
          <Link to="/produtos" className="btn-outline">Ver Todos os Produtos</Link>
        </div>
      </section>

      {/* CATEGORY BANNER */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Pistolas', sub: 'Glock, Beretta, Colt...', img: 'https://clickraidofficial.com/cdn/shop/files/31220542097862_1_2feb8307-30a7-4030-b759-0f507346dbee.webp?v=1762707028&width=990', cat: 'pistolas' },
            { label: 'Fuzis', sub: 'AK-47, M4A1, Barrett...', img: 'https://clickraidofficial.com/cdn/shop/files/rozbirnyi-brelok-model-avtomat-ak-47-89969282359534.webp?v=1754416491&width=990', cat: 'fuzis' },
            { label: 'Metralhadoras', sub: 'M134, M249, MGL...', img: 'https://clickraidofficial.com/cdn/shop/files/NEW_11.png?v=1768918266&width=990', cat: 'metralhadoras' },
          ].map(({ label, sub, img, cat }) => (
            <Link
              key={cat}
              to={`/produtos?categoria=${cat}`}
              className="relative group overflow-hidden aspect-[4/3] bg-brand-dark"
            >
              <img src={img} alt={label} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="font-heading text-3xl text-white tracking-wide">{label}</h3>
                <p className="text-xs text-gray-400 mt-1">{sub}</p>
                <div className="flex items-center gap-2 mt-3 text-brand-gold text-xs font-bold uppercase tracking-widest">
                  Ver coleção
                  <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 bg-brand-dark border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Diferenciais</span>
              <div className="h-px w-8 bg-brand-gold" />
            </div>
            <h2 className="section-title">POR QUE ESCOLHER A CLICKRAID?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>}
              title="QUALIDADE PREMIUM"
              text="Liga de zinco de alta qualidade com acabamento que imita o metal real. Cada detalhe é reproduzido com precisão."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
              title="ESCALA PRECISA"
              text="Todas as nossas réplicas são fabricadas em escalas precisas, respeitando as proporções e mecanismos originais."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>}
              title="COLECIONÁVEL"
              text="Itens exclusivos que valorizam ao longo do tempo. Perfeito para colecionadores e entusiastas de armas de fogo."
            />
            <FeatureCard
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>}
              title="ÓTIMO PRESENTE"
              text="Embalagem premium para presentear. Ideal para aniversários, datas especiais e para quem ama o universo militar."
            />
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Coleção</span>
            </div>
            <h2 className="section-title">TODA A COLEÇÃO</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(4, 8).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div className="text-center mt-10">
          <Link to="/produtos" className="btn-primary">
            Ver Todos os Produtos
          </Link>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-20 bg-brand-dark border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-8 bg-brand-gold" />
              <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Avaliações</span>
              <div className="h-px w-8 bg-brand-gold" />
            </div>
            <h2 className="section-title">O QUE NOSSOS CLIENTES DIZEM</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReviewCard
              name="Carlos S."
              product="Glock 17 Chaveiro"
              rating={5}
              text="Qualidade incrível! O peso e o acabamento são excelentes. Parece uma miniatura de verdade. Já comprei mais 3 para presentear amigos."
            />
            <ReviewCard
              name="Rafael M."
              product="AR-15 / M4 Chaveiro"
              rating={5}
              text="Chegou em perfeito estado, embalagem muito bem feita. Os detalhes são impressionantes, a coronha retrátil realmente funciona. Recomendo demais!"
            />
            <ReviewCard
              name="André L."
              product="AK-47 Chaveiro"
              rating={5}
              text="Produto de altíssima qualidade. O madeirado está perfeito, o peso é ideal. Atendimento excelente e entrega dentro do prazo. 10 estrelas!"
            />
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://clickraidofficial.com.br/wp-content/uploads/2024/07/MGL-XL-1-scaled.jpg"
            alt=""
            className="w-full h-full object-cover opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/90 to-brand-black" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-brand-gold text-xs font-bold uppercase tracking-widest mb-4 block">Oferta Exclusiva</span>
          <h2 className="font-heading text-5xl md:text-7xl text-white tracking-wide mb-4">
            FRETE GRÁTIS
          </h2>
          <p className="text-xl text-brand-gold font-heading tracking-widest mb-2">
            EM COMPRAS ACIMA DE R$ 250
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Combine itens e aproveite o frete grátis para todo o Brasil
          </p>
          <Link to="/produtos" className="btn-primary text-base px-10 py-4">
            Aproveitar Agora
          </Link>
        </div>
      </section>

    </div>
  );
}
