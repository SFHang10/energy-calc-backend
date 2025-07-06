const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Example product data
const products = [
  {
    id: 1,
    name: "Eco Refrigerator",
    powerUseKwhPerYear: 200,
    runningCostPerYear: 60,
    description: "A highly efficient refrigerator."
  },
  {
    id: 2,
    name: "Green Washer",
    powerUseKwhPerYear: 150,
    runningCostPerYear: 45,
    description: "An energy-saving washing machine."
  }
  // Add more products as needed
];

app.use(cors());
app.use(express.json());

// Get all products
app.get('/products', (req, res) => {
  res.json(products);
});

// Get a single product by ID
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});