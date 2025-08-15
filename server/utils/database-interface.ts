// server/utils/database-interface.ts
export interface UserData {
  id: number;
  email: string;
  username: string;
  password_hash?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  subscription_status?: string;
  subscription_id?: string;
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
  createUser(email: string, username: string, passwordHash?: string, isAdmin?: boolean): Promise<UserData>;
  getUserByEmail(email: string): Promise<UserData | null>;
  getUserById(id: number): Promise<UserData | null>;
  getAllUsers(): Promise<UserData[]>;
  updateUser(id: number, data: Partial<UserData>): Promise<boolean>;
  deleteUser(id: number): Promise<boolean>;
  
  // Progress operations
  saveProgress(userId: number, questionId: number, genre?: string, subgenre?: string, level?: number): Promise<void>;
  getUserProgress(userId: number): Promise<UserProgressData[]>;
  clearUserProgress(userId: number): Promise<boolean>;
  
  // Session operations
  createSession(sessionId: string, userId: number): Promise<void>;
  getSession(sessionId: string): Promise<{ user_id: number } | null>;
  deleteSession(sessionId: string): Promise<boolean>;
  
  // Utility methods
  close(): void;
}