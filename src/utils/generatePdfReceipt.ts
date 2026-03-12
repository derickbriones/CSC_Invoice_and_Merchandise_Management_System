// PDF Receipt Generator using browser print
export interface ReceiptData {
  receiptNumber: string;
  date: string;
  studentName: string;
  studentId?: string;
  course?: string;
  yearLevel?: number;
  type: 'csc_fee' | 'merchandise';
  academicYear?: string;
  amount: number;
  paymentMethod: string;
  items?: { name: string; quantity: number; size?: string; unitPrice: number }[];
  orderNumber?: string;
  claimDate?: string;
  claimVenue?: string;
}

export const generatePdfReceipt = (data: ReceiptData) => {
  const itemsHtml = data.items
    ? data.items
        .map(
          (i) =>
            `<tr>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;">${i.name}${i.size ? ` (${i.size})` : ''}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${i.quantity}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">₱${i.unitPrice.toFixed(2)}</td>
              <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">₱${(i.unitPrice * i.quantity).toFixed(2)}</td>
            </tr>`
        )
        .join('')
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt - ${data.receiptNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
        .header { text-align: center; border-bottom: 3px solid #0a7ea4; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; margin: 0; color: #0a7ea4; }
        .header h2 { font-size: 14px; margin: 4px 0; color: #666; }
        .header p { font-size: 12px; color: #999; margin: 2px 0; }
        .receipt-title { text-align: center; font-size: 20px; font-weight: bold; color: #0a7ea4; margin: 20px 0; text-transform: uppercase; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .info-item label { font-size: 11px; color: #999; text-transform: uppercase; display: block; }
        .info-item span { font-size: 14px; font-weight: 500; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        th { background: #f5f5f5; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; }
        .total-row { font-size: 18px; font-weight: bold; text-align: right; padding: 16px 8px; border-top: 2px solid #0a7ea4; }
        .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 16px; }
        .badge { display: inline-block; background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>BICOL UNIVERSITY - POLANGUI CAMPUS</h1>
        <h2>College Student Council</h2>
        <p>Invoice & Merchandise Management System</p>
      </div>
      
      <div class="receipt-title">
        ${data.type === 'csc_fee' ? 'CSC FEE PAYMENT RECEIPT' : 'MERCHANDISE ORDER RECEIPT'}
      </div>

      <div style="text-align:center;margin-bottom:16px;">
        <span class="badge">PAID</span>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <label>Receipt No.</label>
          <span style="font-family:monospace;">${data.receiptNumber}</span>
        </div>
        <div class="info-item">
          <label>Date</label>
          <span>${data.date}</span>
        </div>
        <div class="info-item">
          <label>Student Name</label>
          <span>${data.studentName}</span>
        </div>
        ${data.studentId ? `<div class="info-item"><label>Student ID</label><span>${data.studentId}</span></div>` : ''}
        ${data.course ? `<div class="info-item"><label>Course</label><span>${data.course}</span></div>` : ''}
        ${data.yearLevel ? `<div class="info-item"><label>Year Level</label><span>${data.yearLevel}</span></div>` : ''}
        ${data.academicYear ? `<div class="info-item"><label>Academic Year</label><span>${data.academicYear}</span></div>` : ''}
        <div class="info-item">
          <label>Payment Method</label>
          <span style="text-transform:capitalize;">${data.paymentMethod.replace('_', ' ')}</span>
        </div>
        ${data.orderNumber ? `<div class="info-item"><label>Order Number</label><span style="font-family:monospace;">${data.orderNumber}</span></div>` : ''}
        ${data.claimDate ? `<div class="info-item"><label>Claim Date</label><span>${data.claimDate}</span></div>` : ''}
        ${data.claimVenue ? `<div class="info-item"><label>Claim Venue</label><span>${data.claimVenue}</span></div>` : ''}
      </div>

      ${
        data.items
          ? `<table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align:center;">Qty</th>
                  <th style="text-align:right;">Price</th>
                  <th style="text-align:right;">Subtotal</th>
                </tr>
              </thead>
              <tbody>${itemsHtml}</tbody>
            </table>`
          : `<table>
              <thead><tr><th>Description</th><th style="text-align:right;">Amount</th></tr></thead>
              <tbody>
                <tr>
                  <td style="padding:8px;">CSC Fee - A.Y. ${data.academicYear}</td>
                  <td style="padding:8px;text-align:right;">₱${data.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>`
      }

      <div class="total-row">
        Total Amount: ₱${data.amount.toFixed(2)}
      </div>

      <div class="footer">
        <p>This is a system-generated receipt from the BU Polangui CSC Invoice & Merchandise Management System.</p>
        <p>For inquiries, please contact the CSC Office.</p>
        <p style="margin-top:8px;">© ${new Date().getFullYear()} Bicol University - Polangui Campus</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
};
