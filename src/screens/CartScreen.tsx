import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CUSTOMER_PROFILES } from '../data/customers';
import {
  CASHBACK_LABELS,
  ENGAGEMENT_LABELS,
  TICKET_LABELS,
} from '../fuzzy/sets';
import { useFuzzyCashback } from '../fuzzy/useFuzzyCashback';
import { CartItem, cartTotal, formatBRL } from '../types';

interface Props {
  cart: CartItem[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onBack: () => void;
}

function MembershipBar({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.membershipRow}>
      <Text style={styles.membershipLabel}>{label}</Text>
      <View style={styles.membershipTrack}>
        <View style={[styles.membershipFill, { width: `${value * 100}%` }]} />
      </View>
      <Text style={styles.membershipValue}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

export function CartScreen({ cart, onIncrement, onDecrement, onRemove, onBack }: Props) {
  const [selectedProfileId, setSelectedProfileId] = useState(CUSTOMER_PROFILES[1].id);
  const [engagementScore, setEngagementScore] = useState(CUSTOMER_PROFILES[1].engagementScore);

  const ticketValue = cartTotal(cart);
  const result = useFuzzyCashback(ticketValue, engagementScore);
  const cashbackAmount = (ticketValue * result.cashbackRate) / 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} accessibilityRole="button">
          <Text style={styles.backLink}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Carrinho</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          {cart.length === 0 && <Text style={styles.emptyText}>Seu carrinho está vazio.</Text>}
          {cart.map(item => (
            <View key={item.product.id} style={styles.cartRow}>
              <Text style={styles.cartRowEmoji}>{item.product.emoji}</Text>
              <View style={styles.cartRowInfo}>
                <Text style={styles.cartRowName}>{item.product.name}</Text>
                <Text style={styles.cartRowPrice}>
                  {item.quantity}x {formatBRL(item.product.price)}
                </Text>
              </View>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => onDecrement(item.product.id)}
                  accessibilityRole="button">
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => onIncrement(item.product.id)}
                  accessibilityRole="button">
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => onRemove(item.product.id)}
                  accessibilityRole="button">
                  <Text style={styles.qtyButtonText}>x</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total do Ticket</Text>
            <Text style={styles.totalValue}>{formatBRL(ticketValue)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.profileRow}>
            {CUSTOMER_PROFILES.map(profile => (
              <TouchableOpacity
                key={profile.id}
                style={[
                  styles.profileButton,
                  selectedProfileId === profile.id && styles.profileButtonSelected,
                ]}
                onPress={() => {
                  setSelectedProfileId(profile.id);
                  setEngagementScore(profile.engagementScore);
                }}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.profileButtonText,
                    selectedProfileId === profile.id && styles.profileButtonTextSelected,
                  ]}>
                  {profile.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.sliderLabel}>Engajamento: {Math.round(engagementScore)}</Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={engagementScore}
            onValueChange={value => {
              setSelectedProfileId('');
              setEngagementScore(value);
            }}
            minimumTrackTintColor="#2563eb"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Como o Fuzzy calculou</Text>

          <Text style={styles.subheading}>Pertinência do Ticket</Text>
          {(Object.keys(TICKET_LABELS) as Array<keyof typeof TICKET_LABELS>).map(key => (
            <MembershipBar
              key={key}
              label={TICKET_LABELS[key]}
              value={result.ticketMemberships[key]}
            />
          ))}

          <Text style={styles.subheading}>Pertinência do Engajamento</Text>
          {(Object.keys(ENGAGEMENT_LABELS) as Array<keyof typeof ENGAGEMENT_LABELS>).map(key => (
            <MembershipBar
              key={key}
              label={ENGAGEMENT_LABELS[key]}
              value={result.engagementMemberships[key]}
            />
          ))}

          <Text style={styles.subheading}>Regras Ativadas</Text>
          {result.activatedRules.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma regra ativada.</Text>
          )}
          {result.activatedRules.map((rule, index) => (
            <Text key={index} style={styles.ruleText}>
              • {TICKET_LABELS[rule.ticketSet]}+{ENGAGEMENT_LABELS[rule.engagementSet]}→
              {CASHBACK_LABELS[rule.outputSet]} (força {rule.strength.toFixed(2)})
            </Text>
          ))}
        </View>

        <View style={styles.resultSection}>
          <Text style={styles.resultLabel}>💰 Cashback</Text>
          <Text style={styles.resultRate}>{result.cashbackRate.toFixed(1)}%</Text>
          <Text style={styles.resultAmount}>Você recebe: {formatBRL(cashbackAmount)}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 60,
  },
  backLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyText: {
    color: '#888',
  },
  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  cartRowEmoji: {
    fontSize: 24,
  },
  cartRowInfo: {
    flex: 1,
  },
  cartRowName: {
    fontWeight: '600',
  },
  cartRowPrice: {
    color: '#555',
    fontSize: 13,
  },
  qtyControls: {
    flexDirection: 'row',
    gap: 6,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyButtonText: {
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: {
    fontWeight: '600',
  },
  totalValue: {
    fontWeight: '700',
  },
  profileRow: {
    flexDirection: 'row',
    gap: 8,
  },
  profileButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  profileButtonSelected: {
    backgroundColor: '#2563eb',
  },
  profileButtonText: {
    fontWeight: '600',
    color: '#111827',
  },
  profileButtonTextSelected: {
    color: '#fff',
  },
  sliderLabel: {
    marginTop: 8,
    color: '#555',
  },
  subheading: {
    fontWeight: '700',
    marginTop: 8,
    color: '#333',
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  membershipLabel: {
    width: 80,
    fontSize: 13,
  },
  membershipTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  membershipFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  membershipValue: {
    width: 36,
    fontSize: 12,
    textAlign: 'right',
    color: '#555',
  },
  ruleText: {
    fontSize: 13,
    color: '#333',
  },
  resultSection: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  resultLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultRate: {
    color: '#4ade80',
    fontSize: 36,
    fontWeight: '800',
  },
  resultAmount: {
    color: '#e5e7eb',
    fontSize: 14,
  },
});
