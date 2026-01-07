const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');

// Import fetch for Node.js compatibility
const fetch = require('node-fetch');

// Initialize MCP Server
const server = new Server(
  {
    name: 'energy-calculator-membership',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool: Get User Membership Status
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'get_user_membership':
      try {
        const { wixUserId, email } = args;
        
        // Call your membership API
        const response = await fetch(`http://localhost:4000/api/members/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wixUserId, email })
        });
        
        const membershipData = await response.json();
        
        return {
          content: [
            {
              type: 'text',
              text: `User Membership Status: ${JSON.stringify(membershipData, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting membership: ${error.message}`
            }
          ]
        };
      }

    case 'create_membership_account':
      try {
        const { email, firstName, lastName, subscriptionTier } = args;
        
        // Call your registration API
        const response = await fetch(`http://localhost:4000/api/members/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, firstName, lastName, subscriptionTier })
        });
        
        const result = await response.json();
        
        return {
          content: [
            {
              type: 'text',
              text: `Membership Account Created: ${JSON.stringify(result, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error creating account: ${error.message}`
            }
          ]
        };
      }

    case 'get_subscription_tiers':
      try {
        // Call your subscription tiers API
        const response = await fetch(`http://localhost:4000/api/members/subscription-tiers`);
        const tiers = await response.json();
        
        return {
          content: [
            {
              type: 'text',
              text: `Available Subscription Tiers: ${JSON.stringify(tiers, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error getting tiers: ${error.message}`
            }
          ]
        };
      }

    case 'process_payment':
      try {
        const { email, subscriptionTier, paymentMethod } = args;
        
        // Call your payment API
        const response = await fetch(`http://localhost:4000/api/subscriptions/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, subscriptionTier, paymentMethod })
        });
        
        const paymentResult = await response.json();
        
        return {
          content: [
            {
              type: 'text',
              text: `Payment Processed: ${JSON.stringify(paymentResult, null, 2)}`
            }
          ]
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error processing payment: ${error.message}`
            }
          ]
        };
      }

    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${name}`
          }
        ]
      };
  }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);

console.log('🚀 Wix MCP Server running for Energy Calculator Membership');
console.log('📋 Available tools:');
console.log('   - get_user_membership');
console.log('   - create_membership_account');
console.log('   - get_subscription_tiers');
console.log('   - process_payment');
