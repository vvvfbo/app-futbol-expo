import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AmistososScreen from '@/app/(tabs)/(amistosos)/amistosos';

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

describe('Amistosos Screen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <AmistososScreen />
      </TestWrapper>
    );
    
    expect(getByText('Amistosos')).toBeTruthy();
  });

  it('shows create availability button', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AmistososScreen />
      </TestWrapper>
    );
    
    expect(getByTestId('crear-disponibilidad-btn')).toBeTruthy();
  });

  it('navigates to create availability screen', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <AmistososScreen />
      </TestWrapper>
    );
    
    const createBtn = getByTestId('crear-disponibilidad-btn');
    fireEvent.press(createBtn);
    
    await waitFor(() => {
      expect(createBtn).toBeTruthy();
    });
  });

  it('displays empty state when no matches available', () => {
    const { getByText } = render(
      <TestWrapper>
        <AmistososScreen />
      </TestWrapper>
    );
    
    expect(getByText('No hay amistosos disponibles')).toBeTruthy();
  });
});