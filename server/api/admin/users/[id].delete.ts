// server/api/admin/users/[id].delete.ts
import { database } from '~/server/utils/database-factory';
import { getDbSession } from '~/server/utils/sessionStore';

export default defineEventHandler(async (event) => {
  try {
    // Check if user is authenticated and is admin
    const sessionId = getCookie(event, 'session') || '';
    const session = await getDbSession(sessionId);
    
    if (!session) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      });
    }

    const currentUser = database.getUserById(session.user_id);
    if (!currentUser || !currentUser.is_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }

    const userId = parseInt(getRouterParam(event, 'id') || '');
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID'
      });
    }

    // Check if user exists
    const userToDelete = database.getUserById(userId);
    if (!userToDelete) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Prevent deleting the current admin user
    if (userId === currentUser.id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete your own account'
      });
    }

    // Delete user
    const success = database.deleteUser(userId);
    
    if (!success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to delete user'
      });
    }

    return { success: true, message: 'User deleted successfully' };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Admin user deletion error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});