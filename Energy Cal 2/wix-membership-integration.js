// 🚀 Energy Calculator Membership Integration for Wix
// Copy this entire file into your Wix page's custom code section

(function() {
  'use strict';
  
  // Configuration - Update these URLs when you deploy to production
  const CONFIG = {
    API_BASE: 'http://localhost:4000/api', // Change to your production URL
    STORAGE_KEY: 'energy_calc_membership_token',
    DEBUG: true
  };
  
  // Utility functions
  function log(message) {
    if (CONFIG.DEBUG) console.log('[Membership]', message);
  }
  
  function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message-display');
    if (messageDiv) {
      messageDiv.textContent = message;
      messageDiv.className = `message ${type}`;
      messageDiv.style.display = 'block';
      setTimeout(() => messageDiv.style.display = 'none', 5000);
    }
  }
  
  function showError(message) {
    showMessage(message, 'error');
  }
  
  function showSuccess(message) {
    showMessage(message, 'success');
  }
  
  function showInfo(message) {
    showMessage(message, 'info');
  }
  
  // API functions
  async function apiCall(endpoint, options = {}) {
    try {
      const url = `${CONFIG.API_BASE}${endpoint}`;
      log(`API Call: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      log(`API Response:`, data);
      return data;
    } catch (error) {
      log(`API Error: ${error.message}`);
      throw error;
    }
  }
  
  // Authentication functions
  function isLoggedIn() {
    return !!localStorage.getItem(CONFIG.STORAGE_KEY);
  }
  
  function getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEY);
  }
  
  function setToken(token) {
    localStorage.setItem(CONFIG.STORAGE_KEY, token);
  }
  
  function clearToken() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  }
  
  // UI State Management
  function showSection(sectionId) {
    const sections = ['login-section', 'register-section', 'dashboard-section'];
    sections.forEach(id => {
      const section = document.getElementById(id);
      if (section) section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) targetSection.style.display = 'block';
  }
  
  // Event Handlers
  async function handleLogin(event) {
    event.preventDefault();
    showInfo('Logging in...');
    
    try {
      const formData = new FormData(event.target);
      const email = formData.get('email');
      const password = formData.get('password');
      
      const data = await apiCall('/members/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (data.success && data.token) {
        setToken(data.token);
        showSuccess('Login successful!');
        showSection('dashboard-section');
        loadDashboard();
      } else {
        showError(data.message || 'Login failed');
      }
    } catch (error) {
      showError(`Login error: ${error.message}`);
    }
  }
  
  async function handleRegistration(event) {
    event.preventDefault();
    showInfo('Creating account...');
    
    try {
      const formData = new FormData(event.target);
      const userData = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        subscriptionTier: formData.get('subscriptionTier')
      };
      
      const data = await apiCall('/members/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (data.success) {
        showSuccess('Account created successfully! Please log in.');
        showSection('login-section');
        event.target.reset();
      } else {
        showError(data.message || 'Registration failed');
      }
    } catch (error) {
      showError(`Registration error: ${error.message}`);
    }
  }
  
  async function handleLogout() {
    clearToken();
    showSuccess('Logged out successfully');
    showSection('login-section');
  }
  
  // Dashboard functions
  async function loadDashboard() {
    try {
      const token = getToken();
      if (!token) return;
      
      const data = await apiCall('/members/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (data.success) {
        displayUserInfo(data.user);
        loadSubscriptionInfo();
      } else {
        showError('Failed to load profile');
      }
    } catch (error) {
      showError(`Dashboard error: ${error.message}`);
    }
  }
  
  function displayUserInfo(user) {
    const nameElement = document.getElementById('user-name');
    const emailElement = document.getElementById('user-email');
    
    if (nameElement) nameElement.textContent = `${user.firstName} ${user.lastName}`;
    if (emailElement) emailElement.textContent = user.email;
  }
  
  async function loadSubscriptionInfo() {
    try {
      const token = getToken();
      if (!token) return;
      
      const data = await apiCall('/members/subscription-tiers');
      if (data.success) {
        displaySubscriptionTiers(data.tiers);
      }
    } catch (error) {
      log(`Subscription error: ${error.message}`);
    }
  }
  
  function displaySubscriptionTiers(tiers) {
    const container = document.getElementById('subscription-tiers');
    if (!container) return;
    
    container.innerHTML = tiers.map(tier => `
      <div class="tier-card">
        <h3>${tier.name}</h3>
        <p class="price">$${tier.price}/month</p>
        <ul>
          ${tier.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }
  
  // Payment functions
  async function createCheckoutSession(subscriptionTier) {
    try {
      const token = getToken();
      if (!token) {
        showError('Please log in to subscribe');
        return;
      }
      
      showInfo('Creating checkout session...');
      
      const data = await apiCall('/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subscriptionTier })
      });
      
      if (data.success && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        showError('Failed to create checkout session');
      }
    } catch (error) {
      showError(`Payment error: ${error.message}`);
    }
  }
  
  // Content functions
  async function loadMemberContent() {
    try {
      const token = getToken();
      if (!token) return;
      
      const data = await apiCall('/members/content', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (data.success) {
        displayMemberContent(data.content);
      }
    } catch (error) {
      showError(`Content error: ${error.message}`);
    }
  }
  
  function displayMemberContent(content) {
    const container = document.getElementById('member-content');
    if (!container) return;
    
    container.innerHTML = content.map(item => `
      <div class="content-item">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        ${item.link ? `<a href="${item.link}" target="_blank">View Content</a>` : ''}
      </div>
    `).join('');
  }
  
  // Initialize the system
  function init() {
    log('Initializing membership system...');
    
    // Setup event listeners
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', handleRegistration);
    }
    
    if (logoutBtn) {
      logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Check authentication status
    if (isLoggedIn()) {
      showSection('dashboard-section');
      loadDashboard();
    } else {
      showSection('login-section');
    }
    
    log('Membership system initialized');
  }
  
  // Public functions for Wix integration
  window.EnergyCalculatorMembership = {
    init,
    login: handleLogin,
    register: handleRegistration,
    logout: handleLogout,
    createCheckout: createCheckoutSession,
    loadContent: loadMemberContent,
    isLoggedIn,
    getToken
  };
  
  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();


