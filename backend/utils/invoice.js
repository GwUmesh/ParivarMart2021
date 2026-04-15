const Order = require('../models/Order');

/**
 * Generate invoice number in format PM-YYYY-XXXX
 * e.g., PM-2026-0001
 */
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `PM-${year}-`;

  // Find the latest order with an invoice number for this year
  const lastOrder = await Order.findOne({
    invoiceNumber: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;
  if (lastOrder && lastOrder.invoiceNumber) {
    const lastNum = parseInt(lastOrder.invoiceNumber.split('-').pop(), 10);
    nextNumber = lastNum + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
};

/**
 * Generate HTML invoice email template
 */
const generateInvoiceHTML = (order) => {
  const itemRows = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #015958, #0FC2C0); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🛒 Parivar Mart</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">Your Family's Trusted Store Since 2021</p>
      </div>
      
      <div style="background: #fff; padding: 30px; border: 1px solid #e0e0e0;">
        <h2 style="color: #015958; margin-top: 0;">Order Confirmation</h2>
        
        <div style="background: #f0fffe; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 4px 0;"><strong>Invoice:</strong> ${order.invoiceNumber}</p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
          <p style="margin: 4px 0;"><strong>Delivery:</strong> ${order.deliveryType === 'store_pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
        </div>

        ${order.address ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #015958;">Delivery Address</h3>
          <p style="margin: 4px 0;">${order.address.fullName}</p>
          <p style="margin: 4px 0;">${order.address.addressLine1}${order.address.addressLine2 ? ', ' + order.address.addressLine2 : ''}</p>
          <p style="margin: 4px 0;">${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
          <p style="margin: 4px 0;">📞 ${order.address.phone}</p>
        </div>
        ` : ''}

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background: #015958; color: white;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Subtotal:</span><span>₹${order.subtotal.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Delivery Charge:</span><span>${order.deliveryCharge === 0 ? 'FREE' : '₹' + order.deliveryCharge.toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 4px 0;">
            <span>Platform Fee:</span><span>${order.platformFee === 0 ? 'FREE' : '₹' + order.platformFee.toFixed(2)}</span>
          </div>
          ${order.discount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin: 4px 0; color: #0FC2C0;">
            <span>Discount ${order.promoCode ? '(' + order.promoCode + ')' : ''}:</span><span>-₹${order.discount.toFixed(2)}</span>
          </div>
          ` : ''}
          <hr style="border: none; border-top: 2px solid #015958; margin: 10px 0;">
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #015958;">
            <span>Total:</span><span>₹${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="background: #023535; padding: 20px; border-radius: 0 0 12px 12px; text-align: center; color: rgba(255,255,255,0.8);">
        <p style="margin: 4px 0;">Parivar Mart — Parade Corner, Rasayani, Raigad – 410220</p>
        <p style="margin: 4px 0;">📞 +91 7021716914 | 📧 parivarmart399@gmail.com</p>
        <p style="margin: 8px 0 0; font-size: 12px;">Thank you for shopping with us! 🙏</p>
      </div>
    </div>
  `;
};

module.exports = { generateInvoiceNumber, generateInvoiceHTML };
