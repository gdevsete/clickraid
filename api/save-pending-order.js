import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { transactionId, items, amount, customerData } = req.body;
  if (!transactionId) return res.status(400).json({ error: 'transactionId obrigatório' });

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await sb.from('orders').upsert({
    transaction_id: transactionId,
    items: items || [],
    amount: Math.round((amount || 0) * 100),
    status: 'pending',
    customer_data: customerData || null,
    created_at: new Date().toISOString(),
  }, { onConflict: 'transaction_id' });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
}
