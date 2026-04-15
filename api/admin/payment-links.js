import { adminClient, requireAdmin } from './_auth.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  const sb = adminClient();
  const admin = await requireAdmin(req, sb);
  if (!admin) return res.status(403).json({ error: 'Acesso negado' });

  // GET — list all links
  if (req.method === 'GET') {
    const { data, error } = await sb
      .from('payment_links')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data: data || [] });
  }

  // POST — create new link
  if (req.method === 'POST') {
    const { customerName, customerEmail, customerPhone, items, discountPct = 0, expiresInHours = 48 } = req.body;

    if (!customerName || !items?.length) {
      return res.status(400).json({ error: 'Nome e ao menos 1 produto são obrigatórios' });
    }

    const token = crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();

    const { data, error } = await sb
      .from('payment_links')
      .insert({
        token,
        customer_name: customerName,
        customer_email: customerEmail || null,
        customer_phone: customerPhone || null,
        items,
        discount_pct: discountPct,
        status: 'pending',
        created_by: admin.id,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true, data, token });
  }

  // PATCH — update status
  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    const valid = ['pending', 'paid', 'cancelled', 'expired'];
    if (!id || !valid.includes(status)) {
      return res.status(400).json({ error: 'id e status válido são obrigatórios' });
    }
    const { error } = await sb.from('payment_links').update({ status }).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  // DELETE — remove link
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id obrigatório' });
    const { error } = await sb.from('payment_links').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).end();
}
