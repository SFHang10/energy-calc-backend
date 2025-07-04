require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Product = require('./src/models/Product');

const MONGO_URI = process.env.MONGO_URI;
const CSV_PATH = path.join(__dirname, 'data', 'eu_refrigerators.csv');

async function importCSV() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  let imported = 0;
  let updated = 0;
  const products = [];

  fs.createReadStream(CSV_PATH)
    .pipe(csv())
    .on('data', (row) => {
      products.push(row);
    })
    .on('end', async () => {
      for (const prod of products) {
        const doc = {
          name: prod['Product Name'],
          category: prod['Category'],
          power: parseFloat(prod['Power Consumption (kWh/year)']),
          energyRating: prod['Energy Rating'],
          manufacturer: prod['Manufacturer'],
          modelNo: prod['Model No.']
        };
        const result = await Product.findOneAndUpdate(
          { name: doc.name, manufacturer: doc.manufacturer, modelNo: doc.modelNo },
          doc,
          { upsert: true, new: true }
        );
        if (result.wasNew) {
          imported++;
        } else {
          updated++;
        }
      }
      console.log(`Imported: ${imported}, Updated: ${updated}, Total: ${products.length}`);
      mongoose.disconnect();
    });
}

importCSV().catch(err => {
  console.error('Import failed:', err);
  mongoose.disconnect();
}); 