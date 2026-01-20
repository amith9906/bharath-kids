const { transporter } = require('../config/email');
require('dotenv').config();

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Send quotation notification to admin
const sendQuotationNotificationToAdmin = async (quotation) => {
  if (!process.env.SMTP_USER || !process.env.ADMIN_EMAIL) {
    console.log('Email not configured. Skipping admin notification.');
    return;
  }

  const itemsHtml = quotation.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.itemName}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .info-box { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #4F46E5; color: white; padding: 10px; }
        .total-row { font-weight: bold; background: #f0f0f0; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Quotation Request</h1>
          <p>Quotation #${quotation.quotationNumber}</p>
        </div>

        <div class="content">
          <div class="info-box">
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> ${quotation.customerName}</p>
            <p><strong>Email:</strong> ${quotation.customerEmail}</p>
            <p><strong>Phone:</strong> ${quotation.customerPhone}</p>
            ${quotation.customerCompany ? `<p><strong>Company:</strong> ${quotation.customerCompany}</p>` : ''}
            ${quotation.customerAddress ? `<p><strong>Address:</strong> ${quotation.customerAddress}</p>` : ''}
          </div>

          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Discount:</td>
                <td style="padding: 10px; text-align: right;">-${formatCurrency(quotation.discountTotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Tax:</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.taxTotal)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="padding: 10px; text-align: right; font-size: 18px;">Grand Total:</td>
                <td style="padding: 10px; text-align: right; font-size: 18px;">${formatCurrency(quotation.grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          ${quotation.notes ? `
            <div class="info-box">
              <h3>Customer Notes</h3>
              <p>${quotation.notes}</p>
            </div>
          ` : ''}

          <p><strong>Date:</strong> ${formatDate(quotation.createdAt)}</p>
        </div>

        <div class="footer">
          <p>Please review this quotation in the admin dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New Quotation Request #${quotation.quotationNumber} - ${formatCurrency(quotation.grandTotal)}`,
      html
    });
    console.log('Admin notification email sent successfully.');
  } catch (error) {
    console.error('Error sending admin email:', error);
    throw error;
  }
};

// Send confirmation email to customer
const sendQuotationConfirmationToCustomer = async (quotation) => {
  if (!process.env.SMTP_USER) {
    console.log('Email not configured. Skipping customer confirmation.');
    return;
  }

  const itemsHtml = quotation.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.itemName}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #4F46E5; color: white; padding: 10px; }
        .total-row { font-weight: bold; background: #f0f0f0; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .highlight { background: #E0E7FF; padding: 15px; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Quotation Confirmation</h1>
          <p>Thank you for your request!</p>
        </div>

        <div class="content">
          <p>Dear ${quotation.customerName},</p>

          <p>Thank you for submitting your quotation request. We have received your inquiry and our team will review it shortly.</p>

          <div class="highlight">
            <p><strong>Quotation Number:</strong> ${quotation.quotationNumber}</p>
            <p><strong>Status:</strong> Pending Review</p>
          </div>

          <h3>Order Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Discount:</td>
                <td style="padding: 10px; text-align: right;">-${formatCurrency(quotation.discountTotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Tax:</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.taxTotal)}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="padding: 10px; text-align: right; font-size: 18px;">Grand Total:</td>
                <td style="padding: 10px; text-align: right; font-size: 18px;">${formatCurrency(quotation.grandTotal)}</td>
              </tr>
            </tbody>
          </table>

          <p>We will get back to you within 24-48 business hours with a formal quotation.</p>

          <p>If you have any questions, please don't hesitate to contact us.</p>
        </div>

        <div class="footer">
          <p>Thank you for choosing us!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: quotation.customerEmail,
      subject: `Quotation Confirmation - #${quotation.quotationNumber}`,
      html
    });
    console.log('Customer confirmation email sent successfully.');
  } catch (error) {
    console.error('Error sending customer email:', error);
    throw error;
  }
};

