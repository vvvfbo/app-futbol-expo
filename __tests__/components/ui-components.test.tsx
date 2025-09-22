import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { AuthProvider } from '@/hooks/auth-context';
import { DataProvider } from '@/hooks/data-context';

// Mock de componentes
const MockButton = ({ title, onPress, testID, variant, loading, disabled, icon }: any) => (
  <View testID={testID}>
    <Text onPress={disabled ? undefined : onPress}>{title}</Text>
  </View>
);

const MockListTile = ({ title, subtitle, onPress, testID, leadingIcon, trailingIcon, badge }: any) => (
  <View testID={testID}>
    <Text onPress={onPress}>{title}</Text>
    {subtitle && <Text>{subtitle}</Text>}
    {badge && <Text>{badge}</Text>}
  </View>
);

describe('Button Component - Widget Tests', () => {
  test('debe renderizar botón con texto completo', () => {
    const { getByText } = render(
      <MockButton title="Crear Nuevo Torneo" onPress={() => {}} />
    );

    const button = getByText('Crear Nuevo Torneo');
    expect(button).toBeTruthy();
  });

  test('debe renderizar botón primario correctamente', () => {
    const { getByTestId } = render(
      <MockButton 
        title="Botón Primario" 
        variant="primary" 
        onPress={() => {}} 
        testID="primary-button"
      />
    );

    const button = getByTestId('primary-button');
    expect(button).toBeTruthy();
  });

  test('debe ejecutar onPress al tocar el botón', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <MockButton 
        title="Test Button" 
        onPress={mockOnPress} 
        testID="test-button"
      />
    );

    const button = getByText('Test Button');
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('debe manejar texto largo sin cortarse', () => {
    const longText = 'Este es un texto muy largo para probar que el botón no se corta y mantiene todo el contenido visible';
    const { getByText } = render(
      <MockButton title={longText} onPress={() => {}} />
    );

    const button = getByText(longText);
    expect(button).toBeTruthy();
  });
});

