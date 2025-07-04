require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);


require('dotenv').config();
console.log('MONGO_URI:', process.env.MONGO_URI);
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

// MongoDB connection
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  }); 