// Send finalized quotation to customer with PDF attachment
const sendQuotationToCustomerWithPDF = async (quotation) => {
  if (!process.env.SMTP_USER) {
    console.log('Email not configured. Skipping send quotation to customer.');
    return;
  }

  const path = require('path');
  const fs = require('fs');

  const finalTotal = quotation.finalTotal || quotation.grandTotal;

  const itemsHtml = quotation.items.map(item => `
    <tr>
      <td style="padding: 10px; border: 1px solid #ddd;">${item.item?.brand ? `${item.item.brand} - ` : ''}${item.itemName}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(item.totalPrice)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #4F46E5; color: white; padding: 10px; }
        .total-row { font-weight: bold; background: #f0f0f0; }
        .footer { text-align: center; padding: 20px; color: #666; }
        .highlight { background: #E0E7FF; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .gst-disclaimer { color: #DC2626; font-weight: bold; padding: 10px; background: #FEE2E2; border-radius: 5px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Quotation</h1>
          <p>Quotation #${quotation.quotationNumber}</p>
        </div>

        <div class="content">
          <p>Dear ${quotation.customerName},</p>

          <p>Please find attached your quotation as requested. Below is a summary of your quote.</p>

          <div class="highlight">
            <p><strong>Quotation Number:</strong> ${quotation.quotationNumber}</p>
            <p><strong>Date:</strong> ${formatDate(quotation.createdAt)}</p>
            <p><strong>Status:</strong> ${quotation.status.replace('_', ' ').toUpperCase()}</p>
          </div>

          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr class="total-row">
                <td colspan="3" style="padding: 10px; text-align: right;">Subtotal:</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.subtotal)}</td>
              </tr>
              ${parseFloat(quotation.discountTotal) > 0 ? `
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Discount:</td>
                <td style="padding: 10px; text-align: right;">-${formatCurrency(quotation.discountTotal)}</td>
              </tr>
              ` : ''}
              ${parseFloat(quotation.taxTotal) > 0 ? `
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Tax:</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.taxTotal)}</td>
              </tr>
              ` : ''}
              ${quotation.adminPriceAdjustment && parseFloat(quotation.adminPriceAdjustment) !== 0 ? `
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">Price Adjustment:</td>
                <td style="padding: 10px; text-align: right;">${parseFloat(quotation.adminPriceAdjustment) > 0 ? '+' : ''}${formatCurrency(quotation.adminPriceAdjustment)}</td>
              </tr>
              ` : ''}
              ${quotation.adminGstAmount && parseFloat(quotation.adminGstAmount) > 0 ? `
              <tr>
                <td colspan="3" style="padding: 10px; text-align: right;">GST (${quotation.adminGstPercent}%):</td>
                <td style="padding: 10px; text-align: right;">${formatCurrency(quotation.adminGstAmount)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td colspan="3" style="padding: 10px; text-align: right; font-size: 18px;">Grand Total:</td>
                <td style="padding: 10px; text-align: right; font-size: 18px;">${formatCurrency(finalTotal)}</td>
              </tr>
            </tbody>
          </table>

          ${!quotation.taxTotal && !quotation.adminGstAmount ? `
          <div class="gst-disclaimer">
            * This quotation does not include GST. GST will be charged as applicable.
          </div>
          ` : ''}

          ${quotation.adminNotes ? `
          <div style="background: #FFF3CD; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong>Note:</strong> ${quotation.adminNotes}
          </div>
          ` : ''}

          <p>This quotation is valid for 15 days from the date of issue.</p>

          <p>If you have any questions or would like to proceed with this quote, please don't hesitate to contact us.</p>
        </div>

        <div class="footer">
          <p>Thank you for your interest!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Prepare attachments
  const attachments = [];
  if (quotation.pdfUrl) {
    const pdfPath = path.join(__dirname, '../../', quotation.pdfUrl);
    if (fs.existsSync(pdfPath)) {
      attachments.push({
        filename: `Quotation_${quotation.quotationNumber.replace(/\//g, '-')}.pdf`,
        path: pdfPath
      });
    }
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: quotation.customerEmail,
      subject: `Your Quotation #${quotation.quotationNumber} - ${formatCurrency(finalTotal)}`,
      html,
      attachments
    });
    console.log('Quotation email sent to customer successfully.');
  } catch (error) {
    console.error('Error sending quotation to customer:', error);
    throw error;
  }
};

module.exports = {
  sendQuotationNotificationToAdmin,
  sendQuotationConfirmationToCustomer,
  sendQuotationToCustomerWithPDF
};