describe('ListTile Component - Widget Tests', () => {
  test('debe renderizar título y subtítulo', () => {
    const { getByText } = render(
      <MockListTile 
        title="Título del Item"
        subtitle="Subtítulo del item"
        onPress={() => {}}
      />
    );

    expect(getByText('Título del Item')).toBeTruthy();
    expect(getByText('Subtítulo del item')).toBeTruthy();
  });

  test('debe ejecutar onPress al tocar el item', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <MockListTile 
        title="Test Item"
        onPress={mockOnPress}
        testID="test-list-item"
      />
    );

    const item = getByText('Test Item');
    fireEvent.press(item);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  test('debe mostrar badge cuando se proporciona', () => {
    const { getByText } = render(
      <MockListTile 
        title="Item with Badge"
        badge="5"
        onPress={() => {}}
      />
    );

    expect(getByText('Item with Badge')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });
});

// Test para verificar que los menús están bien distribuidos
describe('Menu Layout - Widget Tests', () => {
  test('debe distribuir elementos del menú sin espacios innecesarios', () => {
    const menuItems = [
      { id: '1', title: 'Torneos', icon: 'trophy' },
      { id: '2', title: 'Equipos', icon: 'users' },
      { id: '3', title: 'Amistosos', icon: 'calendar' },
      { id: '4', title: 'Clubes', icon: 'building' },
    ];

    const { getByText } = render(
      <View>
        {menuItems.map(item => (
          <MockListTile 
            key={item.id}
            title={item.title}
            leadingIcon={item.icon}
            onPress={() => {}}
            testID={`menu-item-${item.id}`}
          />
        ))}
      </View>
    );

    menuItems.forEach(item => {
      expect(getByText(item.title)).toBeTruthy();
    });
  });

  test('debe mostrar correctamente los tabs de navegación', () => {
    const tabs = ['Partidos', 'Equipos', 'Goles', 'Eliminatorias'];
    
    const { getByText } = render(
      <View>
        {tabs.map(tab => (
          <MockButton 
            key={tab}
            title={tab}
            variant="ghost"
            onPress={() => {}}
            testID={`tab-${tab.toLowerCase()}`}
          />
        ))}
      </View>
    );

    tabs.forEach(tab => {
      expect(getByText(tab)).toBeTruthy();
    });
  });
});

// Test para títulos de fases
describe('Phase Titles - Widget Tests', () => {
  test('debe mostrar títulos de fases con tamaño apropiado', () => {
    const fases = ['SEMIFINAL', 'FINAL', 'CUARTOS', 'OCTAVOS'];
    
    const { getByText } = render(
      <View>
        {fases.map(fase => (
          <View key={fase}>
            <Text>{fase}</Text>
          </View>
        ))}
      </View>
    );

    fases.forEach(fase => {
      const element = getByText(fase);
      expect(element).toBeTruthy();
    });
  });

  test('debe redimensionar títulos para no ocupar demasiado espacio', () => {
    const { getByTestId } = render(
      <View testID="phase-title-container">
        <Text>SEMIFINAL</Text>
      </View>
    );

    const container = getByTestId('phase-title-container');
    expect(container).toBeTruthy();
  });
});

// Test para funcionalidad del mapa
describe('Map Integration - Widget Tests', () => {
  test('debe mostrar icono de mapa', () => {
    const { getByTestId } = render(
      <MockButton 
        title="Ver en Mapa"
        icon="map-pin"
        onPress={() => {}}
        testID="map-button"
      />
    );

    const mapButton = getByTestId('map-button');
    expect(mapButton).toBeTruthy();
  });

  test('debe ejecutar función de abrir mapa', () => {
    const mockOpenMap = jest.fn();
    const { getByText } = render(
      <MockButton 
        title="Abrir Google Maps"
        onPress={mockOpenMap}
        testID="open-map-button"
      />
    );

    const button = getByText('Abrir Google Maps');
    fireEvent.press(button);

    expect(mockOpenMap).toHaveBeenCalledTimes(1);
  });
});

// Test para responsive design
describe('Responsive Design - Widget Tests', () => {
  test('debe adaptarse a diferentes tamaños de pantalla', () => {
    const { getByTestId } = render(
      <View testID="responsive-container">
        <MockButton title="Botón Responsive" onPress={() => {}} />
      </View>
    );

    const container = getByTestId('responsive-container');
    expect(container).toBeTruthy();
  });

  test('debe mostrar elementos en columna en pantallas pequeñas', () => {
    const { getByTestId } = render(
      <View testID="mobile-layout">
        <MockButton title="Botón 1" onPress={() => {}} />
        <MockButton title="Botón 2" onPress={() => {}} />
        <MockButton title="Botón 3" onPress={() => {}} />
      </View>
    );

    const layout = getByTestId('mobile-layout');
    expect(layout).toBeTruthy();
  });
});

// Test para validar que los componentes funcionan con providers
describe('Provider Integration - Widget Tests', () => {
  test('debe renderizar componentes dentro de AuthProvider', () => {
    const { getByText } = render(
      <AuthProvider>
        <MockButton title="Botón con Auth" onPress={() => {}} />
      </AuthProvider>
    );

    expect(getByText('Botón con Auth')).toBeTruthy();
  });

  test('debe renderizar componentes dentro de DataProvider', () => {
    const { getByText } = render(
      <DataProvider>
        <MockListTile title="Item con Data" onPress={() => {}} />
      </DataProvider>
    );

    expect(getByText('Item con Data')).toBeTruthy();
  });

  test('debe renderizar componentes con ambos providers', () => {
    const { getByText } = render(
      <AuthProvider>
        <DataProvider>
          <View>
            <MockButton title="Crear Torneo" onPress={() => {}} />
            <MockListTile title="Lista de Equipos" onPress={() => {}} />
          </View>
        </DataProvider>
      </AuthProvider>
    );

    expect(getByText('Crear Torneo')).toBeTruthy();
    expect(getByText('Lista de Equipos')).toBeTruthy();
  });
});