// server/utils/database-interface.ts
export interface UserData {
  id: number;
  email: string;
  username: string;
  password_hash?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProgressData {
  id: number;
  user_id: number;
  question_id: number;
  answered_at: string;
  genre?: string;
  subgenre?: string;
  level?: number;
}

export interface DatabaseAdapter {
  // User operations
  createUser(email: string, username: string, passwordHash?: string, isAdmin?: boolean): UserData;
  getUserByEmail(email: string): UserData | null;
  getUserById(id: number): UserData | null;
  getAllUsers(): UserData[];
  updateUser(id: number, data: Partial<UserData>): boolean;
  deleteUser(id: number): boolean;
  
  // Progress operations
  saveProgress(userId: number, questionId: number, genre?: string, subgenre?: string, level?: number): void;
  getUserProgress(userId: number): UserProgressData[];
  clearUserProgress(userId: number): boolean;
  
  // Session operations
  createSession(sessionId: string, userId: number): void;
  getSession(sessionId: string): { user_id: number } | null;
  deleteSession(sessionId: string): boolean;
  
  // Utility methods
  close(): void;
}