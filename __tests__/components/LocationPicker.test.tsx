import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LocationPicker from '@/components/LocationPicker';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060
      }
    })
  )
}));

describe('LocationPicker Component', () => {
  const mockOnLocationSelect = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} onClose={mockOnClose} />
    );
    
    expect(getByText('Seleccionar Ubicación')).toBeTruthy();
  });

  it('handles location selection', async () => {
    const { getByTestId } = render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} onClose={mockOnClose} />
    );
    
    const selectBtn = getByTestId('select-location-btn');
    fireEvent.press(selectBtn);
    
    // Wait for location to be selected
    await new Promise(resolve => setTimeout(() => resolve(undefined), 100));
    
    expect(mockOnLocationSelect).toHaveBeenCalled();
  });

  it('shows current location button', () => {
    const { getByTestId } = render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} onClose={mockOnClose} />
    );
    
    expect(getByTestId('current-location-btn')).toBeTruthy();
  });

  it('handles permission denied gracefully', async () => {
    // Mock permission denied
    const expo = jest.requireMock('expo-location');
    expo.requestForegroundPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });

    const { getByTestId, getByText } = render(
      <LocationPicker onLocationSelect={mockOnLocationSelect} onClose={mockOnClose} />
    );
    
    const currentLocationBtn = getByTestId('current-location-btn');
    fireEvent.press(currentLocationBtn);
    
    // Should show error message
    await new Promise(resolve => setTimeout(() => resolve(undefined), 100));
    
    expect(getByText('Permisos de ubicación denegados')).toBeTruthy();
  });
});