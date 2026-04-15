import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token obrigatório' });

  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await sb
    .from('payment_links')
    .select('*')
    .eq('token', token.toUpperCase())
    .single();

  if (error || !data) return res.status(404).json({ error: 'Link não encontrado' });

  if (data.expires_at && new Date(data.expires_at) < new Date() && data.status === 'pending') {
    await sb.from('payment_links').update({ status: 'expired' }).eq('id', data.id);
    return res.status(410).json({ error: 'expired' });
  }

  return res.status(200).json({ success: true, data });
}
