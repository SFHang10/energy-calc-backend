# 🚀 Wix Integration Guide for Energy Calculator Membership

## **Overview**
This guide will help you integrate your professional membership system with Wix, allowing your users to access a beautiful membership area through your Wix website.

## **🏗️ What We're Building**
- **Professional membership portal** accessible via Wix
- **User registration and login** through Wix
- **Subscription management** with Stripe integration
- **Member-only content** and resources
- **Seamless user experience** on your Wix site

## **📋 Prerequisites**
1. ✅ **Your membership backend** running on port 4000
2. ✅ **Wix website** (free or premium plan)
3. ✅ **Stripe account** for payments
4. ✅ **Domain name** (optional but recommended)

## **🔧 Step 1: Install MCP Dependencies**
```bash
npm install @modelcontextprotocol/sdk
```

## **🔧 Step 2: Start Your MCP Server**
```bash
node wix-mcp-server.js
```

## **🔧 Step 3: Wix Setup**

### **3.1 Create Membership Pages in Wix**
1. **Login to Wix** and open your website
2. **Add new pages:**
   - `/members` - Main membership portal
   - `/members/login` - User login
   - `/members/register` - User registration
   - `/members/dashboard` - Member dashboard
   - `/members/subscriptions` - Subscription management

### **3.2 Add Custom Code to Wix**
In your Wix page settings, add this JavaScript:

```javascript
// Wix Membership Integration
window.addEventListener('load', function() {
  // Initialize membership system
  initMembershipSystem();
});

function initMembershipSystem() {
  const API_BASE = 'http://localhost:4000/api';
  
  // Check if user is logged in
  checkUserStatus();
  
  // Setup event listeners
  setupEventListeners();
}

function checkUserStatus() {
  const token = localStorage.getItem('membership_token');
  if (token) {
    // User is logged in, show dashboard
    showMemberDashboard();
  } else {
    // User not logged in, show login/register
    showLoginForm();
  }
}

function setupEventListeners() {
  // Login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
  
  // Registration form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegistration);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const password = formData.get('password');
  
  try {
    const response = await fetch(`${API_BASE}/members/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('membership_token', data.token);
      showMemberDashboard();
    } else {
      showError('Login failed: ' + data.message);
    }
  } catch (error) {
    showError('Login error: ' + error.message);
  }
}

async function handleRegistration(event) {
  event.preventDefault();
  
  const formData = new FormData(event.target);
  const email = formData.get('email');
  const firstName = formData.get('firstName');
  const lastName = formData.get('lastName');
  const subscriptionTier = formData.get('subscriptionTier');
  
  try {
    const response = await fetch(`${API_BASE}/members/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, lastName, subscriptionTier })
    });
    
    const data = await response.json();
    
    if (data.success) {
      showSuccess('Registration successful! Please check your email.');
      showLoginForm();
    } else {
      showError('Registration failed: ' + data.message);
    }
  } catch (error) {
    showError('Registration error: ' + error.message);
  }
}

function showMemberDashboard() {
  // Hide login/register forms
  hideAuthForms();
  
  // Show member dashboard
  const dashboard = document.getElementById('member-dashboard');
  if (dashboard) {
    dashboard.style.display = 'block';
    loadMemberData();
  }
}

function showLoginForm() {
  // Hide dashboard
  const dashboard = document.getElementById('member-dashboard');
  if (dashboard) dashboard.style.display = 'none';
  
  // Show login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.style.display = 'block';
}

function hideAuthForms() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
}

async function loadMemberData() {
  const token = localStorage.getItem('membership_token');
  if (!token) return;
  
  try {
    const response = await fetch(`${API_BASE}/members/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const memberData = await response.json();
    displayMemberData(memberData);
  } catch (error) {
    console.error('Error loading member data:', error);
  }
}

function displayMemberData(data) {
  // Update dashboard with member information
  const nameElement = document.getElementById('member-name');
  const emailElement = document.getElementById('member-email');
  const tierElement = document.getElementById('subscription-tier');
  
  if (nameElement) nameElement.textContent = `${data.firstName} ${data.lastName}`;
  if (emailElement) emailElement.textContent = data.email;
  if (tierElement) tierElement.textContent = data.subscriptionTier;
}

function showError(message) {
  // Display error message to user
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
  }
}

function showSuccess(message) {
  // Display success message to user
  const successDiv = document.getElementById('success-message');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => successDiv.style.display = 'none', 5000);
  }
}
```

## **🔧 Step 4: Create Wix Page Structure**

### **4.1 Membership Portal Page (`/members`)**
```html
<div class="membership-portal">
  <h1>Welcome to Your Energy Calculator Membership</h1>
  
  <!-- Login Form -->
  <div id="login-form" class="auth-form">
    <h2>Member Login</h2>
    <form>
      <input type="email" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>
    <p>Don't have an account? <a href="#" onclick="showRegisterForm()">Register here</a></p>
  </div>
  
  <!-- Registration Form -->
  <div id="register-form" class="auth-form" style="display: none;">
    <h2>Create Account</h2>
    <form>
      <input type="text" name="firstName" placeholder="First Name" required>
      <input type="text" name="lastName" placeholder="Last Name" required>
      <input type="email" name="email" placeholder="Email" required>
      <select name="subscriptionTier" required>
        <option value="">Select Subscription Tier</option>
        <option value="basic">Basic - $9.99/month</option>
        <option value="premium">Premium - $19.99/month</option>
        <option value="enterprise">Enterprise - $49.99/month</option>
      </select>
      <button type="submit">Create Account</button>
    </form>
    <p>Already have an account? <a href="#" onclick="showLoginForm()">Login here</a></p>
  </div>
  
  <!-- Member Dashboard -->
  <div id="member-dashboard" class="dashboard" style="display: none;">
    <h2>Welcome, <span id="member-name">Member</span>!</h2>
    <div class="member-info">
      <p><strong>Email:</strong> <span id="member-email"></span></p>
      <p><strong>Subscription:</strong> <span id="subscription-tier"></span></p>
    </div>
    
    <div class="member-actions">
      <button onclick="manageSubscription()">Manage Subscription</button>
      <button onclick="viewContent()">View Member Content</button>
      <button onclick="logout()">Logout</button>
    </div>
  </div>
  
  <!-- Messages -->
  <div id="error-message" class="error-message" style="display: none;"></div>
  <div id="success-message" class="success-message" style="display: none;"></div>
</div>
```

## **🔧 Step 5: Add CSS Styling**
Add this CSS to your Wix page for professional styling:

```css
.membership-portal {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: 'Arial', sans-serif;
}

.auth-form {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  margin: 20px 0;
}

.auth-form h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.auth-form input,
.auth-form select {
  width: 100%;
  padding: 12px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.auth-form button {
  width: 100%;
  padding: 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 10px;
}

.auth-form button:hover {
  background: #2980b9;
}

.dashboard {
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.member-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin: 20px 0;
}

.member-actions button {
  padding: 10px 20px;
  margin: 5px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.member-actions button:hover {
  background: #229954;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
  text-align: center;
}

.success-message {
  background: #27ae60;
  color: white;
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
  text-align: center;
}
```

## **🚀 Next Steps**
1. **Test locally** with your MCP server
2. **Deploy to production** server (not localhost)
3. **Update API URLs** in Wix code
4. **Test user registration and login**
5. **Verify payment processing**
6. **Go live** with your membership platform!

## **📞 Support**
If you need help with any step, let me know! Your membership system is ready to go professional! 🎯✨


