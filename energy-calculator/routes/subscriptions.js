const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize Stripe with error handling
let stripe;
try {
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key');
} catch (error) {
  console.error('Stripe initialization failed:', error.message);
  // Create a mock stripe object for development
  stripe = {
    checkout: {
      sessions: {
        create: async () => ({ id: 'mock_session', url: 'https://example.com' })
      }
    },
    webhooks: {
      constructEvent: () => ({ type: 'mock_event' })
    },
    subscriptions: {
      retrieve: async () => ({ customer: 'mock_customer' })
    },
    customers: {
      retrieve: async () => ({ email: 'mock@example.com' })
    }
  };
}

const router = express.Router();

// Database connection
const dbPath = path.join(__dirname, '../database/members.db');
const db = new sqlite3.Database(dbPath);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/subscriptions/create-checkout-session - Create Stripe checkout session
router.post('/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { tierName, billingCycle } = req.body;

    if (!tierName || !billingCycle) {
      return res.status(400).json({ error: 'Tier name and billing cycle are required' });
    }

    // Get tier details from database
    db.get('SELECT * FROM subscription_tiers WHERE name = ?', [tierName], async (err, tier) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tier details' });
      }
      if (!tier) {
        return res.status(404).json({ error: 'Subscription tier not found' });
      }

      const price = billingCycle === 'yearly' ? tier.price_yearly : tier.price_monthly;
      const interval = billingCycle === 'yearly' ? 'year' : 'month';

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `${tierName} Subscription`,
                description: tier.features,
              },
              unit_amount: Math.round(price * 100), // Convert to cents
              recurring: {
                interval: interval,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.WIX_SITE_URL || 'https://your-wix-site.com'}/members/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.WIX_SITE_URL || 'https://your-wix-site.com'}/members/cancel`,
        customer_email: req.user.email,
        metadata: {
          memberId: req.user.id,
          tierName: tierName,
          billingCycle: billingCycle
        }
      });

      res.json({ sessionId: session.id, url: session.url });
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// POST /api/subscriptions/webhook - Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_webhook_secret';

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutCompleted(session);
      break;
    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      await handlePaymentSucceeded(invoice);
      break;
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object;
      await handlePaymentFailed(failedInvoice);
      break;
    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      await handleSubscriptionDeleted(subscription);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Handle successful checkout
async function handleCheckoutCompleted(session) {
  const { memberId, tierName, billingCycle } = session.metadata;
  
  // Update member's subscription
  db.run(`
    UPDATE members 
    SET subscription_tier = ?, subscription_status = 'active'
    WHERE id = ?
  `, [tierName, memberId]);

  // Record payment
  db.run(`
    INSERT INTO payments (member_id, stripe_payment_id, amount, subscription_tier, payment_status)
    VALUES (?, ?, ?, ?, ?)
  `, [memberId, session.subscription, session.amount_total / 100, tierName, 'succeeded']);

  console.log(`Member ${memberId} upgraded to ${tierName}`);
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Find member by email
  db.get('SELECT id FROM members WHERE email = ?', [customer.email], (err, member) => {
    if (err || !member) {
      console.error('Member not found for payment:', customer.email);
      return;
    }

    // Record payment
    db.run(`
      INSERT INTO payments (member_id, stripe_payment_id, amount, subscription_tier, payment_status)
      VALUES (?, ?, ?, ?, ?)
    `, [member.id, invoice.subscription, invoice.amount_paid / 100, 'recurring', 'succeeded']);
  });
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Find member by email and update status
  db.get('SELECT id FROM members WHERE email = ?', [customer.email], (err, member) => {
    if (err || !member) {
      console.error('Member not found for failed payment:', customer.email);
      return;
    }

    // Update subscription status
    db.run(`
      UPDATE members 
      SET subscription_status = 'past_due'
      WHERE id = ?
    `, [member.id]);
  });
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Find member by email and downgrade to free
  db.get('SELECT id FROM members WHERE email = ?', [customer.email], (err, member) => {
    if (err || !member) {
      console.error('Member not found for subscription deletion:', customer.email);
      return;
    }

    // Downgrade to free tier
    db.run(`
      UPDATE members 
      SET subscription_tier = 'Free', subscription_status = 'active'
      WHERE id = ?
    `, [member.id]);
  });
}

// GET /api/subscriptions/current - Get current subscription details
router.get('/current', authenticateToken, (req, res) => {
  db.get(`
    SELECT subscription_tier, subscription_status, created_at
    FROM members WHERE id = ?
  `, [req.user.id], (err, member) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch subscription details' });
    }

    // Get tier details
    db.get('SELECT * FROM subscription_tiers WHERE name = ?', [member.subscription_tier], (err, tier) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch tier details' });
      }

      res.json({
        currentTier: member.subscription_tier,
        status: member.subscription_status,
        features: tier ? tier.features : '',
        priceMonthly: tier ? tier.price_monthly : 0,
        priceYearly: tier ? tier.price_yearly : 0
      });
    });
  });
});

// GET /api/subscriptions/payment-history - Get payment history
router.get('/payment-history', authenticateToken, (req, res) => {
  db.all(`
    SELECT amount, currency, subscription_tier, payment_status, created_at
    FROM payments 
    WHERE member_id = ? 
    ORDER BY created_at DESC
  `, [req.user.id], (err, payments) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payment history' });
    }
    res.json(payments);
  });
});

// POST /api/subscriptions/cancel - Cancel subscription
router.post('/cancel', authenticateToken, async (req, res) => {
  try {
    // Get member's current subscription
    db.get('SELECT subscription_tier FROM members WHERE id = ?', [req.user.id], async (err, member) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch member details' });
      }

      if (member.subscription_tier === 'Free') {
        return res.status(400).json({ error: 'Free members cannot cancel subscription' });
      }

      // In a real implementation, you would cancel the Stripe subscription here
      // For now, we'll just downgrade to free
      db.run(`
        UPDATE members 
        SET subscription_tier = 'Free', subscription_status = 'active'
        WHERE id = ?
      `, [req.user.id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to cancel subscription' });
        }

        res.json({ message: 'Subscription cancelled successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

module.exports = router;
