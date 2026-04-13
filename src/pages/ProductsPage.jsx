import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';

const sortOptions = [
  { value: 'featured', label: 'Destaques' },
  { value: 'price-asc', label: 'Menor Preço' },
  { value: 'price-desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliados' },
  { value: 'reviews', label: 'Mais Avaliados' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [activeBadge, setActiveBadge] = useState(null);

  const activeCategory = searchParams.get('categoria') || 'todos';
  const searchQuery = searchParams.get('q') || '';

  const setCategory = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'todos') {
      params.delete('categoria');
    } else {
      params.set('categoria', cat);
    }
    params.delete('q');
    setSearchParams(params);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    } else if (activeCategory !== 'todos') {
      result = result.filter(p => p.category === activeCategory);
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1] + 100);

    if (activeBadge) {
      result = result.filter(p => p.badge === activeBadge);
    }

    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'reviews': result.sort((a, b) => b.reviews - a.reviews); break;
      default: break;
    }

    return result;
  }, [activeCategory, searchQuery, sort, priceRange, activeBadge]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8 bg-brand-gold" />
          <span className="text-brand-gold text-xs font-bold uppercase tracking-widest">Loja</span>
        </div>
        <h1 className="section-title">
          {searchQuery ? `Resultados para "${searchQuery}"` : 'NOSSA COLEÇÃO'}
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* Sidebar */}
        <aside className="lg:w-56 flex-shrink-0">
          {/* Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 pb-2 border-b border-brand-border">
              Categorias
            </h3>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-all ${
                    activeCategory === cat.id
                      ? 'bg-brand-gold/10 text-brand-gold border-l-2 border-brand-gold'
                      : 'text-gray-400 hover:text-white hover:bg-brand-card border-l-2 border-transparent'
                  }`}
                >
                  <span className="capitalize">{cat.label}</span>
                  <span className={`text-xs ${activeCategory === cat.id ? 'text-brand-gold' : 'text-gray-600'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 pb-2 border-b border-brand-border">
              Faixa de Preço
            </h3>
            <div className="space-y-2">
              {[
                [0, 80, 'Até R$ 80'],
                [80, 100, 'R$ 80 – R$ 100'],
                [100, 150, 'R$ 100 – R$ 150'],
                [150, 999, 'Acima de R$ 150'],
              ].map(([min, max, label]) => (
                <button
                  key={label}
                  onClick={() => setPriceRange([min, max])}
                  className={`w-full text-left px-3 py-2 text-sm transition-all ${
                    priceRange[0] === min && priceRange[1] === max
                      ? 'text-brand-gold'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => setPriceRange([0, 999])}
                className="w-full text-left px-3 py-2 text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Limpar filtro de preço
              </button>
            </div>
          </div>

          {/* Badges */}
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 pb-2 border-b border-brand-border">
              Destaque
            </h3>
            <div className="space-y-1">
              {[
                { value: 'hot', label: 'Mais Vendidos' },
                { value: 'new', label: 'Novidades' },
                { value: 'sale', label: 'Em Promoção' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveBadge(activeBadge === value ? null : value)}
                  className={`flex items-center gap-2 px-3 py-1.5 w-full text-left rounded transition-colors ${
                    activeBadge === value ? 'bg-brand-gold/10' : 'hover:bg-brand-card'
                  }`}
                >
                  <span className={`badge badge-${value}`}>{label}</span>
                  {activeBadge === value && (
                    <span className="ml-auto text-xs text-brand-gold">✕</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-brand-border">
            <p className="text-sm text-gray-500">
              Mostrando <span className="text-white font-medium">{filteredProducts.length}</span> produtos
            </p>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Ordenar:</label>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-brand-card border border-brand-border text-sm text-white px-3 py-1.5 focus:outline-none focus:border-brand-gold cursor-pointer"
              >
                {sortOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-24">
              <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <p className="text-gray-500 text-lg mb-2">Nenhum produto encontrado</p>
              <p className="text-gray-600 text-sm">Tente ajustar os filtros ou buscar por outro termo</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
