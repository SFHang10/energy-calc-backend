const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database directory if it doesn't exist
const dbPath = path.join(__dirname, 'members.db');

// Initialize database
const db = new sqlite3.Database(dbPath);

// Create tables
db.serialize(() => {
  // Members table
  db.run(`CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    interests TEXT,
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_verified BOOLEAN DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_expires DATETIME
  )`);

  // Subscription tiers table
  db.run(`CREATE TABLE IF NOT EXISTS subscription_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2) NOT NULL,
    features TEXT NOT NULL,
    max_content_access INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Content table
  db.run(`CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT NOT NULL,
    content_url TEXT,
    thumbnail_url TEXT,
    required_tier TEXT DEFAULT 'free',
    category TEXT NOT NULL,
    tags TEXT,
    is_published BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Member interests table
  db.run(`CREATE TABLE IF NOT EXISTS member_interests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    interest TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members (id)
  )`);

  // Payment history table
  db.run(`CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    stripe_payment_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EUR',
    subscription_tier TEXT NOT NULL,
    payment_status TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members (id)
  )`);

  // Insert default subscription tiers
  db.run(`INSERT OR IGNORE INTO subscription_tiers (name, price_monthly, price_yearly, features, max_content_access) VALUES 
    ('Free', 0.00, 0.00, 'Basic access to green energy content, limited product recommendations', 5),
    ('Green Member', 9.99, 99.99, 'Full access to sustainability guides, exclusive product reviews, community forum access', 50),
    ('Eco Professional', 19.99, 199.99, 'All Green Member features plus business tools, priority support, custom sustainability reports', 999),
    ('Sustainability Partner', 49.99, 499.99, 'All features plus white-label solutions, API access, dedicated account manager', 9999)
  `);

  // Insert sample content
  db.run(`INSERT OR IGNORE INTO content (title, description, content_type, content_url, category, required_tier, tags) VALUES 
    ('Energy Efficient Washing Machines Guide', 'Complete guide to choosing the most energy-efficient washing machines for your home', 'guide', '/content/washing-machines-guide', 'Appliances', 'free', 'washing machine,energy efficient,appliances'),
    ('Green Building Materials Directory', 'Comprehensive directory of sustainable building materials and suppliers', 'directory', '/content/green-materials', 'Building Materials', 'Green Member', 'building materials,sustainable,construction'),
    ('Restaurant Energy Savings Calculator', 'Interactive tool to calculate potential energy savings for restaurants', 'tool', '/content/restaurant-calculator', 'Business Tools', 'Eco Professional', 'restaurant,energy savings,business'),
    ('Natural Paint Selection Guide', 'Expert guide to choosing eco-friendly paints for your home or business', 'guide', '/content/natural-paints', 'Paints & Finishes', 'Green Member', 'natural paint,eco-friendly,finishes'),
    ('Solar Panel ROI Calculator', 'Advanced calculator to determine return on investment for solar installations', 'tool', '/content/solar-roi', 'Renewable Energy', 'Eco Professional', 'solar,ROI,renewable energy')
  `);

  console.log('✅ Database setup completed successfully!');
});

module.exports = db;
