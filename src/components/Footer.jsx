import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-brand-border mt-20">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-brand-gold flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-brand-black">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                </svg>
              </div>
              <span className="font-heading text-2xl tracking-widest text-white">
                CLICK<span className="text-brand-gold">RAID</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              A maior coleção de miniaturas chaveiro de armas de fogo do Brasil.
              Qualidade premium, detalhes precisos e entrega garantida.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-brand-card border border-brand-border flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-brand-card border border-brand-border flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="#" className="w-9 h-9 bg-brand-card border border-brand-border flex items-center justify-center text-gray-400 hover:text-brand-gold hover:border-brand-gold transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
                  <path d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-lg tracking-widest text-white mb-4">Produtos</h4>
            <ul className="space-y-2">
              {[
                ['Pistolas', '/produtos?categoria=pistolas'],
                ['Fuzis', '/produtos?categoria=fuzis'],
                ['Submetralhadoras', '/produtos?categoria=submetralhadoras'],
                ['Escopetas', '/produtos?categoria=escopetas'],
                ['Todos os Produtos', '/produtos'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-500 hover:text-brand-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg tracking-widest text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              {[
                ['Sobre Nós', '/sobre'],
                ['Blog', '/blog'],
                ['Contato', '/contato'],
                ['Perguntas Frequentes', '/faq'],
                ['Avaliações', '/avaliacoes'],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-500 hover:text-brand-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg tracking-widest text-white mb-4">Atendimento</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                contato@clickraid.com.br
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Seg–Sex: 9h às 18h
              </li>
            </ul>

            <div className="mt-6">
              <h5 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Newsletter</h5>
              <form className="flex gap-0" onSubmit={e => e.preventDefault()}>
                <input
                  type="email"
                  placeholder="Seu e-mail"
                  className="flex-1 bg-brand-card border border-brand-border border-r-0 px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-brand-gold"
                />
                <button className="bg-brand-gold text-brand-black px-3 py-2 text-xs font-bold uppercase hover:bg-brand-gold-light transition-colors">
                  OK
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} ClickRaid. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link to="/privacidade" className="hover:text-gray-400 transition-colors">Privacidade</Link>
            <Link to="/termos" className="hover:text-gray-400 transition-colors">Termos</Link>
            <Link to="/trocas" className="hover:text-gray-400 transition-colors">Trocas</Link>
          </div>
          <div className="flex items-center">
            {/* PIX logo — SVG, transparent background */}
            <svg viewBox="0 0 158 52" className="h-10 w-auto" xmlns="http://www.w3.org/2000/svg" aria-label="PIX">
              {/* Key icon: 4 rounded rhombuses */}
              <g transform="translate(26,26) rotate(45)">
                <rect x="-22" y="-22" width="17" height="17" rx="3.5" fill="#32BCAD"/>
                <rect x="5"   y="-22" width="17" height="17" rx="3.5" fill="#32BCAD"/>
                <rect x="-22" y="5"   width="17" height="17" rx="3.5" fill="#32BCAD"/>
                <rect x="5"   y="5"   width="17" height="17" rx="3.5" fill="#32BCAD"/>
              </g>
              {/* "Pix" wordmark */}
              <text
                x="58" y="34"
                fontFamily="'Arial Rounded MT Bold', Arial, sans-serif"
                fontSize="26"
                fontWeight="900"
                fill="#32BCAD"
                letterSpacing="-0.5"
              >Pix</text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
