// server/api/stripe/webhook.post.ts
import Stripe from 'stripe';
import { database } from '~/server/utils/database-factory';

export default defineEventHandler(async (event) => {
  try {
    const runtimeConfig = useRuntimeConfig();
    
    if (!runtimeConfig.stripeSecretKey || !runtimeConfig.stripeWebhookSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Stripe configuration incomplete'
      });
    }

    const stripe = new Stripe(runtimeConfig.stripeSecretKey);
    const body = await readRawBody(event);
    const signature = getHeader(event, 'stripe-signature');

    if (!signature || !body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing signature or body'
      });
    }

    let stripeEvent: Stripe.Event;
    
    try {
      stripeEvent = stripe.webhooks.constructEvent(
        body,
        signature,
        runtimeConfig.stripeWebhookSecret
      );
    } catch (error: any) {
      console.error('Webhook signature verification failed:', error.message);
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid signature'
      });
    }

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        console.log('Checkout session completed:', session.id);
        
        if (session.metadata?.userId) {
          const userId = parseInt(session.metadata.userId);
          await database.updateUser(userId, {
            subscription_status: 'active',
            subscription_id: session.subscription as string
          });
          console.log(`Updated user ${userId} subscription status to active`);
        }
        break;

      case 'customer.subscription.updated':
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        console.log('Subscription updated:', subscription.id);
        
        // Find user by customer ID
        const users = await database.getAllUsers();
        const user = users.find(u => u.stripe_customer_id === subscription.customer);
        
        if (user) {
          await database.updateUser(user.id, {
            subscription_status: subscription.status,
            subscription_id: subscription.id
          });
          console.log(`Updated user ${user.id} subscription status to ${subscription.status}`);
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = stripeEvent.data.object as Stripe.Subscription;
        console.log('Subscription deleted:', deletedSubscription.id);
        
        // Find user by customer ID
        const allUsers = await database.getAllUsers();
        const userToUpdate = allUsers.find(u => u.stripe_customer_id === deletedSubscription.customer);
        
        if (userToUpdate) {
          await database.updateUser(userToUpdate.id, {
            subscription_status: 'canceled',
            subscription_id: null
          });
          console.log(`Updated user ${userToUpdate.id} subscription status to canceled`);
        }
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { received: true };
  } catch (error: any) {
    console.error('Webhook error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Webhook processing failed'
    });
  }
});