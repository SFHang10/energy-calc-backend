# How the Membership System Works - Complete Explanation

## 🏗️ **System Architecture**

The membership system is a **full-stack web application** with three main parts:

### 1. **Backend (Node.js/Express)** - The Server
**Location:** `routes/members.js`, `server-new.js`

- **What it does:** Handles all the business logic, database operations, and API endpoints
- **Technology:** Node.js with Express framework
- **Database:** SQLite (`database/members.db`)

**Key Endpoints:**
```
POST /api/members/register    - Create new member account
POST /api/members/login       - Authenticate member
GET  /api/members/profile     - Get member info (requires login)
GET  /api/members/subscription-tiers - Get pricing plans
GET  /api/members/unified-status - Get membership status for both sites
```

### 2. **Database (SQLite)** - Data Storage
**Location:** `database/members.db`

**Tables:**
- `members` - Stores user accounts (email, password hash, subscription info)
- `subscription_tiers` - Stores pricing plans (Basic, Premium, Professional, Enterprise)
- `content` - Stores member-accessible content

**Example Data:**
```sql
-- Members table
id | email | password_hash | first_name | subscription_tier
1  | user@example.com | $2a$10$... | John | Premium

-- Subscription_tiers table
id | name | price | price_monthly | features
1  | Premium Member | 20 | 20 | Advanced calculators, Data storage
```

### 3. **Frontend (HTML/CSS/JavaScript)** - The User Interface
**Location:** `wix-integration/members-section.html`, `wix-integration/unified-membership-dashboard.html`

- **What it does:** The visual interface users see and interact with
- **Technology:** HTML for structure, CSS for styling, JavaScript for interactivity

---

## 🔄 **How It All Works Together**

### **Step 1: User Opens the Page**
```
User opens: members-section.html
↓
HTML loads in browser
↓
JavaScript runs and checks if user is logged in
```

### **Step 2: User Registers/Logs In**
```
User fills out form (HTML)
↓
JavaScript sends data to: POST /api/members/register
↓
Backend (Node.js) receives request
↓
Backend checks database for existing user
↓
Backend hashes password and saves to database
↓
Backend returns JWT token
↓
JavaScript stores token in browser (localStorage)
↓
User is now logged in!
```

### **Step 3: Displaying Subscription Tiers**
```
Page loads
↓
JavaScript calls: GET /api/members/subscription-tiers
↓
Backend queries database: SELECT * FROM subscription_tiers
↓
Backend returns JSON: { tiers: [...] }
↓
JavaScript receives data
↓
JavaScript creates HTML cards dynamically
↓
User sees pricing plans displayed
```

### **Step 4: Accessing Member Content**
```
User clicks "View Content"
↓
JavaScript calls: GET /api/members/content (with auth token)
↓
Backend verifies JWT token
↓
Backend checks user's subscription_tier
↓
Backend queries: SELECT * FROM content WHERE required_tier <= user_tier
↓
Backend returns filtered content
↓
JavaScript displays content cards
```

---

## 📁 **File Structure Explained**

```
energy-cal-backend/
├── routes/
│   └── members.js              ← Backend API endpoints (Node.js)
│
├── database/
│   ├── members.db              ← SQLite database file
│   ├── migrate-members-schema.js ← Database setup script
│   └── seed-subscription-tiers.js ← Populate pricing plans
│
├── wix-integration/
│   ├── members-section.html    ← Main membership page (HTML/CSS/JS)
│   └── unified-membership-dashboard.html ← Unified dashboard
│
└── server-new.js               ← Express server setup
```

---

## 🎨 **HTML Files - What They Do**

### **members-section.html**
- **Purpose:** Main membership page where users can register, login, and see plans
- **Contains:**
  - HTML structure (forms, buttons, cards)
  - CSS styling (colors, layout, animations)
  - JavaScript code (API calls, form handling, dynamic content)

