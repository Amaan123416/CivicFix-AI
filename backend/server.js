const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (
      origin === 'http://localhost:3000' ||
      origin === 'https://civic-fix-ruddy.vercel.app' ||
      /^https:\/\/civic-.*-amaan123416\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CivicFix AI API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
