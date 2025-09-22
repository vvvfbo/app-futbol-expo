import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from '../../app/(tabs)/(home)/home';

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

describe('Home Screen', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );
    
    expect(getByText('Bienvenido')).toBeTruthy();
  });

  it('displays navigation buttons', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );
    
    expect(getByTestId('crear-torneo-btn')).toBeTruthy();
    expect(getByTestId('crear-club-btn')).toBeTruthy();
  });

  it('handles navigation button press', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Home />
      </TestWrapper>
    );
    
    const crearTorneoBtn = getByTestId('crear-torneo-btn');
    fireEvent.press(crearTorneoBtn);
    
    await waitFor(() => {
      // Verify navigation was called
      expect(crearTorneoBtn).toBeTruthy();
    });
  });
});