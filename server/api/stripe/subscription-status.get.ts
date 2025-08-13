// server/api/stripe/subscription-status.get.ts
import { getSessionUser } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
  try {
    // Get authenticated user
    const user = await getSessionUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required'
      });
    }

    return {
      hasSubscription: !!user.subscription_status && user.subscription_status === 'active',
      subscriptionStatus: user.subscription_status || 'none',
      subscriptionId: user.subscription_id
    };
  } catch (error: any) {
    console.error('Get subscription status error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Failed to get subscription status'
    });
  }
});