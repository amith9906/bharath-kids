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

module.exports = {
  initTwilioClient,
  sendQuotationNotification,
  sendStatusUpdateToCustomer
};
