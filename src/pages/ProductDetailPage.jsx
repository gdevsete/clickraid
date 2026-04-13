import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { pixelViewContent } from '../lib/pixel';
import ProductCard from '../components/ProductCard';
import { getProductBySlug, getRelatedProducts } from '../data/products';

const formatPrice = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const getYouTubeId = (url) => {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
};

const Stars = ({ rating, reviews }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? 'text-brand-gold' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      ))}
    </div>
    <span className="text-sm text-brand-gold font-semibold">{rating}</span>
    <span className="text-sm text-gray-500">({reviews} avaliações)</span>
  </div>
);

export default function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [videoActive, setVideoActive] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('descricao');
  const [lightbox, setLightbox] = useState(null); // { photos: [], index: 0 }

  const product = getProductBySlug(slug);

  useEffect(() => {
    if (product) pixelViewContent({ name: product.name, price: product.price, category: product.category, contentId: product.id });
  }, [product?.id]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="section-title mb-4">Produto não encontrado</h2>
        <Link to="/produtos" className="btn-primary">Ver Todos os Produtos</Link>
      </div>
    );
  }

  const related = getRelatedProducts(product);
  const videoId = getYouTubeId(product.video);

  // Imagens ativas: imagens da variante primeiro, depois todas as imagens gerais do produto
  const activeVariant = selectedVariant ?? (product.variants?.[0] ?? null);
  const variantImages = activeVariant?.images ?? [];
  const generalImages = product.images ?? [];
  // Deduplica: imagens gerais que já estão na variante não aparecem duas vezes
  const extraImages = generalImages.filter(img => !variantImages.includes(img));
  const activeImages = product.variants?.length
    ? [...variantImages, ...extraImages]
    : generalImages;

  // Todos os vídeos: vídeo principal + extraVideos
  const allVideoIds = [
    ...(videoId ? [{ id: videoId, label: 'Vídeo 1' }] : []),
    ...(product.extraVideos ?? []).map((url, i) => {
      const id = getYouTubeId(url);
      return id ? { id, label: `Vídeo ${i + 2}` } : null;
    }).filter(Boolean),
  ];
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedImage(0);
    setVideoActive(false);
  };
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-3xl w-full mx-4" onClick={e => e.stopPropagation()}>
            {/* Imagem principal */}
            <img
              src={lightbox.photos[lightbox.index]}
              alt=""
              className="w-full max-h-[80vh] object-contain"
            />
            {/* Fechar */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-black/60 flex items-center justify-center text-white hover:text-brand-gold transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
            {/* Setas */}
            {lightbox.photos.length > 1 && (
              <>
                <button
                  onClick={() => setLightbox(lb => ({ ...lb, index: (lb.index - 1 + lb.photos.length) % lb.photos.length }))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 flex items-center justify-center text-white hover:text-brand-gold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
                  </svg>
                </button>
                <button
                  onClick={() => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.photos.length }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/60 flex items-center justify-center text-white hover:text-brand-gold transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </>
            )}
            {/* Miniaturas do lightbox */}
            {lightbox.photos.length > 1 && (
              <div className="flex justify-center gap-2 mt-3">
                {lightbox.photos.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox(lb => ({ ...lb, index: i }))}
                    className={`w-12 h-12 overflow-hidden border-2 transition-all ${lightbox.index === i ? 'border-brand-gold' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Contador */}
            <p className="text-center text-xs text-gray-500 mt-2">
              {lightbox.index + 1} / {lightbox.photos.length}
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
        <Link to="/" className="hover:text-brand-gold transition-colors">Início</Link>
        <span>/</span>
        <Link to="/produtos" className="hover:text-brand-gold transition-colors">Produtos</Link>
        <span>/</span>
        <Link to={`/produtos?categoria=${product.category}`} className="hover:text-brand-gold transition-colors capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-400">{product.shortName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">

        {/* Galeria */}
        <div className="space-y-4">
          {/* Exibição principal */}
          <div className="relative aspect-square bg-brand-dark border border-brand-border overflow-hidden">
            {videoActive && allVideoIds.length > 0 ? (
              <iframe
                src={`https://www.youtube.com/embed/${allVideoIds[activeVideoIndex].id}?autoplay=1&rel=0`}
                title={allVideoIds[activeVideoIndex].label}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            ) : (
              <img
                src={activeImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
            {!videoActive && product.badge && (
              <div className="absolute top-4 left-4">
                <span className={`badge badge-${product.badge} text-sm px-3 py-1`}>{product.badgeText}</span>
              </div>
            )}
            {!videoActive && discount && (
              <div className="absolute top-4 right-4">
                <span className="badge bg-brand-red text-white text-sm px-3 py-1">-{discount}%</span>
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {(activeImages.length > 1 || videoId) && (
            <div className="flex gap-2 flex-wrap">
              {activeImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => { setSelectedImage(i); setVideoActive(false); }}
                  className={`w-20 h-20 border-2 overflow-hidden transition-all flex-shrink-0 ${
                    !videoActive && selectedImage === i
                      ? 'border-brand-gold'
                      : 'border-brand-border hover:border-gray-500'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}

              {/* Thumbnails dos vídeos */}
              {allVideoIds.map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => { setVideoActive(true); setActiveVideoIndex(i); }}
                  className={`w-20 h-20 border-2 overflow-hidden transition-all flex-shrink-0 relative ${
                    videoActive && activeVideoIndex === i ? 'border-brand-gold' : 'border-brand-border hover:border-gray-500'
                  }`}
                  title={v.label}
                >
                  <img
                    src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`}
                    alt={v.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="w-7 h-7 bg-brand-gold rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-brand-black fill-current ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  {allVideoIds.length > 1 && (
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1 font-bold">
                      {i + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 capitalize">{product.category}</p>
          <h1 className="font-heading text-4xl text-white tracking-wide mb-4">{product.name}</h1>

          <Stars rating={product.rating} reviews={product.reviews} />

          {/* Seletor de cores / variantes */}
          {product.variants?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Cor: <span className="text-white normal-case tracking-normal font-semibold">
                  {activeVariant?.label}
                </span>
              </p>
              <div className="flex items-center gap-3">
                {product.variants.map((variant) => {
                  const isSelected = activeVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantSelect(variant)}
                      title={variant.label}
                      className={`group flex flex-col items-center gap-1.5 transition-all`}
                    >
                      {/* Círculo de cor */}
                      <span
                        className={`w-8 h-8 rounded-full border-2 transition-all block ${
                          isSelected
                            ? 'border-brand-gold scale-110 shadow-[0_0_0_2px_rgba(201,168,76,0.3)]'
                            : 'border-brand-border hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: variant.swatch }}
                      />
                      {/* Label */}
                      <span className={`text-[10px] font-medium uppercase tracking-wider transition-colors ${
                        isSelected ? 'text-brand-gold' : 'text-gray-500 group-hover:text-gray-300'
                      }`}>
                        {variant.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-end gap-3">
            <span className="font-heading text-4xl text-brand-gold">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-lg text-gray-600 line-through mb-1">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <p className="text-xs text-green-400 mt-1 font-medium">
            5% de desconto pagando via PIX
          </p>

          {/* Stock */}
          <div className="mt-4 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${product.stock > 5 ? 'bg-green-500' : 'bg-brand-red'}`} />
            <span className={`text-sm ${product.stock > 5 ? 'text-green-400' : 'text-brand-red'}`}>
              {product.stock > 5 ? `Em estoque (${product.stock} unidades)` : `Restam ${product.stock} unidades!`}
            </span>
          </div>

          {/* Quantity */}
          <div className="mt-6">
            <label className="text-xs font-bold text-white uppercase tracking-widest mb-3 block">Quantidade</label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-brand-border">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-card transition-all"
                >
                  −
                </button>
                <span className="w-12 text-center text-white font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-brand-card transition-all"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Total: <span className="text-brand-gold font-semibold">{formatPrice(product.price * quantity)}</span>
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAdd}
              className={`flex-1 py-4 font-bold uppercase tracking-widest text-sm transition-all duration-200 active:scale-95 ${
                added
                  ? 'bg-brand-olive text-white'
                  : 'bg-brand-gold text-brand-black hover:bg-brand-gold-light'
              }`}
            >
              {added ? '✓ Adicionado ao Carrinho!' : 'Adicionar ao Carrinho'}
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 py-4 font-bold uppercase tracking-widest text-sm border-2 border-white text-white hover:bg-white hover:text-brand-black transition-all duration-200 active:scale-95"
            >
              Comprar Agora
            </button>
          </div>

          {/* Shipping info */}
          <div className="mt-6 p-4 bg-brand-card border border-brand-border space-y-2">
            {[
              ['Frete grátis acima de R$ 250', 'text-brand-gold'],
              ['Entrega em até 7 dias úteis', 'text-gray-400'],
              ['Troca gratuita em 30 dias', 'text-gray-400'],
              ['Aceitamos encomendas — prazo de produção: 4 dias', 'text-brand-gold'],
            ].map(([text, color]) => (
              <div key={text} className="flex items-center gap-2">
                <svg className={`w-4 h-4 flex-shrink-0 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                <span className={`text-xs ${color}`}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex border-b border-brand-border">
          {[
            { id: 'descricao', label: 'Descrição' },
            { id: 'especificacoes', label: 'Especificações' },
            { id: 'avaliacoes', label: `Avaliações (${product.reviews})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium uppercase tracking-wider transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-brand-gold border-brand-gold'
                  : 'text-gray-500 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === 'descricao' && (
            <div className="max-w-2xl space-y-6">
              {/* Highlights */}
              {product.highlights?.length > 0 && (
                <div className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 bg-brand-card border border-brand-border px-4 py-3">
                      <span className="text-base leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              )}
              {/* Descrição — parágrafos separados por \n\n */}
              <div className="space-y-4">
                {product.description.split('\n\n').map((para, i) => (
                  <p key={i} className="text-gray-300 leading-relaxed">{para}</p>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'especificacoes' && (
            <div className="max-w-lg">
              <div className="space-y-0">
                {product.features.map((f, i) => (
                  <div key={i} className={`flex justify-between items-center py-3 ${i !== product.features.length - 1 ? 'border-b border-brand-border' : ''}`}>
                    <span className="text-sm text-gray-500 uppercase tracking-wider">{f.label}</span>
                    <span className="text-sm text-white font-medium text-right">{f.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'avaliacoes' && (
            <div className="space-y-6 max-w-2xl">

              {/* Resumo de notas */}
              <div className="flex items-center gap-4 p-6 bg-brand-card border border-brand-border">
                <div className="text-center">
                  <div className="font-heading text-6xl text-brand-gold">{product.rating}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{product.reviews} avaliações</p>
                </div>
                <div className="flex-1 space-y-1">
                  {[5,4,3,2,1].map(star => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{star}</span>
                      <div className="flex-1 bg-brand-border h-1.5">
                        <div className="bg-brand-gold h-1.5" style={{ width: `${
                          product.ratingBreakdown
                            ? (product.ratingBreakdown[star] ?? 0)
                            : star === 5 ? 80 : star === 4 ? 15 : 5
                        }%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fotos dos clientes */}
              {product.customerPhotos?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Fotos dos clientes
                    <span className="ml-2 text-gray-600 font-normal normal-case tracking-normal">({product.customerPhotos.length})</span>
                  </p>
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {product.customerPhotos.map((photo, i) => (
                      <button
                        key={i}
                        onClick={() => setLightbox({ photos: product.customerPhotos, index: i })}
                        className="w-20 h-20 flex-shrink-0 border border-brand-border overflow-hidden hover:border-brand-gold transition-all relative group"
                      >
                        <img src={photo} alt={`Foto cliente ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews individuais */}
              {(product.reviewsList ?? [
                { name: 'Carlos S.', text: 'Qualidade incrível! O peso e o acabamento são excelentes.', date: '10/03/2026', rating: 5, photos: [] },
                { name: 'Rafael M.', text: 'Chegou em perfeito estado. Os detalhes são impressionantes!', date: '05/03/2026', rating: 5, photos: [] },
                { name: 'André L.', text: 'Produto de altíssima qualidade. Muito recomendo!', date: '28/02/2026', rating: 5, photos: [] },
              ]).map((r, idx) => (
                <div key={idx} className="p-4 bg-brand-card border border-brand-border space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-border rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {r.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{r.name}</span>
                      <span className="badge badge-new text-xs">Compra Verificada</span>
                    </div>
                    <span className="text-xs text-gray-600">{r.date}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} className={`w-3 h-3 ${s <= (r.rating ?? 5) ? 'text-brand-gold' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{r.text}</p>
                  {/* Fotos desta review */}
                  {r.photos?.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {r.photos.map((photo, pi) => (
                        <button
                          key={pi}
                          onClick={() => setLightbox({ photos: r.photos, index: pi })}
                          className="w-16 h-16 border border-brand-border overflow-hidden hover:border-brand-gold transition-all relative group"
                        >
                          <img src={photo} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-brand-gold" />
            <h2 className="section-title text-3xl">PRODUTOS RELACIONADOS</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
