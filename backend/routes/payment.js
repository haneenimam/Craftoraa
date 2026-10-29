const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/Product');
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// Stripe Checkout session for card payments.
// Names and prices come from the database, never from the browser.
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    const line_items = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'Invalid item quantity' });
      }

      const product = await Product.findById(item.product);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.stock < quantity) {
        return res.status(400).json({ error: `${product.name || product.title} has insufficient stock` });
      }

      line_items.push({
        price_data: {
          currency: 'egp',
          product_data: {
            name: product.name || product.title || 'Product',
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${FRONTEND_URL}/checkout?payment=success`,
      cancel_url: `${FRONTEND_URL}/checkout?payment=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
