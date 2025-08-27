const nodemailer = require('nodemailer');

// Email configuration
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP service)
  // For production, replace with actual SMTP settings
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
      pass: process.env.SMTP_PASS || 'ethereal.pass'
    }
  });
};

// Generate HTML email template for order confirmation
const generateOrderConfirmationHTML = (orderDetails) => {
  const { orderId, customerName, items, total, deliveryAddress, paymentMethod, orderDate } = orderDetails;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - AgroHub</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: #28a745; color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { padding: 30px; }
        .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .item { border-bottom: 1px solid #eee; padding: 15px 0; display: flex; justify-content: space-between; }
        .item:last-child { border-bottom: none; }
        .total { background: #28a745; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 18px; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        .green { color: #28a745; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌾 AgroHub</h1>
          <p>Your Fresh Farm Products Order Confirmation</p>
        </div>
        
        <div class="content">
          <h2>Thank you, ${customerName}! 🎉</h2>
          <p>Your order has been successfully placed and is being prepared by our trusted farmers.</p>
          
          <div class="order-info">
            <h3>📋 Order Details</h3>
            <p><strong>Order ID:</strong> <span class="green">${orderId}</span></p>
            <p><strong>Order Date:</strong> ${new Date(orderDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
          </div>

          <h3>🛒 Items Ordered</h3>
          ${items.map(item => `
            <div class="item">
              <div>
                <strong>${item.name}</strong><br>
                <small>${item.quantity} ${item.unit}(s) × ₦${item.price.toLocaleString()}</small>
              </div>
              <div class="green">₦${item.total.toLocaleString()}</div>
            </div>
          `).join('')}
          
          <div class="total">
            Total Amount: ₦${total.toLocaleString()}
          </div>

          <div class="order-info">
            <h3>🚚 Delivery Information</h3>
            <p><strong>Delivery Address:</strong></p>
            <p>${deliveryAddress.address}<br>
               ${deliveryAddress.city}, ${deliveryAddress.state}<br>
               ${deliveryAddress.country}</p>
          </div>

          <div class="order-info">
            <h3>📱 What's Next?</h3>
            <ul>
              <li>Our farmers are preparing your fresh products</li>
              <li>You'll receive SMS updates on order status</li>
              <li>Expected delivery: 1-3 business days</li>
              <li>Payment on delivery (if Cash on Delivery selected)</li>
            </ul>
          </div>

          <p><strong>Questions?</strong> Contact us at support@agritech.com or call +234-800-AGRITECH</p>
        </div>
        
        <div class="footer">
          <p>Thank you for supporting local farmers! 🌱</p>
          <p>AgroHub - Connecting You to Fresh, Local Produce</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send order confirmation email
const sendOrderConfirmation = async (orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'AgroHub <noreply@agrohub.com>',
      to: orderDetails.customerEmail,
      subject: `Order Confirmation - ${orderDetails.orderId} | AgroHub`,
      html: generateOrderConfirmationHTML(orderDetails),
      text: `
        Dear ${orderDetails.customerName},
        
        Thank you for your order with AgroHub!
        
        Order ID: ${orderDetails.orderId}
        Order Date: ${orderDetails.orderDate}
        Total Amount: ₦${orderDetails.total.toLocaleString()}
        
        Your fresh farm products are being prepared for delivery.
        
        Delivery Address:
        ${orderDetails.deliveryAddress.address}
        ${orderDetails.deliveryAddress.city}, ${orderDetails.deliveryAddress.state}
        ${orderDetails.deliveryAddress.country}
        
        You will receive updates on your order status via SMS.
        
        Thank you for supporting local farmers!
        
        AgroHub Team
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) // For Ethereal testing
    };
  } catch (error) {
    console.error('❌ Failed to send order confirmation email:', error);
    throw error;
  }
};

// Send farmer notification email
const sendFarmerNotification = async (farmerEmail, orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'AgriTech <noreply@agritech.com>',
      to: farmerEmail,
      subject: `New Order Received - ${orderDetails.orderId}`,
      html: `
        <h2>🌾 New Order Alert</h2>
        <p>Dear Farmer,</p>
        <p>You have received a new order through AgriTech platform.</p>
        
        <h3>Order Details:</h3>
        <ul>
          <li><strong>Order ID:</strong> ${orderDetails.orderId}</li>
          <li><strong>Customer:</strong> ${orderDetails.customerName}</li>
          <li><strong>Items:</strong> ${orderDetails.items.map(item => `${item.quantity} ${item.unit}(s) of ${item.name}`).join(', ')}</li>
          <li><strong>Total Value:</strong> ₦${orderDetails.total.toLocaleString()}</li>
        </ul>
        
        <h3>Customer Contact:</h3>
        <ul>
          <li><strong>Phone:</strong> ${orderDetails.customerPhone || 'Not provided'}</li>
          <li><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress.address}, ${orderDetails.deliveryAddress.city}</li>
        </ul>
        
        <p>Please prepare the order and coordinate with our delivery team.</p>
        
        <p>Best regards,<br>AgriTech Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Farmer notification email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Failed to send farmer notification email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmation,
  sendFarmerNotification,
  createTransporter
};
