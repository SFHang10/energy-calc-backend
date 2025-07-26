require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.get('/calculator-wix/products', (req, res) => {
  res.json([
    { id: '1', name: 'Energy Efficient Fridge', power: 150, category: 'Appliances', brand: 'EcoBrand', runningCostPerYear: 45.50 },
    { id: '2', name: 'LED TV 55\"', power: 80, category: 'Electronics', brand: 'GreenTech', runningCostPerYear: 24.30 }
  ]);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
  console.log('Test with: curl http://localhost:4000/test');
  console.log('Wix test with: curl http://localhost:4000/calculator-wix/products');
});
