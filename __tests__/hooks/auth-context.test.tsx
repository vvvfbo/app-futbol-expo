import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '../../hooks/auth-context';
import React from 'react';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useAuth Hook', () => {
  it('initializes with null user', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(true);
  });

  it('handles login correctly', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });
    
    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password123', rememberMe: false });
    });
    
    // Verify login was attempted
    expect(result.current.isLoading).toBe(false);
  });

  it('handles logout correctly', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: TestWrapper
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
  });
});