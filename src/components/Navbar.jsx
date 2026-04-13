import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const NavLinkItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `text-sm font-medium uppercase tracking-widest transition-colors duration-200 ${
        isActive ? 'text-brand-gold' : 'text-gray-300 hover:text-white'
      }`
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { totalItems, setIsOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produtos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-brand-gold text-brand-black text-center py-2 text-xs font-bold uppercase tracking-widest">
        Frete grátis acima de R$ 250 · Pagamento seguro · Suporte 24/7
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-brand-black/95 backdrop-blur-md border-b border-brand-border shadow-2xl'
            : 'bg-brand-black border-b border-brand-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-brand-gold flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-brand-black">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                </svg>
              </div>
              <span className="font-brand text-xl tracking-wider text-white group-hover:text-brand-gold transition-colors">
                CLICK<span className="text-brand-gold">RAID</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6 ml-10">
              <NavLinkItem to="/produtos">Produtos</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=pistolas">Pistolas</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=fuzis">Fuzis</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=metralhadoras">Metralhadoras</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=lancadores">Lançadores</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=acessorios">Acessórios</NavLinkItem>
              <NavLinkItem to="/encomendas">Encomendas</NavLinkItem>
              <NavLinkItem to="/sobre">Sobre</NavLinkItem>
              <NavLinkItem to="/faq">FAQ</NavLinkItem>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Buscar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Carrinho"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce-subtle">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="pb-4 animate-fade-in">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar miniaturas..."
                  autoFocus
                  className="flex-1 bg-brand-card border border-brand-border px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold"
                />
                <button type="submit" className="btn-primary py-2 px-4">
                  Buscar
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-brand-dark border-t border-brand-border animate-fade-in">
            <nav className="flex flex-col px-4 py-4 gap-4">
              <NavLinkItem to="/produtos">Todos os Produtos</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=pistolas">Pistolas</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=fuzis">Fuzis</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=metralhadoras">Metralhadoras</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=lancadores">Lançadores</NavLinkItem>
              <NavLinkItem to="/produtos?categoria=acessorios">Acessórios</NavLinkItem>
              <NavLinkItem to="/encomendas">Encomendas</NavLinkItem>
              <NavLinkItem to="/sobre">Sobre Nós</NavLinkItem>
              <NavLinkItem to="/faq">FAQ</NavLinkItem>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
