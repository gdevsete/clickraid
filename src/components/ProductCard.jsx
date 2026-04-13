import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../context/CartContext';

const formatPrice = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? 'text-brand-gold' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="group card flex flex-col overflow-hidden hover:border-brand-gold/40 transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-brand-dark aspect-square">
        <img
          src={product.images[hovered && product.images[1] ? 1 : 0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badge */}
        {product.badge && (
          <div className="absolute top-2 left-2">
            <span className={`badge badge-${product.badge}`}>{product.badgeText}</span>
          </div>
        )}
        {/* Discount */}
        {discount && (
          <div className="absolute top-2 right-2">
            <span className="badge bg-brand-red text-white">-{discount}%</span>
          </div>
        )}
        {/* Quick Add overlay */}
        <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 ${hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleAdd}
            className={`w-full py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200 ${
              added
                ? 'bg-brand-olive text-white'
                : 'bg-brand-gold text-brand-black hover:bg-brand-gold-light'
            }`}
          >
            {added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
          </button>
        </div>
        {/* Stock warning */}
        {product.stock <= 5 && (
          <div className="absolute bottom-0 left-0 right-0 bg-brand-red/90 text-white text-center py-1 text-xs font-bold">
            Restam apenas {product.stock} unidades
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 capitalize">{product.category}</p>
        <h3 className="text-sm font-medium text-white group-hover:text-brand-gold transition-colors leading-tight mb-2 flex-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <Stars rating={product.rating} />
          <span className="text-xs text-gray-500">({product.reviews})</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-brand-gold font-bold text-lg">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-600 line-through ml-2">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 flex items-center justify-center transition-all duration-200 ${
              added
                ? 'bg-brand-olive/20 text-brand-olive'
                : 'bg-brand-border text-gray-400 hover:bg-brand-gold hover:text-brand-black'
            }`}
            aria-label="Adicionar ao carrinho"
          >
            {added ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
}