**Key JavaScript Functions:**
```javascript
// Loads pricing plans from API
async function loadSubscriptionTiers() {
  const data = await apiCall('/api/members/subscription-tiers');
  displaySubscriptionTiers(data.tiers);
}

// Handles user login
document.getElementById('login-form').addEventListener('submit', async function(e) {
  const response = await fetch('/api/members/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  // Store token and show dashboard
});
```

### **unified-membership-dashboard.html**
- **Purpose:** Shows unified membership status for both Greenways Buildings and Marketplace
- **Features:**
  - Displays access status for both Wix sites
  - Shows subscription tier
  - Content filtering by site

---

## 🔐 **Authentication Flow**

```
1. User enters email/password
   ↓
2. Frontend sends to: POST /api/members/login
   ↓
3. Backend checks database for user
   ↓
4. Backend compares password hash
   ↓
5. Backend generates JWT token
   ↓
6. Frontend stores token: localStorage.setItem('token', ...)
   ↓
7. Future requests include: Authorization: Bearer <token>
   ↓
8. Backend verifies token before allowing access
```

---

## 💾 **Database Operations**

### **Registration:**
```javascript
// Backend code (routes/members.js)
db.run(`
  INSERT INTO members (email, password_hash, first_name, ...)
  VALUES (?, ?, ?, ...)
`, [email, hashedPassword, firstName, ...]);
```

### **Login:**
```javascript
// Backend checks database
db.get('SELECT * FROM members WHERE email = ?', [email], (err, user) => {
  // Compare password
  // Generate JWT token
});
```

### **Getting Plans:**
```javascript
// Backend queries database
db.all('SELECT * FROM subscription_tiers ORDER BY price_monthly ASC', (err, tiers) => {
  res.json({ tiers });
});
```

---

## 🌐 **API Communication**

### **Frontend → Backend:**
```javascript
// JavaScript in HTML file
fetch('http://localhost:4000/api/members/subscription-tiers')
  .then(response => response.json())
  .then(data => {
    // Use the data to update HTML
    displayPlans(data.tiers);
  });
```

### **Backend Response:**
```json
{
  "tiers": [
    {
      "id": 1,
      "name": "Premium Member",
      "price": 20,
      "price_monthly": 20,
      "features": "Advanced calculators, Data storage"
    }
  ]
}
```

---

## 🎯 **Key Technologies**

1. **HTML** - Structure of the page (forms, buttons, divs)
2. **CSS** - Styling (colors, layout, animations)
3. **JavaScript** - Interactivity (API calls, form handling, dynamic updates)
4. **Node.js** - Server runtime
5. **Express** - Web framework for API endpoints
6. **SQLite** - Database for storing data
7. **JWT** - Authentication tokens

---

## 📱 **How Users Interact**

1. **Open HTML file** in browser
2. **See login/register form** (HTML structure)
3. **Fill out form** (HTML input fields)
4. **Click button** (JavaScript event handler)
5. **JavaScript sends request** to backend API
6. **Backend processes** and returns data
7. **JavaScript updates page** with results
8. **User sees updated content** (dynamic HTML)

---

## 🔗 **Integration with Wix**

The system is designed to work with Wix sites:
- **Greenways Buildings** (Site ID: `d9c9c6b1-f79a-49a3-8183-4c5a8e24a413`)
- **Greenways Marketplace** (Site ID: `cfa82ec2-a075-4152-9799-6a1dd5c01ef4`)

**Wix Integration:**
- Members can be linked to Wix members via `wix_member_id`
- Pricing plans can be synced from Wix Pricing Plans API
- Subscription status can be synced from Wix

---

## ✅ **Summary**

**It's not just HTML** - it's a complete web application:
- **HTML** provides the structure
- **CSS** makes it look good
- **JavaScript** makes it interactive
- **Node.js/Express** handles the backend logic
- **SQLite** stores the data
- **All work together** to create a functional membership system

The HTML files are the **frontend** (what users see), but they communicate with the **backend** (Node.js server) which accesses the **database** (SQLite) to store and retrieve member information.








