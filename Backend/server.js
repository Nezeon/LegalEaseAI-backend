const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB (optional)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.warn('MONGO_URI not set. Skipping MongoDB connection.');
}

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// ========== REGISTER ROUTES ==========
// Existing login/auth route (if you already have one)
// const authRoutes = require('./routes/auth');
// app.use('/auth', authRoutes);

// Use the already created documents.js route
const documentRoutes = require('./routes/documents');
app.use('/documents', documentRoutes);
// ====================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
