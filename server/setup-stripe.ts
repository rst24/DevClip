import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY is not set");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

async function setupStripeProducts() {
  console.log("Setting up Stripe products and prices...\n");

  try {
    // Create Pro product
    const proProduct = await stripe.products.create({
      name: "DevClip Pro",
      description: "Professional plan with 250 AI credits per month",
    });
    console.log(`✓ Created Pro product: ${proProduct.id}`);

    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1000, // $10.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });
    console.log(`✓ Created Pro price: ${proPrice.id}`);

    // Create Team product
    const teamProduct = await stripe.products.create({
      name: "DevClip Team",
      description: "Team plan with 2000 AI credits per month",
    });
    console.log(`✓ Created Team product: ${teamProduct.id}`);

    const teamPrice = await stripe.prices.create({
      product: teamProduct.id,
      unit_amount: 4900, // $49.00
      currency: "usd",
      recurring: {
        interval: "month",
      },
    });
    console.log(`✓ Created Team price: ${teamPrice.id}`);

    console.log("\n=== Add these to your .env file ===");
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`STRIPE_TEAM_PRICE_ID=${teamPrice.id}`);
    console.log("\n=== Or for testing keys ===");
    console.log(`TESTING_STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`TESTING_STRIPE_TEAM_PRICE_ID=${teamPrice.id}`);
  } catch (error: any) {
    console.error("Error setting up Stripe:", error.message);
    process.exit(1);
  }
}

setupStripeProducts();
