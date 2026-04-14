import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { products as catalogProducts } from '../data/products';

const BUYERS = [
  { name: 'Lucas S***', city: 'São Paulo', state: 'SP' },
  { name: 'Matheus O***', city: 'Rio de Janeiro', state: 'RJ' },
  { name: 'Gabriel F***', city: 'Belo Horizonte', state: 'MG' },
  { name: 'Felipe R***', city: 'Curitiba', state: 'PR' },
  { name: 'Rafael M***', city: 'Porto Alegre', state: 'RS' },
  { name: 'Bruno C***', city: 'Salvador', state: 'BA' },
  { name: 'Diego A***', city: 'Fortaleza', state: 'CE' },
  { name: 'Thiago N***', city: 'Manaus', state: 'AM' },
  { name: 'Rodrigo L***', city: 'Brasília', state: 'DF' },
  { name: 'André P***', city: 'Recife', state: 'PE' },
  { name: 'Carlos E***', city: 'Goiânia', state: 'GO' },
  { name: 'Vitor H***', city: 'Florianópolis', state: 'SC' },
  { name: 'Gustavo T***', city: 'Campinas', state: 'SP' },
  { name: 'Leonardo B***', city: 'Santos', state: 'SP' },
  { name: 'Marcelo V***', city: 'Natal', state: 'RN' },
  { name: 'Eduardo K***', city: 'Campo Grande', state: 'MS' },
  { name: 'Daniel W***', city: 'Belém', state: 'PA' },
  { name: 'Ricardo G***', city: 'Maceió', state: 'AL' },
  { name: 'Pedro H***', city: 'João Pessoa', state: 'PB' },
  { name: 'Alexandre M***', city: 'São Luís', state: 'MA' },
  { name: 'Jonathan S***', city: 'Vitória', state: 'ES' },
  { name: 'Caio R***', city: 'Uberlândia', state: 'MG' },
  { name: 'Fábio L***', city: 'Ribeirão Preto', state: 'SP' },
  { name: 'Henrique D***', city: 'São José', state: 'SC' },
  { name: 'Igor A***', city: 'Londrina', state: 'PR' },
];

// Build product list from catalog (exclude accessories, use real images/slugs)
const PRODUCTS = catalogProducts
  .filter(p => p.category !== 'acessorios')
  .map(p => ({
    name: p.shortName || p.name,
    slug: p.slug,
    image: p.images?.[0] || '',
  }));

const TIMES = [
  'agora mesmo',
  'há 1 min',
  'há 2 min',
  'há 3 min',
  'há 5 min',
  'há 7 min',
  'há 9 min',
  'há 11 min',
  'há 14 min',
];

// How many people are "viewing" — randomized per session
const VIEWERS = Math.floor(Math.random() * 18) + 7; // 7–24

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildNotification() {
  const buyer = randomItem(BUYERS);
  const product = randomItem(PRODUCTS);
  const time = randomItem(TIMES);
  const todayCount = Math.floor(Math.random() * 12) + 4;
  return { buyer, product, time, todayCount, id: Date.now() + Math.random() };
}

export default function SocialProof() {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);
  const [viewers, setViewers] = useState(VIEWERS);
  const timerRef = useRef(null);
  const dismissRef = useRef(null);

  const show = () => {
    const notif = buildNotification();
    setNotification(notif);
    setVisible(true);

    // auto-hide after 6s
    clearTimeout(dismissRef.current);
    dismissRef.current = setTimeout(() => {
      setVisible(false);
    }, 6000);
  };

  useEffect(() => {
    // First notification after 4–8s
    const initialDelay = 4000 + Math.random() * 4000;
    timerRef.current = setTimeout(function loop() {
      show();
      // Next one in 15–30s
      const next = 15000 + Math.random() * 15000;
      timerRef.current = setTimeout(loop, next);
    }, initialDelay);

    // Viewer count flickers slightly every 20–40s
    const viewerInterval = setInterval(() => {
      setViewers(v => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(3, Math.min(40, v + delta));
      });
    }, 25000);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(dismissRef.current);
      clearInterval(viewerInterval);
    };
  }, []);

  const dismiss = () => {
    clearTimeout(dismissRef.current);
    setVisible(false);
  };

  return (
    <>
      {/* ── Live viewer badge (bottom-right, always visible) ────────────── */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-brand-card border border-brand-border px-3 py-2 shadow-xl pointer-events-none select-none">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs text-gray-300 font-medium">
          <span className="text-white font-bold">{viewers}</span> pessoas vendo agora
        </span>
      </div>

      {/* ── Purchase notification toast (bottom-left) ───────────────────── */}
      <div
        className={`fixed bottom-5 left-5 z-50 w-72 bg-brand-card border border-brand-border shadow-2xl transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {notification && (
          <div className="relative p-3">
            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-300 transition-colors text-lg leading-none"
              aria-label="fechar"
            >
              ×
            </button>

            <div className="flex gap-3 items-start">
              {/* Product thumbnail */}
              <div className="w-14 h-14 flex-shrink-0 bg-brand-dark overflow-hidden border border-brand-border">
                <img
                  src={notification.product.image}
                  alt={notification.product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              <div className="flex-1 min-w-0 pr-4">
                {/* Header line */}
                <div className="flex items-center gap-1.5 mb-1">
                  <svg className="w-3 h-3 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Compra Confirmada</span>
                </div>

                {/* Who bought */}
                <p className="text-white text-xs font-semibold leading-snug">
                  {notification.buyer.name}{' '}
                  <span className="text-gray-400 font-normal">de</span>{' '}
                  {notification.buyer.city}/{notification.buyer.state}
                </p>

                {/* What they bought */}
                <p className="text-gray-400 text-xs mt-0.5 leading-snug">
                  comprou{' '}
                  <Link
                    to={`/produto/${notification.product.slug}`}
                    className="text-brand-gold hover:underline font-medium"
                  >
                    {notification.product.name}
                  </Link>
                </p>

                {/* Time */}
                <p className="text-gray-600 text-[10px] mt-1">{notification.time}</p>
              </div>
            </div>

            {/* Urgency bar at bottom */}
            <div className="mt-3 pt-2 border-t border-brand-border flex items-center justify-between">
              <span className="text-[10px] text-gray-500">
                🔥 <span className="text-brand-gold font-bold">{notification.todayCount}</span> pessoas compraram hoje
              </span>
              <span className="text-[10px] text-gray-600">{notification.time}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
