/**
 * MVP: Motor Fuzzy para Bonificação Dinâmica em Programas de Fidelidade e Cashback
 * UTFPR - Sistemas Inteligentes Aplicados
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Product } from './src/data/products';
import { CartScreen } from './src/screens/CartScreen';
import { CatalogScreen } from './src/screens/CatalogScreen';
import { CartItem } from './src/types';

type Screen = 'catalog' | 'cart';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>('catalog');
  const [cart, setCart] = useState<CartItem[]>([]);

  function addToCart(product: Product) {
    setCart(current => {
      const existing = current.find(item => item.product.id === product.id);
      if (existing) {
        return current.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { product, quantity: 1 }];
    });
  }

  function incrementItem(productId: string) {
    setCart(current =>
      current.map(item =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  }

  function decrementItem(productId: string) {
    setCart(current =>
      current
        .map(item =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
        )
        .filter(item => item.quantity > 0),
    );
  }

  function removeItem(productId: string) {
    setCart(current => current.filter(item => item.product.id !== productId));
  }

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {screen === 'catalog' ? (
        <CatalogScreen
          cart={cart}
          onAddToCart={addToCart}
          onGoToCart={() => setScreen('cart')}
        />
      ) : (
        <CartScreen
          cart={cart}
          onIncrement={incrementItem}
          onDecrement={decrementItem}
          onRemove={removeItem}
          onBack={() => setScreen('catalog')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
