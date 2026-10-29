const express = require('express');
const router = express.Router();
const { auth, roleCheck } = require('../middleware/auth');
const User = require('../models/User');
const Cart = require('../models/Cart');

// Get all users (Admin only)
router.get('/users', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user details or role (Admin only)
router.patch('/users/:id', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    const { firstName, lastName, email, role } = req.body;

    // Stop an admin from locking themselves out
    if (req.params.id === req.user.id && role !== undefined && role !== 'Admin') {
      return res.status(400).json({ error: "You can't remove your own Admin role" });
    }

    const updatedFields = {};
    if (firstName !== undefined) updatedFields.firstName = firstName;
    if (lastName !== undefined) updatedFields.lastName = lastName;
    if (email !== undefined) updatedFields.email = email;
    if (role !== undefined) updatedFields.role = role;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Email is already in use' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Invalid user details' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete user (Admin only)
router.delete('/users/:id', auth, roleCheck(['Admin']), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ error: "You can't delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await Cart.deleteOne({ user: user._id });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
