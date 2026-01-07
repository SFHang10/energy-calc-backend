# Energy Calculator Backend API

This is the deployed API for the Greenways Market energy calculator.

## Project Structure
```
energy-cal-backend/
├── app.js                 # Main Express server
├── package.json           # Dependencies
├── data/
│   └── eu_refrigerators.csv  # Real product data
└── README.md
```

## API Endpoints

- `GET /` - Health check
- `GET /products` - List all energy-efficient products
- `GET /products/:id` - Get specific product by ID

## Data Source

The API reads from `data/eu_refrigerators.csv` which contains real refrigerator data with:
- Product names and manufacturers
- Energy consumption (kWh/year)
- Energy ratings (A, A+, A++)
- Running costs (calculated at £0.30/kWh)

## Deployment

This API is deployed on Render and serves the Greenways Market Wix site. 