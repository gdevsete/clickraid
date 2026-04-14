// Facebook Pixel event helpers
// Pixel ID is set via VITE_FB_PIXEL_ID env variable (Vercel) and initialized in App.jsx

export const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

// ── PageView ─────────────────────────────────────────────────────────────────
// Fired on every route change (App.jsx ScrollToTopAndPixel)
export const pixelPageView = () => fbq('track', 'PageView');

// ── ViewContent ──────────────────────────────────────────────────────────────
// Fired when user opens a product page (ProductDetailPage useEffect)
export const pixelViewContent = ({ name, price, category, contentId }) =>
  fbq('track', 'ViewContent', {
    content_name: name,
    content_category: category,
    content_ids: [String(contentId)],
    content_type: 'product',
    value: price,
    currency: 'BRL',
  });

// ── AddToCart ────────────────────────────────────────────────────────────────
// Fired when user adds item to cart (CartContext.addItem)
export const pixelAddToCart = ({ name, price, quantity, contentId }) =>
  fbq('track', 'AddToCart', {
    content_name: name,
    content_ids: [String(contentId)],
    content_type: 'product',
    value: price * quantity,
    currency: 'BRL',
    num_items: quantity,
  });

// ── InitiateCheckout ─────────────────────────────────────────────────────────
// Fired when user submits Step 1 (dados pessoais) in checkout
export const pixelInitiateCheckout = ({ total, numItems, contentIds = [] }) =>
  fbq('track', 'InitiateCheckout', {
    value: total,
    currency: 'BRL',
    num_items: numItems,
    content_ids: contentIds.map(String),
    content_type: 'product',
  });

// ── AddPaymentInfo ───────────────────────────────────────────────────────────
// Fired when user confirms address (Step 2 → Step 3)
export const pixelAddPaymentInfo = ({ total, contentIds = [] }) =>
  fbq('track', 'AddPaymentInfo', {
    value: total,
    currency: 'BRL',
    content_ids: contentIds.map(String),
    content_type: 'product',
  });

// ── Purchase ─────────────────────────────────────────────────────────────────
// Fired when PIX payment is confirmed (startPolling in CheckoutPage)
// items: [{ id, name, price, quantity }]
export const pixelPurchase = ({ value, transactionId, items }) =>
  fbq('track', 'Purchase', {
    value,
    currency: 'BRL',
    content_type: 'product',
    content_ids: items.map(i => String(i.id)).filter(Boolean),
    num_items: items.reduce((s, i) => s + (i.quantity || 1), 0),
    order_id: transactionId,
  });
