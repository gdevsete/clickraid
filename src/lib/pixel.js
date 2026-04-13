// Facebook Pixel event helpers
// Set VITE_FB_PIXEL_ID in Vercel environment variables

export const fbq = (...args) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args);
  }
};

export const pixelPageView = () => fbq('track', 'PageView');

export const pixelViewContent = ({ name, price, category, contentId }) =>
  fbq('track', 'ViewContent', {
    content_name: name,
    content_category: category,
    content_ids: [String(contentId)],
    content_type: 'product',
    value: price,
    currency: 'BRL',
  });

export const pixelAddToCart = ({ name, price, quantity, contentId }) =>
  fbq('track', 'AddToCart', {
    content_name: name,
    content_ids: [String(contentId)],
    content_type: 'product',
    value: price * quantity,
    currency: 'BRL',
    num_items: quantity,
  });

export const pixelInitiateCheckout = ({ total, numItems }) =>
  fbq('track', 'InitiateCheckout', {
    value: total,
    currency: 'BRL',
    num_items: numItems,
  });

export const pixelPurchase = ({ value, transactionId, items }) =>
  fbq('track', 'Purchase', {
    value,
    currency: 'BRL',
    content_type: 'product',
    content_ids: items.map((_, i) => String(i)),
    num_items: items.reduce((s, i) => s + (i.quantity || 1), 0),
    order_id: transactionId,
  });
