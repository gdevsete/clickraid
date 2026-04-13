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

  switch (payload.event) {
    case 'transaction.created':
      console.log(`[Webhook] CREATED: ${payload.transactionId}`);
      break;

    case 'transaction.paid':
      console.log(`[Webhook] PAID: ${payload.transactionId} | ref: ${payload.externalReference} | R$${(payload.amount / 100).toFixed(2)}`);
      // Aqui você pode integrar com seu banco de dados, enviar e-mail de confirmação, etc.
      break;

    case 'transaction.failed':
      console.log(`[Webhook] FAILED: ${payload.transactionId} | reason: ${payload.reason}`);
      break;

    default:
      console.log(`[Webhook] Unknown event: ${payload.event}`);
  }

  return res.status(200).json({ received: true });
}
