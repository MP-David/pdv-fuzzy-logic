import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Product, PRODUCTS } from '../data/products';
import { CartItem, cartItemCount, cartTotal, formatBRL } from '../types';

interface Props {
  cart: CartItem[];
  onAddToCart: (product: Product) => void;
  onGoToCart: () => void;
}

export function CatalogScreen({ cart, onAddToCart, onGoToCart }: Props) {
  const itemCount = cartItemCount(cart);
  const total = cartTotal(cart);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛍️ Loja Fuzzy Cashback</Text>
      <ScrollView contentContainerStyle={styles.list}>
        {PRODUCTS.map(product => (
          <View key={product.id} style={styles.card}>
            <Text style={styles.emoji}>{product.emoji}</Text>
            <View style={styles.cardInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productPrice}>{formatBRL(product.price)}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => onAddToCart(product)}
              accessibilityRole="button"
              accessibilityLabel={`Adicionar ${product.name} ao carrinho`}>
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      {itemCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={onGoToCart} accessibilityRole="button">
          <Text style={styles.cartBarText}>
            🛒 {itemCount} {itemCount === 1 ? 'item' : 'itens'} · {formatBRL(total)}
          </Text>
          <Text style={styles.cartBarLink}>Ver Carrinho →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    padding: 20,
    paddingBottom: 8,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  emoji: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  cartBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111827',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  cartBarText: {
    color: '#fff',
    fontWeight: '600',
  },
  cartBarLink: {
    color: '#93c5fd',
    fontWeight: '600',
  },
});
