import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
});

async function setupStripeProducts() {
  console.log("🚀 Setting up Stripe products for devclip.xyz\n");
  console.log("=" .repeat(60));

  try {
    // Create Pro product
    console.log("\n📦 Creating Pro Product...");
    const proProduct = await stripe.products.create({
      name: "DevClip Pro",
      description: "5,000 AI credits/month • GPT-5 Mini • 3 API keys • Priority support",
      metadata: {
        features: "5000 credits, GPT-5 Mini, 3 API keys",
      },
    });
    console.log(`   ✅ Product created: ${proProduct.id}`);

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 899, // $8.99
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "pro",
      },
    });
    console.log(`   ✅ Price created: ${proPrice.id} ($8.99/month)`);

    // Create Team product
    console.log("\n📦 Creating Team Product...");
    const teamProduct = await stripe.products.create({
      name: "DevClip Team",
      description: "25,000 AI credits/month • GPT-5 Premium • Unlimited API keys • Team features",
      metadata: {
        features: "25000 credits, GPT-5 Premium, unlimited API keys",
      },
    });
    console.log(`   ✅ Product created: ${teamProduct.id}`);

    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 3999, // $39.99
      currency: "usd",
      recurring: {
        interval: "month",
      },
      metadata: {
        plan: "team",
      },
    });
    console.log(`   ✅ Price created: ${teamPrice.id} ($39.99/month)`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUCCESS! Products created in Stripe");
    console.log("=" .repeat(60));
    
    console.log("\n📋 Add these Price IDs to your Replit Secrets:");
    console.log("-".repeat(60));
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_TEAM_PRICE_ID=${teamPrice.id}`);
    
    console.log("\n💡 Next Steps:");
    console.log("1. Copy the price IDs above");
    console.log("2. Go to Replit Secrets (Tools > Secrets)");
    console.log("3. Update STRIPE_PRO_PRICE_ID and STRIPE_TEAM_PRICE_ID");
    console.log("4. Restart your app to apply changes");
    console.log("\n5. Configure webhook at: https://dashboard.stripe.com/webhooks");
    console.log("   Endpoint: https://devclip.xyz/api/billing/webhook");
    console.log("   Events needed:");
    console.log("   • checkout.session.completed");
    console.log("   • customer.subscription.updated");
    console.log("   • customer.subscription.deleted");
    console.log("   • invoice.payment_failed");
    
    console.log("\n" + "=".repeat(60));
  } catch (error: any) {
    console.error("\n❌ Error setting up Stripe:");
    console.error(error.message);
    if (error.type) {
      console.error(`Error type: ${error.type}`);
    }
    process.exit(1);
  }
}

setupStripeProducts();
