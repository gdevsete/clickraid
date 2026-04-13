import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function CartItem({ item }) {
  const { removeItem, updateQuantity } = useCart();

  return (
    <div className="flex gap-3 py-4 border-b border-brand-border">
      <div className="w-16 h-16 bg-brand-dark flex-shrink-0 overflow-hidden">
        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.shortName || item.name}</p>
        <p className="text-xs text-gray-500 mt-0.5 capitalize">{item.category}</p>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-brand-border">
            <button
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-xs"
            >
              −
            </button>
            <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white transition-colors text-xs"
            >
              +
            </button>
          </div>
          <span className="text-brand-gold font-semibold text-sm">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="text-gray-600 hover:text-brand-red transition-colors flex-shrink-0 mt-1"
        aria-label="Remover"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, subtotal, shipping, total } = useCart();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-brand-dark border-l border-brand-border animate-slide-in-right flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
          <h2 className="font-heading text-xl tracking-widest text-white">
            CARRINHO
            {items.length > 0 && (
              <span className="ml-2 text-sm font-body font-normal text-gray-400">
                ({items.length} {items.length === 1 ? 'item' : 'itens'})
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <svg className="w-16 h-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              <p className="text-gray-500">Seu carrinho está vazio</p>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-outline text-xs py-2 px-4"
              >
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div>
              {items.map(item => <CartItem key={item.id} item={item} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-brand-border px-6 py-4 space-y-3">
            {/* Shipping notice */}
            {shipping === 0 ? (
              <div className="flex items-center gap-2 bg-brand-olive/20 border border-brand-olive/40 px-3 py-2">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
                <span className="text-xs text-brand-gold font-medium">Frete grátis aplicado!</span>
              </div>
            ) : (
              <div className="text-xs text-gray-500 text-center">
                Falta {formatPrice(250 - subtotal)} para frete grátis
                <div className="mt-1 bg-brand-border rounded-full h-1">
                  <div
                    className="bg-brand-gold h-1 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / 250) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Frete</span>
                <span>{shipping === 0 ? <span className="text-brand-gold">Grátis</span> : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-white font-semibold text-base pt-2 border-t border-brand-border">
                <span>Total</span>
                <span className="text-brand-gold">{formatPrice(total)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              onClick={() => setIsOpen(false)}
              className="btn-primary w-full text-center block"
            >
              Finalizar Compra
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-xs text-gray-500 hover:text-gray-300 transition-colors py-1"
            >
              Continuar comprando
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
