// server/utils/sessionStore.ts
import { randomBytes } from 'crypto';
import { getCookie } from 'h3';
import { database } from './database-factory';

export interface SessionData {
  userId: number;
  email: string;
  username: string;
  createdAt: Date;
  lastActivity: Date;
}

class SessionStore {
  generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }
  
  createSession(email: string, username: string): string {
    const sessionId = this.generateSessionId();
    
    // Get or create user in database
    let user = database.getUserByEmail(email);
    if (!user) {
      user = database.createUser(email, username);
    } else if (user.username !== username) {
      // Update username if it has changed
      database.updateUser(user.id, { username });
      user = database.getUserById(user.id)!;
    }
    
    // Store session in database
    database.createSession(sessionId, user.id);
    
    return sessionId;
  }
  
  getSession(sessionId: string): SessionData | null {
    const session = database.getSession(sessionId);
    if (!session) return null;
    
    const user = database.getUserById(session.user_id);
    if (!user) return null;
    
    return {
      userId: user.id,
      email: user.email,
      username: user.username,
      createdAt: new Date(user.created_at),
      lastActivity: new Date()
    };
  }
  
  destroySession(sessionId: string): boolean {
    return database.deleteSession(sessionId);
  }
  
  // Clean up expired sessions (optional - for production you might want to run this periodically)
  cleanupExpiredSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    // This could be implemented with a database query to delete old sessions
    // For now, we'll leave this as a placeholder
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Convenient function exports for easy import
export const getSession = (sessionId: string) => database.getSession(sessionId);
export const createSession = (email: string, username: string) => sessionStore.createSession(email, username);
export const destroySession = (sessionId: string) => sessionStore.destroySession(sessionId);

// Helper function to get user from session event
export const getSessionUser = async (event: any) => {
  const sessionId = getCookie(event, 'session');
  
  if (!sessionId) {
    return null;
  }
  
  const session = await getSession(sessionId);
  
  if (!session) {
    return null;
  }
  
  // Get user details from database
  return database.getUserById(session.user_id);
};