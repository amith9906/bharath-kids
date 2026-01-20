const twilio = require('twilio');
require('dotenv').config();

let client = null;

// Initialize Twilio client
const initTwilioClient = () => {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    console.log('Twilio WhatsApp client initialized.');
  } else {
    console.log('Twilio credentials not configured. WhatsApp notifications disabled.');
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Send quotation notification via WhatsApp
const sendQuotationNotification = async (quotation) => {
  if (!client || !process.env.ADMIN_WHATSAPP_NUMBER) {
    console.log('WhatsApp not configured. Skipping notification.');
    return;
  }

  const message = `
🆕 *New Quotation Request*

📋 *Quotation #:* ${quotation.quotationNumber}

👤 *Customer Details:*
• Name: ${quotation.customerName}
• Phone: ${quotation.customerPhone}
• Email: ${quotation.customerEmail}
${quotation.customerCompany ? `• Company: ${quotation.customerCompany}` : ''}

🛒 *Order Summary:*
• Items: ${quotation.items.length}
• Subtotal: ${formatCurrency(quotation.subtotal)}
• Discount: -${formatCurrency(quotation.discountTotal)}
• Tax: ${formatCurrency(quotation.taxTotal)}
• *Grand Total: ${formatCurrency(quotation.grandTotal)}*

📅 Date: ${new Date(quotation.createdAt).toLocaleString('en-IN')}

Please review this quotation in the admin dashboard.
  `.trim();

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: process.env.ADMIN_WHATSAPP_NUMBER
    });
    console.log('WhatsApp notification sent successfully.');
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw error;
  }
};

// Send status update notification to customer (if phone provided)
const sendStatusUpdateToCustomer = async (quotation, customerWhatsappNumber) => {
  if (!client || !customerWhatsappNumber) {
    console.log('WhatsApp not configured or customer number not provided.');
    return;
  }

  const statusMessages = {
    pending: 'is pending review',
    under_review: 'is now under review',
    approved: 'has been approved! 🎉',
    rejected: 'has been rejected',
    converted: 'has been converted to an order! 🎉'
  };

  const message = `
📋 *Quotation Update*

Your quotation #${quotation.quotationNumber} ${statusMessages[quotation.status] || 'status has been updated'}.

*Grand Total:* ${formatCurrency(quotation.grandTotal)}

${quotation.adminNotes ? `*Notes:* ${quotation.adminNotes}` : ''}

Thank you for your business!
  `.trim();

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${customerWhatsappNumber}`
    });
    console.log('Customer WhatsApp notification sent successfully.');
  } catch (error) {
    console.error('Error sending customer WhatsApp notification:', error);
    throw error;
  }
};

// Send finalized quotation to customer via WhatsApp
const sendQuotationToCustomer = async (quotation) => {
  if (!client) {
    console.log('WhatsApp not configured. Skipping quotation send.');
    return;
  }

  const customerPhone = quotation.customerPhone;
  if (!customerPhone) {
    console.log('Customer phone not provided.');
    return;
  }

  // Format phone number for WhatsApp
  let formattedPhone = customerPhone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');
  if (!formattedPhone.startsWith('+')) {
    // Assume Indian number if no country code
    formattedPhone = '+91' + formattedPhone.replace(/^0+/, '');
  }

  const finalTotal = quotation.finalTotal || quotation.grandTotal;

  const itemsList = quotation.items.slice(0, 5).map((item, idx) =>
    `${idx + 1}. ${item.item?.brand ? `${item.item.brand} - ` : ''}${item.itemName} x${item.quantity} - ${formatCurrency(item.totalPrice)}`
  ).join('\n');

  const moreItemsText = quotation.items.length > 5 ? `\n... and ${quotation.items.length - 5} more items` : '';

  const gstDisclaimer = (!quotation.taxTotal && !quotation.adminGstAmount)
    ? '\n⚠️ *Note: This quotation does not include GST. GST will be charged as applicable.*'
    : '';

  const message = `
📋 *Quotation #${quotation.quotationNumber}*

Dear ${quotation.customerName},

Here is your requested quotation:

*Items:*
${itemsList}${moreItemsText}

━━━━━━━━━━━━━━━━
Subtotal: ${formatCurrency(quotation.subtotal)}
${parseFloat(quotation.discountTotal) > 0 ? `Discount: -${formatCurrency(quotation.discountTotal)}\n` : ''}${parseFloat(quotation.taxTotal) > 0 ? `Tax: ${formatCurrency(quotation.taxTotal)}\n` : ''}${quotation.adminPriceAdjustment && parseFloat(quotation.adminPriceAdjustment) !== 0 ? `Adjustment: ${parseFloat(quotation.adminPriceAdjustment) > 0 ? '+' : ''}${formatCurrency(quotation.adminPriceAdjustment)}\n` : ''}${quotation.adminGstAmount && parseFloat(quotation.adminGstAmount) > 0 ? `GST (${quotation.adminGstPercent}%): ${formatCurrency(quotation.adminGstAmount)}\n` : ''}━━━━━━━━━━━━━━━━
*TOTAL: ${formatCurrency(finalTotal)}*
${gstDisclaimer}

${quotation.adminNotes ? `📝 ${quotation.adminNotes}\n` : ''}
Valid for 15 days.

Thank you for your interest! 🙏
  `.trim();

  try {
    await client.messages.create({
      body: message,
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${formattedPhone}`
    });
    console.log('Quotation sent to customer via WhatsApp successfully.');
  } catch (error) {
    console.error('Error sending quotation via WhatsApp:', error);
    throw error;
  }
};

module.exports = {
  initTwilioClient,
  sendQuotationNotification,
  sendStatusUpdateToCustomer,
  sendQuotationToCustomer
};
