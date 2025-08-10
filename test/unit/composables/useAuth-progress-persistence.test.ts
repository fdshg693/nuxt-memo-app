// test/unit/composables/useAuth-progress-persistence.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '~/composables/useAuth';
import { useUserProgress } from '~/composables/useUserProgress';

// Mock useUserProgress
vi.mock('~/composables/useUserProgress', () => ({
  useUserProgress: vi.fn()
}));

// Mock fetch
global.fetch = vi.fn();

describe('useAuth progress persistence', () => {
  let mockInitializeProgress: ReturnType<typeof vi.fn>;
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup useUserProgress mock
    mockInitializeProgress = vi.fn();
    (useUserProgress as any).mockReturnValue({
      initializeProgress: mockInitializeProgress
    });
  });

  it('should initialize user progress when checkAuth succeeds', async () => {
    // Mock successful authentication response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        user: {
          email: '1@gmail.com',
          username: 'テストユーザー',
          loginAt: '2025-08-10T16:52:00.000Z'
        }
      })
    });

    const { checkAuth } = useAuth();
    const result = await checkAuth();

    expect(result).toBe(true);
    expect(mockInitializeProgress).toHaveBeenCalledWith('1@gmail.com');
  });

  it('should not initialize progress when checkAuth fails', async () => {
    // Mock failed authentication response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const { checkAuth } = useAuth();
    const result = await checkAuth();

    expect(result).toBe(false);
    expect(mockInitializeProgress).not.toHaveBeenCalled();
  });

  it('should handle fetch errors gracefully', async () => {
    // Mock fetch error
    (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const { checkAuth } = useAuth();
    const result = await checkAuth();

    expect(result).toBe(false);
    expect(mockInitializeProgress).not.toHaveBeenCalled();
  });
});