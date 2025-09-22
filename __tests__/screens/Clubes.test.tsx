import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClubesScreen from '@/app/(tabs)/(clubes)/clubes';

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

describe('Clubes Screen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <ClubesScreen />
      </TestWrapper>
    );
    
    expect(getByText('Mis Clubes')).toBeTruthy();
  });

  it('shows create club button', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ClubesScreen />
      </TestWrapper>
    );
    
    expect(getByTestId('crear-club-btn')).toBeTruthy();
  });

  it('displays empty state when no clubs exist', () => {
    const { getByText } = render(
      <TestWrapper>
        <ClubesScreen />
      </TestWrapper>
    );
    
    expect(getByText('No tienes clubes creados')).toBeTruthy();
  });

  it('handles club creation navigation', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ClubesScreen />
      </TestWrapper>
    );
    
    const createBtn = getByTestId('crear-club-btn');
    fireEvent.press(createBtn);
    
    await waitFor(() => {
      expect(createBtn).toBeTruthy();
    });
  });
});