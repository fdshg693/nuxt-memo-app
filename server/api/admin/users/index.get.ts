// server/api/admin/users/index.get.ts
import { database } from '~/server/utils/database-factory';
import { getSession } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
  try {
    // Check if user is authenticated and is admin
    const sessionId = getCookie(event, 'session') || '';
    const session = await getSession(sessionId);
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    const user = database.getUserById(session.user_id);
    if (!user || !user.is_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }

    // Get all users
    const users = database.getAllUsers();
    
    // Remove sensitive information
    const safeUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      username: user.username,
      is_admin: user.is_admin,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));

    return safeUsers;
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Admin users list error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});