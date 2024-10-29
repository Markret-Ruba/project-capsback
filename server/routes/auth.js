import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import checkAuth from '../middleware/checkAuth.js';

const authRoutes = express.Router();

// Register user
authRoutes.post('/register', registerUser);

// Login user
authRoutes.post('/login', loginUser);

// Protected route to check authentication status
authRoutes.get('/check-auth', checkAuth, (req, res) => {
  // If token is valid, return user info
  res.json({ user: req.user });
});

export default authRoutes;
