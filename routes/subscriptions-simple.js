const express = require('express');
const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Subscriptions route working' });
});

// Get current subscription for a member
router.get('/current', (req, res) => {
  // This would typically check the database for current subscription
  // For now, returning a mock response
  res.json({
    subscription: {
      tier: 'Free',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: null,
      features: ['Basic content access', 'Community forum']
    }
  });
});

// Create checkout session for Stripe payment
router.post('/create-checkout-session', (req, res) => {
  const { subscriptionTier, memberId } = req.body;
  
  // Mock Stripe checkout session creation
  // In production, this would integrate with Stripe
  res.json({
    sessionId: 'mock_session_' + Date.now(),
    url: 'https://checkout.stripe.com/mock',
    subscriptionTier,
    memberId
  });
});

// Get payment history
router.get('/payment-history', (req, res) => {
  // Mock payment history
  res.json({
    payments: [
      {
        id: 'pay_1',
        amount: 29.99,
        currency: 'eur',
        status: 'succeeded',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Premium Monthly Subscription'
      },
      {
        id: 'pay_2',
        amount: 29.99,
        currency: 'eur',
        status: 'succeeded',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Premium Monthly Subscription'
      }
    ]
  });
});

// Cancel subscription
router.post('/cancel', (req, res) => {
  const { subscriptionId } = req.body;
  
  // Mock subscription cancellation
  res.json({
    message: 'Subscription cancelled successfully',
    subscriptionId,
    cancelledAt: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // End of current period
  });
});

// Webhook for Stripe events (mock)
router.post('/webhook', (req, res) => {
  // Mock webhook handling
  res.json({
    message: 'Webhook received',
    timestamp: new Date().toISOString()
  });
});

// Get subscription plans
router.get('/plans', (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'eur',
        features: ['Basic content access', 'Community forum', 'Newsletter'],
        description: 'Perfect for getting started'
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 29.99,
        currency: 'eur',
        interval: 'month',
        features: ['All Free features', 'Premium content', 'Priority support', 'Advanced tools'],
        description: 'For professionals and enthusiasts'
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99.99,
        currency: 'eur',
        interval: 'month',
        features: ['All Premium features', 'Custom integrations', 'Dedicated support', 'Team management'],
        description: 'For teams and organizations'
      }
    ]
  });
});

module.exports = router;