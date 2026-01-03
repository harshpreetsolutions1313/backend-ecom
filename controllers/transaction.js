const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// controllers/transactionController.js
const getAllUsersTransactions = async (req, res) => {
  try {
    console.log('Fetching all paid orders...');
    const orders = await Order.find({ paid: true }).lean();
    console.log('Found orders:', orders.length);

    if (orders.length === 0) {
      console.log('No paid orders found.');
      return res.status(404).json({ message: 'No transactions found.' });
    }

    const userIds = [...new Set(orders.map(order => order.user_id))];
    const productIds = [...new Set(orders.map(order => order.productId))];

    console.log('Unique user IDs:', userIds);
    console.log('Unique product IDs:', productIds);

    const [users, products] = await Promise.all([
      User.find({ _id: { $in: userIds } }).select('id name email').lean(),
      Product.find({ id: { $in: productIds } }).select('id name images').lean(),
    ]);

    console.log('Fetched users:', users.length);
    console.log('Fetched products:', products.length);

    const userMap = new Map(users.map(user => [user._id.toString(), user]));
    const productMap = new Map(products.map(product => [product.id, product]));

    const result = [];
    for (const user of users) { // Loop through users, not userIds
      const userOrders = orders.filter(order => order.user_id.toString() === user._id.toString());

      const enhancedOrders = userOrders.map(order => ({
        orderId: order.orderId,
        amount: order.amount,
        buyer: order.buyer,
        productId: order.productId,
        token: order.token,
        trackedAt: order.trackedAt,
        transactionHash: order.transactionHash,
        productName: productMap.get(order.productId)?.name || 'Unknown Product',
        productImages: productMap.get(order.productId)?.images || [],
      }));

      result.push({
        user: { id: user._id, name: user.name, email: user.email },
        count: enhancedOrders.length,
        products: enhancedOrders,
      });
    }

    console.log('Final result:', result);
    res.json(result);
  } catch (error) {
    console.error('Error in controller:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getAllUsersTransactions };