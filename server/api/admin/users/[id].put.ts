// server/api/admin/users/[id].put.ts
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

    const body = await readBody(event);
    const { username, is_admin } = body;

    // Check if user exists
    const userToUpdate = database.getUserById(userId);
    if (!userToUpdate) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      });
    }

    // Update user
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (is_admin !== undefined) updateData.is_admin = is_admin;

    const success = database.updateUser(userId, updateData);
    
    if (!success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to update user'
      });
    }

    // Return updated user
    const updatedUser = database.getUserById(userId);
    return {
      id: updatedUser!.id,
      email: updatedUser!.email,
      username: updatedUser!.username,
      is_admin: updatedUser!.is_admin,
      created_at: updatedUser!.created_at,
      updated_at: updatedUser!.updated_at
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Admin user update error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});