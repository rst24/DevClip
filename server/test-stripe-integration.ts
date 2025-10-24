import Stripe from "stripe";

// Expected pricing (what we display in the UI)
const EXPECTED_PRICING = {
  pro: {
    monthly: 899, // $8.99 in cents
    display: "$8.99/month",
  },
  team: {
    monthly: 3999, // $39.99 in cents
    display: "$39.99/month",
  },
};

async function testStripeIntegration() {
  console.log("🔍 Testing Stripe Integration for devclip.xyz\n");
  console.log("=" .repeat(60));

  // Initialize Stripe
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("❌ STRIPE_SECRET_KEY not found in environment");
    process.exit(1);
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: "2025-09-30.clover",
  });

  try {
    // Test 1: Verify API connection
    console.log("\n1️⃣ Testing Stripe API Connection...");
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.email || account.id}`);

    // Test 2: Verify Price IDs exist
    console.log("\n2️⃣ Verifying Price IDs...");
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
    const teamPriceId = process.env.STRIPE_TEAM_PRICE_ID;

    if (!proPriceId || !teamPriceId) {
      console.error("❌ Missing STRIPE_PRO_PRICE_ID or STRIPE_TEAM_PRICE_ID");
      console.log("\n💡 Run the following to create Stripe products:");
      console.log("   npx tsx server/setup-stripe.ts");
      process.exit(1);
    }

    console.log(`   Pro Price ID:  ${proPriceId}`);
    console.log(`   Team Price ID: ${teamPriceId}`);

    // Test 3: Fetch and verify Pro pricing
    console.log("\n3️⃣ Verifying Pro Plan Pricing...");
    const proPrice = await stripe.prices.retrieve(proPriceId, {
      expand: ["product"],
    });

    const proProduct = proPrice.product as Stripe.Product;
    console.log(`   Product Name: ${proProduct.name}`);
    console.log(`   Price Amount: $${(proPrice.unit_amount! / 100).toFixed(2)}`);
    console.log(`   Currency: ${proPrice.currency.toUpperCase()}`);
    console.log(`   Recurring: ${proPrice.recurring?.interval}`);

    if (proPrice.unit_amount !== EXPECTED_PRICING.pro.monthly) {
      console.log(`   ⚠️  WARNING: Price mismatch!`);
      console.log(`      Expected: ${EXPECTED_PRICING.pro.display}`);
      console.log(`      Actual:   $${(proPrice.unit_amount! / 100).toFixed(2)}/month`);
      console.log(`   ℹ️  UI displays ${EXPECTED_PRICING.pro.display} but Stripe has different pricing`);
    } else {
      console.log(`   ✅ Price matches UI: ${EXPECTED_PRICING.pro.display}`);
    }

    // Test 4: Fetch and verify Team pricing
    console.log("\n4️⃣ Verifying Team Plan Pricing...");
    const teamPrice = await stripe.prices.retrieve(teamPriceId, {
      expand: ["product"],
    });

    const teamProduct = teamPrice.product as Stripe.Product;
    console.log(`   Product Name: ${teamProduct.name}`);
    console.log(`   Price Amount: $${(teamPrice.unit_amount! / 100).toFixed(2)}`);
    console.log(`   Currency: ${teamPrice.currency.toUpperCase()}`);
    console.log(`   Recurring: ${teamPrice.recurring?.interval}`);

    if (teamPrice.unit_amount !== EXPECTED_PRICING.team.monthly) {
      console.log(`   ⚠️  WARNING: Price mismatch!`);
      console.log(`      Expected: ${EXPECTED_PRICING.team.display}`);
      console.log(`      Actual:   $${(teamPrice.unit_amount! / 100).toFixed(2)}/month`);
      console.log(`   ℹ️  UI displays ${EXPECTED_PRICING.team.display} but Stripe has different pricing`);
    } else {
      console.log(`   ✅ Price matches UI: ${EXPECTED_PRICING.team.display}`);
    }

    // Test 5: Test checkout session creation
    console.log("\n5️⃣ Testing Checkout Session Creation...");
    const testSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{
        price: proPriceId,
        quantity: 1,
      }],
      success_url: "https://devclip.xyz/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://devclip.xyz/cancel",
      metadata: {
        test: "true",
      },
    });

    console.log(`   ✅ Checkout session created: ${testSession.id}`);
    console.log(`   URL: ${testSession.url?.substring(0, 50)}...`);

    // Test 6: Verify webhook endpoint configuration
    console.log("\n6️⃣ Checking Webhook Endpoints...");
    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    
    if (webhooks.data.length === 0) {
      console.log("   ⚠️  No webhook endpoints configured");
      console.log("   ℹ️  Configure webhook at: https://dashboard.stripe.com/webhooks");
      console.log("   ℹ️  Endpoint URL: https://devclip.xyz/api/billing/webhook");
      console.log("   ℹ️  Required events:");
      console.log("      - checkout.session.completed");
      console.log("      - customer.subscription.updated");
      console.log("      - customer.subscription.deleted");
      console.log("      - invoice.payment_failed");
    } else {
      console.log(`   Found ${webhooks.data.length} webhook endpoint(s):`);
      webhooks.data.forEach((webhook, index) => {
        console.log(`\n   Webhook ${index + 1}:`);
        console.log(`     URL: ${webhook.url}`);
        console.log(`     Status: ${webhook.status}`);
        console.log(`     Events: ${webhook.enabled_events.join(", ")}`);
        
        const requiredEvents = [
          "checkout.session.completed",
          "customer.subscription.updated",
          "customer.subscription.deleted",
          "invoice.payment_failed",
        ];
        
        const missingEvents = requiredEvents.filter(
          event => !webhook.enabled_events.includes(event)
        );
        
        if (missingEvents.length > 0) {
          console.log(`     ⚠️  Missing events: ${missingEvents.join(", ")}`);
        } else {
          console.log(`     ✅ All required events configured`);
        }
      });
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 INTEGRATION SUMMARY");
    console.log("=".repeat(60));
    
    const issues = [];
    
    if (proPrice.unit_amount !== EXPECTED_PRICING.pro.monthly) {
      issues.push(`Pro pricing mismatch: UI shows ${EXPECTED_PRICING.pro.display}, Stripe has $${(proPrice.unit_amount! / 100).toFixed(2)}`);
    }
    
    if (teamPrice.unit_amount !== EXPECTED_PRICING.team.monthly) {
      issues.push(`Team pricing mismatch: UI shows ${EXPECTED_PRICING.team.display}, Stripe has $${(teamPrice.unit_amount! / 100).toFixed(2)}`);
    }
    
    if (webhooks.data.length === 0) {
      issues.push("No webhook endpoints configured");
    }
    
    if (issues.length === 0) {
      console.log("\n✅ All tests passed! Stripe integration is properly configured.");
      console.log("✅ Pricing matches between UI and Stripe");
      console.log("✅ Ready for production use");
    } else {
      console.log("\n⚠️  Issues found:");
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      
      console.log("\n💡 RECOMMENDED ACTIONS:");
      if (issues.some(i => i.includes("pricing mismatch"))) {
        console.log("   1. Update Stripe product prices to match UI ($8.99 Pro, $39.99 Team)");
        console.log("      - Go to: https://dashboard.stripe.com/prices");
        console.log("      - Create new prices with correct amounts");
        console.log("      - Update STRIPE_PRO_PRICE_ID and STRIPE_TEAM_PRICE_ID environment variables");
      }
      
      if (issues.some(i => i.includes("webhook"))) {
        console.log("   2. Configure webhook endpoint at https://dashboard.stripe.com/webhooks");
        console.log("      - Add endpoint: https://devclip.xyz/api/billing/webhook");
        console.log("      - Select required events (listed above)");
      }
    }
    
    console.log("\n" + "=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Error testing Stripe integration:");
    console.error(error.message);
    if (error.type) {
      console.error(`Error type: ${error.type}`);
    }
    process.exit(1);
  }
}

testStripeIntegration();
