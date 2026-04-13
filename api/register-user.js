import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ success: false, message: 'Supabase not configured' });
  }

  const { email, name, transactionId, orderItems, total } = req.body;

  if (!email || !name) {
    return res.status(400).json({ success: false, message: 'email e name são obrigatórios' });
  }

  // Admin client — never expose service role key on frontend
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Invite user — Supabase sends an email with a "Set your password" link
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name: name },
      redirectTo: 'https://clickraidofc.com.br/minha-conta',
    });

    if (inviteError && inviteError.message !== 'User already registered') {
      throw inviteError;
    }

    const userId = inviteData?.user?.id;

    // Save order to orders table (if user exists/was created)
    if (userId && transactionId) {
      await supabase.from('orders').upsert({
        user_id: userId,
        transaction_id: transactionId,
        items: orderItems || [],
        amount: Math.round(total * 100),
        status: 'paid',
        created_at: new Date().toISOString(),
      }, { onConflict: 'transaction_id' });
    }

    const alreadyExists = inviteError?.message === 'User already registered';
    return res.status(200).json({
      success: true,
      alreadyExists,
      message: alreadyExists
        ? 'Conta já existe. Faça login para ver seus pedidos.'
        : 'Convite enviado! Verifique seu e-mail para criar sua senha.',
    });
  } catch (error) {
    console.error('[register-user] Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Erro ao criar conta' });
  }
}
