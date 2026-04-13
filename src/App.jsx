import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import EncomendaPage from './pages/EncomendaPage';
import PrivacidadePage from './pages/PrivacidadePage';
import TermosPage from './pages/TermosPage';
import TrocasPage from './pages/TrocasPage';
import LoginPage from './pages/LoginPage';
import AccountPage from './pages/AccountPage';
import AdminPage from './pages/AdminPage';
import { fbq, pixelPageView } from './lib/pixel';

// Initialize Facebook Pixel
const PIXEL_ID = import.meta.env.VITE_FB_PIXEL_ID;
if (PIXEL_ID && typeof window !== 'undefined' && window.fbq) {
  window.fbq('init', PIXEL_ID);
}

function ScrollToTopAndPixel() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    pixelPageView();
  }, [pathname]);
  return null;
}

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-brand-black">
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function AdminLayout({ children }) {
  return <div className="min-h-screen bg-brand-black">{children}</div>;
}

function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center animate-fade-in">
      <h1 className="font-heading text-8xl text-brand-gold mb-4">404</h1>
      <p className="text-white text-xl font-heading tracking-wide mb-2">PÁGINA NÃO ENCONTRADA</p>
      <p className="text-gray-500 text-sm mb-8">A página que você procura não existe.</p>
      <a href="/" className="btn-primary">Voltar ao Início</a>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTopAndPixel />
          <Routes>
            {/* Admin — sem Navbar/Footer */}
            <Route path="/admin/*" element={<AdminLayout><AdminPage /></AdminLayout>} />

            {/* Loja */}
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/produtos" element={<ProductsPage />} />
                  <Route path="/produto/:slug" element={<ProductDetailPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/sobre" element={<AboutPage />} />
                  <Route path="/faq" element={<FaqPage />} />
                  <Route path="/encomendas" element={<EncomendaPage />} />
                  <Route path="/privacidade" element={<PrivacidadePage />} />
                  <Route path="/termos" element={<TermosPage />} />
                  <Route path="/trocas" element={<TrocasPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/minha-conta" element={<AccountPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
