const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// get all users
exports.getAllUsers = async (req, res) => {
  try {
    // .find({}) fetches all documents.
    // .select('-password') excludes the hashed password from the result for security.
    const users = await User.find({}).select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

exports.getProductsByUser = async (req, res) => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Access denied. No authenticated user.' });
    }

    // Determine the userId to fetch products for
    let userId;
    if (authenticatedUser.isAdmin && req.query.user_id) {
      // Admin can pass a user_id to fetch products for any user
      userId = req.query.user_id;
    } else {
      // Regular user can only fetch their own products
      userId = authenticatedUser.id;
    }

    // Fetch user details (name and email)
    const userDetails = await User.findById(userId).select('name email').lean();
    if (!userDetails) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Fetch purchased orders for the specified user
    const purchasedOrders = await Order.find({ user_id: userId, paid: true })
      .select('productId amount token orderId trackedAt transactionHash buyer -_id')
      .lean();

    if (purchasedOrders.length === 0) {
      return res.json({
        user: {
          id: userId,
          name: userDetails.name,
          email: userDetails.email,
        },
        count: 0,
        products: []
      });
    }

    // Extract all unique productIds from the purchased orders
    const productIds = [...new Set(purchasedOrders.map(order => order.productId))];

    // Fetch product details for all unique IDs in one go
    const productsDetails = await Product.find({ id: { $in: productIds } }).select('id name images').lean();

    // Create a map for quick lookup of product details by product ID
    const productDetailsMap = new Map(productsDetails.map(product => [product.id, product]));

    // Combine order data with product image/name data
    const enhancedPurchasedProducts = purchasedOrders.map(order => {
      const productDetails = productDetailsMap.get(order.productId);
      return {
        ...order,
        productName: productDetails ? productDetails.name : 'Unknown Product',
        productImages: productDetails ? productDetails.images : [],
      };
    });

    // Return the list of orders/products with images, along with user details
    res.json({
      user: {
        id: userId,
        name: userDetails.name,
        email: userDetails.email,
      },
      count: enhancedPurchasedProducts.length,
      products: enhancedPurchasedProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};




// Add item to cart
exports.addToCart = async (req, res) => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Access denied. No authenticated user.' });
    }

    const userId = authenticatedUser.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required.' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: 'quantity must be greater than 0.' });
    }

    // Ensure product exists
    const product = await Product.findOne({ id: productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!Array.isArray(user.cart)) {
      user.cart = [];
    }

    // Check if product already in cart
    const existingItem = user.cart.find((item) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.cart.push({ productId, quantity });
    }

    await user.save();

    return res.status(200).json({
      message: 'Item added to cart successfully.',
      cart: user.cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Get current user's cart
exports.getCart = async (req, res) => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Access denied. No authenticated user.' });
    }

    const userId = authenticatedUser.id;

    const user = await User.findById(userId).select('cart');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Optionally join product details
    const productIds = (user.cart || []).map((item) => item.productId);

    const products = await Product.find({ id: { $in: productIds } })
      .select('id name price images')
      .lean();

    const productMap = new Map(products.map((p) => [p.id, p]));

    const detailedCart = (user.cart || []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      product: productMap.get(item.productId) || null,
    }));

    return res.status(200).json({
      user: userId,
      count: detailedCart.length,
      cart: detailedCart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// remove product from cart
exports.removeFromCart = async (req, res) => {
  try {
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Access denied. No authenticated user.' });
    }

    const userId = authenticatedUser.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required.' });
    }

    const user = await User.findById(userId).select('cart');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const prevCartLength = user.cart.length;

    user.cart = user.cart.filter((item) => item.productId !== productId);

    if (user.cart.length === prevCartLength) {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }

    await user.save();

    return res.status(200).json({ message: 'Product removed from cart.', cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Search users by name or email
exports.searchUsers = async (req, res) => {
  try {
    // console.log("Inside searchUsers controller");
    const authenticatedUser = req.user;
    // console.log("Authenticated user:", authenticatedUser);

    // Optional but recommended: Admin-only search
    if (!authenticatedUser || !authenticatedUser.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { query, name, email } = req.query;

    if (!query && !name && !email) {
      return res.status(400).json({
        message: 'Provide query or name/email parameters'
      });
    }

    const searchConditions = [];

    if (query) {
      searchConditions.push(
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      );
    }

    if (name) {
      searchConditions.push({ name: { $regex: name, $options: 'i' } });
    }

    if (email) {
      searchConditions.push({ email: { $regex: email, $options: 'i' } });
    }

    const users = await User.find({
      $or: searchConditions
    }).select('-password');

    res.status(200).json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};



