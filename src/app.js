require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const productsRouter = require('./routes/products');
const calculateRouter = require('./routes/calculate');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/products', productsRouter);
app.use('/calculate', calculateRouter);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Connect to MongoDB after server starts
  mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch(err => {
      console.error('MongoDB connection error:', err);
    });
});