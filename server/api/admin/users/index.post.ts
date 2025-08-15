// server/api/admin/users/index.post.ts
import { database } from '~/server/utils/database-factory';
import { getDbSession } from '~/server/utils/sessionStore';
import bcrypt from 'bcrypt';

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

    const currentUser = await database.getUserById(session.user_id);
    if (!currentUser || !currentUser.is_admin) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      });
    }

    const body = await readBody(event);
    const { email, username, password, is_admin } = body;

    // Validate input
    if (!email || !username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, username, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await database.getUserByEmail(email);
    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await database.createUser(email, username, passwordHash, is_admin || false);

    // Return user without sensitive information
    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      is_admin: newUser.is_admin,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    
    console.error('Admin user creation error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    });
  }
});