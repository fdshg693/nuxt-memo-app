// server/api/stripe/create-checkout-session.post.ts
import Stripe from 'stripe';
import { database } from '~/server/utils/database-factory';
import { getSessionUser } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    const body = await readBody(event);
    const { priceId } = body;

    if (!runtimeConfig.stripeSecretKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Stripe secret key not configured'
      });
    }

    // Get authenticated user
    const user = await getSessionUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    const stripe = new Stripe(runtimeConfig.stripeSecretKey);

    // Get or create Stripe customer
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id.toString()
        }
      });
      customerId = customer.id;
      
      // Update user with Stripe customer ID
      await database.updateUser(user.id, { stripe_customer_id: customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: `${getHeader(event, 'origin')}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getHeader(event, 'origin')}/subscription?canceled=true`,
      metadata: {
        userId: user.id.toString()
      }
    });

    return {
      sessionId: session.id,
      url: session.url
    };
  } catch (error: any) {
    console.error('Stripe checkout session creation error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to create checkout session'
    });
  }
});