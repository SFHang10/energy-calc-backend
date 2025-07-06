const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Reads and parses the EU refrigerators CSV file
async function fetchEPRELProducts() {
  const results = [];
  const filePath = path.join(__dirname, '../../data/eu_refrigerators.csv');
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        results.push({
          name: row['Product Name'],
          manufacturer: row['Manufacturer'],
          modelNo: row['Model Number'],
          category: row['Category'],
          power: Number(row['Annual Energy Consumption (kWh/year)']),
          energyRating: row['Energy Class'],
          source: 'eprel',
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', reject);
  });
}

module.exports = { fetchEPRELProducts }; 