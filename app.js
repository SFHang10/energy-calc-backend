const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Function to read CSV and convert to products
function loadProductsFromCSV() {
  try {
    const csvPath = path.join(__dirname, "data", "eu_refrigerators.csv");
    console.log("Looking for CSV file at:", csvPath);
    
    const csvData = fs.readFileSync(csvPath, "utf8");
    const lines = csvData.split("\n").filter(line => line.trim());
    
    // Skip header row
    const products = lines.slice(1).map((line, index) => {
      const [name, manufacturer, modelNo, category, annualEnergy, energyClass, volume, type] = line.split(",");
      
      // Calculate running cost (assuming £0.30 per kWh)
      const runningCostPerYear = Math.round(parseFloat(annualEnergy) * 0.30);
      
      return {
        id: index + 1,
        name: name.trim(),
        manufacturer: manufacturer.trim(),
        modelNo: modelNo.trim(),
        category: category.trim(),
        powerUseKwhPerYear: parseFloat(annualEnergy),
        energyRating: energyClass.trim(),
        volume: volume ? parseFloat(volume) : null,
        type: type ? type.trim() : null,
        runningCostPerYear: runningCostPerYear,
        description: `${name.trim()} - ${energyClass.trim()} rated ${category.trim()} with ${annualEnergy} kWh/year consumption.`
      };
    });
    
    console.log(`Successfully loaded ${products.length} products from CSV`);
    return products;
  } catch (error) {
    console.error("Error loading CSV:", error);
    console.error("Current directory:", __dirname);
    console.error("Trying to access:", path.join(__dirname, "data", "eu_refrigerators.csv"));
    
    // Fallback to some basic data if CSV fails
    return [
      {
        id: 1,
        name: "CoolMaster 3000",
        manufacturer: "Whirlpool",
        modelNo: "CM3000",
        category: "Refrigerator",
        powerUseKwhPerYear: 120,
        energyRating: "A++",
        runningCostPerYear: 36,
        description: "CoolMaster 3000 - A++ rated Refrigerator with 120 kWh/year consumption."
      }
    ];
  }
}

// Load products from CSV
const products = loadProductsFromCSV();

// GET /products - Return all products
app.get("/products", (req, res) => {
  res.json(products);
});

// GET /products/:id - Return specific product
app.get("/products/:id", (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Product not found" });
  }
});

// GET / - Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "Energy Calculator API is running!",
    productsCount: products.length,
    endpoints: ["/products", "/products/:id"]
  });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Loaded ${products.length} products from CSV`);
  console.log("Available endpoints:");
  console.log("- GET /products - List all products");
  console.log("- GET /products/:id - Get specific product");
});
