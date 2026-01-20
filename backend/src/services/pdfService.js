const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const { QuoteSettings } = require('../models');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/quotations');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const generateQuotationPDF = async (quotation, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Get quote settings
      let settings = await QuoteSettings.findOne();
      if (!settings) {
        settings = {
          companyName: 'Your Company Name',
          companyAddress: 'Company Address',
          companyPhone: '',
          companyEmail: '',
          companyGstin: '',
          disclaimer: 'This quotation is valid for 15 days from the date of issue.',
          termsAndConditions: '',
          footerText: 'Thank you for your business!',
          showGstDisclaimer: true,
          validityDays: 15
        };
      }

      const doc = new PDFDocument({
        margin: 50,
        size: 'A4'
      });

      const fileName = `quotation_${quotation.quotationNumber.replace(/\//g, '-')}.pdf`;
      const filePath = path.join(uploadsDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header - Company Info
      doc.fontSize(20).font('Helvetica-Bold').text(settings.companyName || 'Company Name', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(settings.companyAddress || '', { align: 'center' });

      if (settings.companyPhone || settings.companyEmail) {
        const contactInfo = [settings.companyPhone, settings.companyEmail].filter(Boolean).join(' | ');
        doc.text(contactInfo, { align: 'center' });
      }

      if (settings.companyGstin) {
        doc.text(`GSTIN: ${settings.companyGstin}`, { align: 'center' });
      }

      doc.moveDown(1.5);

      // Title
      doc.fontSize(16).font('Helvetica-Bold').text('QUOTATION', { align: 'center' });
      doc.moveDown(0.5);

      // Quotation Details Box
      const boxTop = doc.y;
      doc.fontSize(10).font('Helvetica');

      // Left side - Customer Info
      doc.text('Bill To:', 50, boxTop);
      doc.font('Helvetica-Bold').text(quotation.customerName || 'N/A', 50, boxTop + 15);
      doc.font('Helvetica');

      if (quotation.customerCompany) {
        doc.text(quotation.customerCompany, 50, doc.y);
      }
      if (quotation.customerAddress) {
        doc.text(quotation.customerAddress, 50, doc.y, { width: 200 });
      }
      if (quotation.customerPhone) {
        doc.text(`Phone: ${quotation.customerPhone}`, 50, doc.y);
      }
      if (quotation.customerEmail) {
        doc.text(`Email: ${quotation.customerEmail}`, 50, doc.y);
      }

      // Right side - Quotation Info
      doc.text('Quotation No:', 350, boxTop);
      doc.font('Helvetica-Bold').text(quotation.quotationNumber, 430, boxTop);
      doc.font('Helvetica');
      doc.text('Date:', 350, boxTop + 15);
      doc.text(formatDate(quotation.createdAt), 430, boxTop + 15);
      doc.text('Valid Until:', 350, boxTop + 30);
      const validUntil = new Date(quotation.createdAt);
      validUntil.setDate(validUntil.getDate() + (settings.validityDays || 15));
      doc.text(formatDate(validUntil), 430, boxTop + 30);
      doc.text('Status:', 350, boxTop + 45);
      doc.text(quotation.status.toUpperCase(), 430, boxTop + 45);

      doc.moveDown(4);

      // Items Table
      const tableTop = doc.y + 20;
      const tableHeaders = ['#', 'Item', 'HSN', 'Qty', 'Unit Price', 'Discount', 'Tax', 'Total'];
      const colWidths = [25, 150, 50, 35, 70, 55, 50, 70];
      const colX = [50];

      for (let i = 1; i < colWidths.length; i++) {
        colX.push(colX[i - 1] + colWidths[i - 1]);
      }

      // Table Header
      doc.fillColor('#4F46E5').rect(50, tableTop, 505, 20).fill();
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');

      tableHeaders.forEach((header, i) => {
        doc.text(header, colX[i] + 3, tableTop + 5, { width: colWidths[i] - 6, align: i > 2 ? 'right' : 'left' });
      });

      doc.fillColor('#000000');

      // Table Rows
      let rowY = tableTop + 25;
      const items = quotation.items || [];

      items.forEach((item, index) => {
        const rowHeight = 20;

        // Alternate row background
        if (index % 2 === 0) {
          doc.fillColor('#F9FAFB').rect(50, rowY - 3, 505, rowHeight).fill();
          doc.fillColor('#000000');
        }

        doc.fontSize(8).font('Helvetica');

        // Serial number
        doc.text((index + 1).toString(), colX[0] + 3, rowY, { width: colWidths[0] - 6 });

        // Item name (with brand if available)
        const itemName = item.item?.brand ? `${item.item.brand} - ${item.itemName}` : item.itemName;
        doc.text(itemName, colX[1] + 3, rowY, { width: colWidths[1] - 6 });

        // HSN Code
        doc.text(item.item?.hsnCode || '-', colX[2] + 3, rowY, { width: colWidths[2] - 6 });

        // Quantity
        doc.text(item.quantity.toString(), colX[3] + 3, rowY, { width: colWidths[3] - 6, align: 'right' });

        // Unit Price
        doc.text(formatCurrency(item.unitPrice), colX[4] + 3, rowY, { width: colWidths[4] - 6, align: 'right' });

        // Discount
        const discountText = item.discountPercent > 0 ? `${item.discountPercent}%` : '-';
        doc.text(discountText, colX[5] + 3, rowY, { width: colWidths[5] - 6, align: 'right' });

        // Tax
        const taxAmount = parseFloat(item.igstAmount || 0) + parseFloat(item.cgstAmount || 0) + parseFloat(item.sgstAmount || 0);
        doc.text(formatCurrency(taxAmount), colX[6] + 3, rowY, { width: colWidths[6] - 6, align: 'right' });

        // Total
        doc.text(formatCurrency(item.totalPrice), colX[7] + 3, rowY, { width: colWidths[7] - 6, align: 'right' });

        rowY += rowHeight;

        // Add new page if needed
        if (rowY > 700) {
          doc.addPage();
          rowY = 50;
        }
      });

      // Totals Section
      doc.moveDown(1);
      const totalsX = 380;
      const totalsValueX = 480;
      let totalsY = rowY + 20;

      doc.fontSize(10).font('Helvetica');

      // Subtotal
      doc.text('Subtotal:', totalsX, totalsY);
      doc.text(formatCurrency(quotation.subtotal), totalsValueX, totalsY, { align: 'right', width: 75 });
      totalsY += 18;

      // Discount
      if (parseFloat(quotation.discountTotal) > 0) {
        doc.text('Discount:', totalsX, totalsY);
        doc.text(`-${formatCurrency(quotation.discountTotal)}`, totalsValueX, totalsY, { align: 'right', width: 75 });
        totalsY += 18;
      }

      // Tax
      if (parseFloat(quotation.taxTotal) > 0) {
        doc.text('Tax (GST):', totalsX, totalsY);
        doc.text(formatCurrency(quotation.taxTotal), totalsValueX, totalsY, { align: 'right', width: 75 });
        totalsY += 18;
      }

      // Admin adjustments if any
      if (quotation.adminPriceAdjustment && parseFloat(quotation.adminPriceAdjustment) !== 0) {
        doc.text('Price Adjustment:', totalsX, totalsY);
        const adjSign = parseFloat(quotation.adminPriceAdjustment) > 0 ? '+' : '';
        doc.text(`${adjSign}${formatCurrency(quotation.adminPriceAdjustment)}`, totalsValueX, totalsY, { align: 'right', width: 75 });
        totalsY += 18;
      }

      if (quotation.adminGstAmount && parseFloat(quotation.adminGstAmount) > 0) {
        doc.text('Additional GST:', totalsX, totalsY);
        doc.text(formatCurrency(quotation.adminGstAmount), totalsValueX, totalsY, { align: 'right', width: 75 });
        totalsY += 18;
      }

      // Grand Total
      doc.font('Helvetica-Bold').fontSize(12);
      doc.fillColor('#4F46E5').rect(totalsX - 10, totalsY, 175, 25).fill();
      doc.fillColor('#FFFFFF');
      doc.text('GRAND TOTAL:', totalsX, totalsY + 6);

      const finalTotal = quotation.finalTotal || quotation.grandTotal;
      doc.text(formatCurrency(finalTotal), totalsValueX, totalsY + 6, { align: 'right', width: 75 });

      doc.fillColor('#000000');

      // GST Disclaimer (Red text)
      if (settings.showGstDisclaimer && !quotation.taxTotal) {
        doc.moveDown(2);
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#DC2626');
        doc.text('* This quotation does not include GST. GST will be charged as applicable.', 50, doc.y, { align: 'left' });
        doc.fillColor('#000000');
      }

      // Notes
      if (quotation.notes || quotation.adminNotes) {
        doc.moveDown(1.5);
        doc.fontSize(10).font('Helvetica-Bold').text('Notes:', 50);
        doc.font('Helvetica');
        if (quotation.notes) {
          doc.text(quotation.notes, 50, doc.y, { width: 500 });
        }
        if (quotation.adminNotes) {
          doc.text(quotation.adminNotes, 50, doc.y, { width: 500 });
        }
      }

      // Disclaimer
      if (settings.disclaimer) {
        doc.moveDown(1.5);
        doc.fontSize(9).font('Helvetica-Oblique').fillColor('#666666');
        doc.text(settings.disclaimer, 50, doc.y, { width: 500 });
        doc.fillColor('#000000');
      }

      // Terms and Conditions
      if (settings.termsAndConditions) {
        doc.moveDown(1);
        doc.fontSize(9).font('Helvetica-Bold').text('Terms & Conditions:', 50);
        doc.font('Helvetica').fillColor('#666666');
        doc.text(settings.termsAndConditions, 50, doc.y, { width: 500 });
        doc.fillColor('#000000');
      }

      // Footer
      if (settings.footerText) {
        doc.fontSize(10).font('Helvetica');
        doc.text(settings.footerText, 50, 780, { align: 'center', width: 500 });
      }

      doc.end();

      writeStream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          relativePath: `/uploads/quotations/${fileName}`
        });
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateQuotationPDF
};
