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
    subscription_tier TEXT DEFAULT 'Free',
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
    required_tier TEXT DEFAULT 'Free',
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
    ('Energy Efficient Washing Machines Guide', 'Complete guide to choosing the most energy-efficient washing machines for your home', 'guide', '/content/washing-machines-guide', 'Appliances', 'Free', 'washing machine,energy efficient,appliances'),
    ('Green Building Materials Directory', 'Comprehensive directory of sustainable building materials and suppliers', 'directory', '/content/green-materials', 'Building Materials', 'Green Member', 'building materials,sustainable,construction'),
    ('Restaurant Energy Savings Calculator', 'Interactive tool to calculate potential energy savings for restaurants', 'tool', '/content/restaurant-calculator', 'Business Tools', 'Eco Professional', 'restaurant,energy savings,business'),
    ('Natural Paint Selection Guide', 'Expert guide to choosing eco-friendly paints for your home or business', 'guide', '/content/natural-paints', 'Paints & Finishes', 'Green Member', 'natural paint,eco-friendly,finishes'),
    ('Solar Panel ROI Calculator', 'Advanced calculator to determine return on investment for solar installations', 'tool', '/content/solar-roi', 'Renewable Energy', 'Eco Professional', 'solar,ROI,renewable energy')
  `);

  // Create interest_categories table (if not exists)
  db.run(`CREATE TABLE IF NOT EXISTS interest_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Create user_notifications table (if not exists)
  db.run(`CREATE TABLE IF NOT EXISTS user_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    content_id INTEGER,
    notification_type TEXT NOT NULL DEFAULT 'content_match',
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members (id),
    FOREIGN KEY (content_id) REFERENCES content (id)
  )`);

  // Create indexes for performance
  db.run(`CREATE INDEX IF NOT EXISTS idx_member_interests_member_id ON member_interests(member_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_notifications_member_id ON user_notifications(member_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read)`);

  // Insert default interest categories
  db.run(`INSERT OR IGNORE INTO interest_categories (name, description, icon) VALUES 
    ('Energy Saving', 'Products and solutions that help reduce energy consumption', '⚡'),
    ('Energy Generating', 'Renewable energy generation systems and solutions', '🔋'),
    ('Water Saving', 'Products and solutions that help conserve water', '💧'),
    ('Water Regeneration', 'Water recycling and regeneration systems', '♻️'),
    ('Gas Saving', 'Solutions to reduce gas consumption and improve efficiency', '🔥'),
    ('Alternative Fuel Solutions', 'Alternative and renewable fuel options', '🌿'),
    ('Home Energy', 'Energy solutions specifically for residential homes', '🏠'),
    ('Restaurant Energy', 'Energy efficiency solutions for restaurants and food service', '🍽️'),
    ('Office Buildings and Offices', 'Energy solutions for commercial office buildings', '🏢')
  `);

  console.log('✅ Database setup completed successfully!');
  console.log('✅ Interest categories and notifications system initialized!');
});

module.exports = db;