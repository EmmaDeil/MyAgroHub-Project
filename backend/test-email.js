const { sendOrderConfirmation } = require('./services/emailService');

// Test email functionality
const testOrderEmail = async () => {
  const orderDetails = {
    customerEmail: 'test@example.com',
    customerName: 'John Doe',
    orderId: 'ORD-TEST-123',
    items: [
      {
        name: 'Fresh Tomatoes',
        quantity: 2,
        unit: 'kg',
        price: 500,
        total: 1000
      },
      {
        name: 'Sweet Corn',
        quantity: 5,
        unit: 'cobs',
        price: 100,
        total: 500
      }
    ],
    total: 2000,
    deliveryAddress: {
      address: '123 Test Street',
      city: 'Lagos',
      state: 'Lagos State',
      country: 'Nigeria'
    },
    paymentMethod: 'Cash on Delivery',
    orderDate: new Date().toISOString()
  };

  try {
    console.log('🧪 Testing email functionality...');
    const result = await sendOrderConfirmation(orderDetails);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Preview URL:', result.previewUrl);
    console.log('📨 Message ID:', result.messageId);
  } catch (error) {
    console.error('❌ Test email failed:', error);
  }
};

// Run test if this file is executed directly
if (require.main === module) {
  testOrderEmail();
}

module.exports = { testOrderEmail };
