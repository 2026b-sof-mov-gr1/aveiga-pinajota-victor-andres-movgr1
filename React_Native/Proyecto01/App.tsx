import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, NativeModules, NativeEventEmitter, StatusBar } from 'react-native';

// 1. Instanciamos el módulo nativo y el emisor de eventos
const { AppResourceManager } = NativeModules;
const eventEmitter = new NativeEventEmitter(AppResourceManager);

export default function App() {
  // 2. Estado inicial (se sobrescribirá inmediatamente con los valores nativos)
  const [uiState, setUiState] = useState({
    saludo: 'Cargando recursos...',
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  });

  // 3. Función que cruza el puente para pedir los recursos a Kotlin
  const loadResources = async () => {
    try {
      const resources = await AppResourceManager.getUIResources();
      setUiState(resources);
    } catch (error) {
      console.error("Error obteniendo recursos nativos:", error);
    }
  };

  useEffect(() => {
    // Carga inicial al abrir la app
    loadResources(); 

    // Suscripción al evento de rotación o cambio de idioma que emite MainActivity.kt
    const subscription = eventEmitter.addListener('onOSConfigurationChanged', () => {
      loadResources();
    });

    // Limpieza al desmontar
    return () => subscription.remove();
  }, []);

  return (
    // 4. Inyectamos el color de fondo dinámico desde el estado
    <View style={[styles.container, { backgroundColor: uiState.backgroundColor }]}>
      <StatusBar barStyle="dark-content" />
      
      {/* 5. Inyectamos el texto y el color de fuente dinámicos */}
      <Text style={[styles.text, { color: uiState.textColor }]}>
        {uiState.saludo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  }
});