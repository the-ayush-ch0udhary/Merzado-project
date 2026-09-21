const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { userRepository } = require('../repositories/dataRepository');
const { requireAuth, JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// User registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyName, location } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    if (!['BUYER', 'SUPPLIER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either BUYER or SUPPLIER.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      companyName: companyName ? companyName.trim() : '',
      location: location ? location.trim() : '',
    });

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        location: user.location,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: error.message,
    });
  }
});

// 1-click login for quick testing
router.post('/demo-login', async (req, res) => {
  try {
    const { role } = req.body;
    const targetRole = role === 'SUPPLIER' ? 'SUPPLIER' : 'BUYER';

    let demoUser = await userRepository.findDemoUser(targetRole);

    if (!demoUser) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      demoUser = await userRepository.create({
        name: targetRole === 'BUYER' ? 'Aditya Sharma' : 'Vikram Mehta',
        email: targetRole === 'BUYER' ? 'buyer@demo.com' : 'supplier@demo.com',
        password: hashedPassword,
        role: targetRole,
        companyName:
          targetRole === 'BUYER'
            ? 'Apex Global Procurement Ltd.'
            : 'Zenith Industrial & Metals Corp.',
        location: targetRole === 'BUYER' ? 'Bengaluru, India' : 'Mumbai, India',
      });
    }

    const token = generateToken(demoUser);

    return res.status(200).json({
      success: true,
      message: `Logged in as Demo ${targetRole}.`,
      token,
      user: {
        id: demoUser._id || demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        companyName: demoUser.companyName,
        location: demoUser.location,
      },
    });
  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during demo login.',
      error: error.message,
    });
  }
});

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id || req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      companyName: req.user.companyName,
      location: req.user.location,
    },
  });
});

module.exports = router;
