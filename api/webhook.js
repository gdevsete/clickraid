import { createClient } from '@supabase/supabase-js';

function sbAdmin() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ received: false });
  }

  const payload = req.body;

  console.log('[Webhook] Event received:', JSON.stringify({
    event: payload.event,
    transactionId: payload.transactionId,
    externalReference: payload.externalReference,
    status: payload.status,
    amount: payload.amount,
    paidAt: payload.paidAt,
    customer: payload.customer,
    timestamp: payload.timestamp,
  }));

  const sb = sbAdmin();
  const transactionId = payload.transactionId;
  const customer = payload.customer || {};

  const customerData = {
    name: customer.name || customer.nome || null,
    email: customer.email || null,
    phone: customer.phone || customer.telefone || null,
    cpf: customer.document?.number || customer.cpf || null,
    address: payload.shipping ? {
      rua: payload.shipping.street || payload.shipping.rua,
      numero: payload.shipping.number || payload.shipping.numero,
      complemento: payload.shipping.complement || payload.shipping.complemento,
      bairro: payload.shipping.neighborhood || payload.shipping.bairro,
      cidade: payload.shipping.city || payload.shipping.cidade,
      estado: payload.shipping.state || payload.shipping.estado,
      cep: payload.shipping.zipCode || payload.shipping.cep,
    } : null,
  };

  const orderItems = (payload.items || []).map(i => ({
    name: i.title || i.name,
    price: (i.unitPrice || i.price || 0) / 100,
    quantity: i.quantity || 1,
  }));

  switch (payload.event) {
    case 'transaction.created':
      console.log(`[Webhook] CREATED: ${transactionId}`);
      if (transactionId) {
        await sb.from('orders').upsert({
          transaction_id: transactionId,
          items: orderItems,
          amount: payload.amount || 0,
          status: 'pending',
          customer_data: customerData,
          created_at: payload.timestamp || new Date().toISOString(),
        }, { onConflict: 'transaction_id', ignoreDuplicates: true });
      }
      break;

    case 'transaction.paid':
      console.log(`[Webhook] PAID: ${transactionId} | ref: ${payload.externalReference} | R$${((payload.amount || 0) / 100).toFixed(2)}`);
      if (transactionId) {
        // Try to update existing order first
        const { data: existing } = await sb
          .from('orders')
          .select('id, user_id, customer_data')
          .eq('transaction_id', transactionId)
          .maybeSingle();

        if (existing) {
          // Preserve existing customer_data (has real CPF/CUIT from checkout)
          const update = { status: 'paid' };
          if (!existing.customer_data) update.customer_data = customerData;
          await sb.from('orders').update(update).eq('transaction_id', transactionId);
        } else {
          await sb.from('orders').insert({
            transaction_id: transactionId,
            items: orderItems,
            amount: payload.amount || 0,
            status: 'paid',
            customer_data: customerData,
            created_at: payload.timestamp || new Date().toISOString(),
          });
        }
      }
      break;

    case 'transaction.failed':
    case 'transaction.expired':
      console.log(`[Webhook] ${payload.event.toUpperCase()}: ${transactionId}`);
      if (transactionId) {
        await sb.from('orders')
          .update({ status: 'cancelled' })
          .eq('transaction_id', transactionId);
      }
      break;

    default:
      console.log(`[Webhook] Unknown event: ${payload.event}`);
  }

  return res.status(200).json({ received: true });
}
