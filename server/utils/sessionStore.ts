// server/utils/sessionStore.ts
import { randomBytes } from 'crypto';

export interface SessionData {
  userId: string;
  email: string;
  username: string;
  createdAt: Date;
  lastActivity: Date;
}

class SessionStore {
  private sessions = new Map<string, SessionData>();
  
  generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }
  
  createSession(email: string, username: string): string {
    const sessionId = this.generateSessionId();
    const sessionData: SessionData = {
      userId: email, // Using email as userId for simplicity
      email,
      username,
      createdAt: new Date(),
      lastActivity: new Date()
    };
    
    this.sessions.set(sessionId, sessionData);
    return sessionId;
  }
  
  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Update last activity
      session.lastActivity = new Date();
      return session;
    }
    return null;
  }
  
  destroySession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }
  
  // Clean up expired sessions (optional - for production you might want to run this periodically)
  cleanupExpiredSessions(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.lastActivity.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();