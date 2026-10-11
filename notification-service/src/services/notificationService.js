const { sendEmail } = require("./emailService");

const EVENT_HANDLERS = {
  "payment.created": handlePaymentCreated,
  "payment.completed": handlePaymentCompleted,
  "payment.failed": handlePaymentFailed,
  "payment.refunded": handlePaymentRefunded,
};

async function handleEvent(event) {
  const handler = EVENT_HANDLERS[event.event_type];

  if (!handler) {
    console.warn(`No handler for event type: ${event.event_type}`);
    return;
  }

  return handler(event.data);
}

async function handlePaymentCreated(data) {
  return sendEmail({
    to: data.customer_email,
    subject: `Payment Received — ${formatAmount(data.amount, data.currency)}`,
    html: `
      <h2>Payment Received</h2>
      <p>Hi ${data.customer_name},</p>
      <p>We've received your payment of <strong>${formatAmount(data.amount, data.currency)}</strong> and it's being processed.</p>
      <p>Payment ID: ${data.payment_id}</p>
      <p>We'll notify you once the payment is confirmed.</p>
      <br>
      <p>— BillFlow</p>
    `,
  });
}

async function handlePaymentCompleted(data) {
  return sendEmail({
    to: data.customer_email,
    subject: `Payment Confirmed — ${formatAmount(data.amount, data.currency)}`,
    html: `
      <h2>Payment Confirmed</h2>
      <p>Hi ${data.customer_name},</p>
      <p>Your payment of <strong>${formatAmount(data.amount, data.currency)}</strong> has been successfully processed.</p>
      <p>Payment ID: ${data.payment_id}</p>
      <p>An invoice will be generated shortly.</p>
      <br>
      <p>— BillFlow</p>
    `,
  });
}

async function handlePaymentFailed(data) {
  return sendEmail({
    to: data.customer_email,
    subject: "Payment Failed — Action Required",
    html: `
      <h2>Payment Failed</h2>
      <p>Hi ${data.customer_name},</p>
      <p>Unfortunately, your payment of <strong>${formatAmount(data.amount, data.currency)}</strong> could not be processed.</p>
      <p>Payment ID: ${data.payment_id}</p>
      <p>Please try again or contact support if the issue persists.</p>
      <br>
      <p>— BillFlow</p>
    `,
  });
}

async function handlePaymentRefunded(data) {
  return sendEmail({
    to: data.customer_email,
    subject: `Refund Processed — ${formatAmount(data.amount, data.currency)}`,
    html: `
      <h2>Refund Processed</h2>
      <p>Hi ${data.customer_name},</p>
      <p>Your refund of <strong>${formatAmount(data.amount, data.currency)}</strong> has been processed.</p>
      <p>Payment ID: ${data.payment_id}</p>
      <p>Please allow 5-10 business days for the refund to appear in your account.</p>
      <br>
      <p>— BillFlow</p>
    `,
  });
}

function formatAmount(cents, currency) {
  const amount = (cents / 100).toFixed(2);
  return `${amount} ${currency.toUpperCase()}`;
}

module.exports = { handleEvent };
