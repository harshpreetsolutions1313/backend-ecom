require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const routes = require('./routes');

const app = express();



const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',

  // Frontend (Vercel)
  'https://ecom-smoky-delta.vercel.app',
  'https://frontend-ecom-six.vercel.app',


];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, Postman, curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

// MUST be before routes
app.use(cors(corsOptions));

// REQUIRED on Vercel for preflight
// app.options('/*', cors(corsOptions));

app.use(express.json());

let dbConnected = false;

connectDB()
  .then(() => {
    dbConnected = true;
    console.log('Database connected');
  })
  .catch((err) => {
    console.error('Initial DB connection failed:', err);
  });
app.use('/api', routes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running',
    endpoints: ['/health', '/api/products', '/api/orders', '/api/contract'],
    timestamp: new Date().toISOString()
  });
});

// Health
app.get('/health', async (req, res) => {
  try {
    if (!dbConnected) await connectDB();

    res.status(200).json({
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


module.exports = app;
