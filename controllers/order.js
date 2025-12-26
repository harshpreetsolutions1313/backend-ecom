const Order = require('../models/Order');
const { readContract } = require('../utils/contract');
const { ethers } = require('ethers');

// Create or track an order
exports.createOrder = async (req, res) => {
  try {
    const { productId, amount, token, onChainOrderId, transactionHash, quantity, buyer } = req.body; // Add buyer
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Access denied. No authenticated user.' });
    }

    if (!onChainOrderId) {
      return res.status(400).json({ message: 'onChainOrderId is required.' });
    }

    const numericOrderId = Number(onChainOrderId);
    
    if (Number.isNaN(numericOrderId)) {
      return res.status(400).json({ message: 'Invalid onChainOrderId provided.' });
    }

    const onChainOrder = await readContract.getOrder(numericOrderId);
    console.log("onChainOrder", onChainOrder);

    if (!onChainOrder) {
      return res.status(400).json({ message: 'Order not found on-chain.' });
    }

    // Verify the buyer matches the on-chain order
    if (onChainOrder.buyer.toLowerCase() !== buyer.toLowerCase()) {
      return res.status(400).json({ message: 'Buyer mismatch: The provided buyer does not match the on-chain order.' });
    }

    if (!onChainOrder.paid) {
      return res.status(400).json({ message: 'Order is not paid on-chain.' });
    }

    const orderData = {
      orderId: numericOrderId,
      buyer: onChainOrder.buyer,
      productId,
      quantity: Number(quantity),
      amount: Number(amount),
      token,
      paid: true,
      transactionHash,
      trackedAt: new Date(),
      user_id: authenticatedUser.id,
    };

    await Order.findOneAndUpdate(
      { orderId: orderData.orderId },
      orderData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      orderId: onChainOrderId.toString(),
      tracked: true,
      user: authenticatedUser.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Create or track multiple orders (batch)
exports.createBatchOrder = async (req, res) => {
  try {
    const { items, token, transactionHash, buyer } = req.body; // Add buyer
    const authenticatedUser = req.user;

    if (!authenticatedUser) {
      return res.status(401).json({ message: 'Access denied. No authenticated user.' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items array is required and must not be empty.' });
    }

    const ordersToTrack = [];
    for (const item of items) {
      const { productId, amount, onChainOrderId, quantity } = item;

      if (!onChainOrderId) {
        return res.status(400).json({ message: 'onChainOrderId is required for each item.' });
      }

      const numericOrderId = Number(onChainOrderId);
      if (Number.isNaN(numericOrderId)) {
        return res.status(400).json({ message: `Invalid onChainOrderId provided for product ${productId}.` });
      }

      const onChainOrder = await readContract.getOrder(numericOrderId);
      if (!onChainOrder) {
        return res.status(400).json({ message: `Order not found on-chain for product ${productId}.` });
      }

      // Verify the buyer matches the on-chain order
      if (onChainOrder.buyer.toLowerCase() !== buyer.toLowerCase()) {
        return res.status(400).json({ message: `Buyer mismatch for product ${productId}: The provided buyer does not match the on-chain order.` });
      }

      if (!onChainOrder.paid) {
        return res.status(400).json({ message: `Order is not paid on-chain for product ${productId}.` });
      }

      ordersToTrack.push({
        orderId: numericOrderId,
        buyer: onChainOrder.buyer,
        productId,
        quantity: Number(quantity),
        amount: Number(amount),
        token,
        paid: true,
        transactionHash,
        trackedAt: new Date(),
        user_id: authenticatedUser.id,
      });
    }

    for (const orderData of ordersToTrack) {
      await Order.findOneAndUpdate(
        { orderId: orderData.orderId },
        orderData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    return res.json({
      tracked: true,
      user: authenticatedUser.id,
      orderCount: ordersToTrack.length,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};




// Pay for an order
exports.payForOrder = async (req, res) => {
  try {
    const { orderId, tokenAddress } = req.body;

    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(403).json({
      error: 'Server does not sign on-chain payments. Please perform the payment from the connected wallet (frontend) using the contract method createAndPayForOrder or payForOrder.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
