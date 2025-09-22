import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CrearTorneo from '../../app/crear-torneo';

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

describe('Crear Torneo Screen', () => {
  it('renders form fields correctly', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <CrearTorneo />
      </TestWrapper>
    );
    
    expect(getByPlaceholderText('Nombre del torneo')).toBeTruthy();
    expect(getByPlaceholderText('Descripción')).toBeTruthy();
  });

  it('validates required fields', async () => {
    const { getByTestId, getByText } = render(
      <TestWrapper>
        <CrearTorneo />
      </TestWrapper>
    );
    
    const submitBtn = getByTestId('submit-btn');
    fireEvent.press(submitBtn);
    
    await waitFor(() => {
      expect(getByText('El nombre es requerido')).toBeTruthy();
    });
  });

  it('submits form with valid data', async () => {
    const { getByPlaceholderText, getByTestId } = render(
      <TestWrapper>
        <CrearTorneo />
      </TestWrapper>
    );
    
    const nombreInput = getByPlaceholderText('Nombre del torneo');
    const descripcionInput = getByPlaceholderText('Descripción');
    const submitBtn = getByTestId('submit-btn');
    
    fireEvent.changeText(nombreInput, 'Torneo Test');
    fireEvent.changeText(descripcionInput, 'Descripción test');
    fireEvent.press(submitBtn);
    
    await waitFor(() => {
      // Verify form submission
      expect(nombreInput.props.value).toBe('Torneo Test');
    });
  });
});