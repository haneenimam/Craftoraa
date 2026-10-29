require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Verify essential env variables
if (!process.env.MONGO_URI || !process.env.STRIPE_SECRET_KEY) {
  console.error('ERROR: Missing required environment variables');
  process.exit(1);
}

// Warn if separate router package exists
try {
  const router = require('router');
  console.error('CONFLICT: Separate "router" package detected!');
  process.exit(1);
} catch (err) {
}

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB with retry
const connectDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000
      });
      console.log('MongoDB Connected');
      return;
    } catch (err) {
      console.error(`DB Connection failed (${retries} left):`, err.message);
      retries--;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
  process.exit(1);
};

// Stripe webhook needs the raw body, so it must be registered before express.json()
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Stripe webhook verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`Stripe Event: ${event.type}`);
  res.json({ received: true });
});

app.use(express.json({ limit: '10kb' }));

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://craftoraa.netlify.app',
  'https://ecommerce-backend3-31p8.vercel.app',
  'https://craftoraaa.netlify.app',
];

// Live frontend address, e.g. https://craftora.example.com
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
}

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};

app.use(cors(corsOptions));

// Timeout handler
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    console.error(`Timeout: ${req.method} ${req.url}`);
    res.status(503).json({ error: 'Service timeout' });
  });
  next();
});

// Load route helper
const loadRoute = (routePath) => {
  const route = require(routePath);
  if (typeof route !== 'function') {
    console.error(`Invalid route module at ${routePath}`);
    process.exit(1);
  }
  return route;
};

// Routes
app.use('/api/auth', loadRoute('./routes/auth'));
app.use('/api/products', loadRoute('./routes/products'));
app.use('/api/cart', loadRoute('./routes/cart'));
app.use('/api/orders', loadRoute('./routes/orders'));
app.use('/api/admin', loadRoute('./routes/admin'));
app.use('/api/payment', loadRoute('./routes/payment'));
app.use('/api/contact', loadRoute('./routes/contact'));

// Health checks
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'E-commerce API is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected'
  });
});

// Final error handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ status: 'error', message: 'Origin not allowed' });
  }
  console.error(`[${new Date().toISOString()}]`, err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(` Server is running on port ${PORT}`);
    console.log('Available endpoints:');
    console.log('GET    /');
    console.log('GET    /health');
    console.log('POST   /api/auth/register');
    console.log('POST   /api/auth/login');
    console.log('POST   /api/auth/forgot-password');
    console.log('POST   /api/auth/reset-password');
    console.log('GET    /api/products');
    console.log('POST   /api/cart');
    console.log('POST   /api/orders');
    console.log('GET    /api/admin/users');
    console.log('POST   /api/payment/create-checkout-session');
    console.log('POST   /api/payment/webhook');
    console.log('POST   /api/contact');
  });
});
