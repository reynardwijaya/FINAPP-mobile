import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const palette = {
  bg: '#F2F4F8',
  card: '#FFFFFF',
  ink: '#1C1C1E',
  inkSoft: '#6E6E73',
  inkFaint: '#AEAEB2',
  divider: '#EDEDF2',
  blue: '#0A84FF',
};

const BUDGET_CATEGORIES = [
  { id: '1', title: 'Food & Drinks', spent: 800000, budget: 1000000, icon: 'fast-food', color: '#FF9500' },
  { id: '2', title: 'Transportation', spent: 400000, budget: 500000, icon: 'car', color: '#34C759' },
  { id: '3', title: 'Utilities', spent: 600000, budget: 800000, icon: 'home', color: '#5856D6' },
  { id: '4', title: 'Shopping', spent: 1200000, budget: 1500000, icon: 'shirt', color: '#FF2D55' },
];

export default function Budget() {
  const [currentBudget, setCurrentBudget] = useState(5000000);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={palette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget</Text>
        <TouchableOpacity onPress={() => { /* Handle Add Budget */ }} style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="add" size={22} color={palette.blue} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <LinearGradient
            colors={['#1D4ED8', '#0A84FF', '#38C6F4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.summaryGlow} pointerEvents="none" />
          <Text style={styles.summaryTitle}>Current Monthly Budget</Text>
          <Text style={styles.summaryAmount}>Rp {currentBudget.toLocaleString('id-ID')}</Text>
          <Text style={styles.summaryPeriod}>October 2023</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Categories</Text>
        </View>

        {/* Example Budget Categories (can be dynamic) */}
        <View style={styles.categoryList}>
          {BUDGET_CATEGORIES.map((cat, index) => {
            const percent = Math.min(cat.spent / cat.budget, 1);
            return (
              <View
                key={cat.id}
                style={[styles.categoryItem, index === BUDGET_CATEGORIES.length - 1 && styles.categoryItemLast]}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}1F` }]}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <View style={styles.categoryInfo}>
                  <View style={styles.categoryTopRow}>
                    <Text style={styles.categoryName}>{cat.title}</Text>
                    <Text style={styles.categoryPercent}>{Math.round(percent * 100)}%</Text>
                  </View>
                  <Text style={styles.categoryUsage}>
                    Rp {cat.spent.toLocaleString('id-ID')} / Rp {cat.budget.toLocaleString('id-ID')}
                  </Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressBar, { width: `${percent * 100}%`, backgroundColor: cat.color }]} />
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  summaryCard: {
    borderRadius: 26,
    padding: 22,
    marginBottom: 24,
    marginTop: 6,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 8,
  },
  summaryGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.14)',
    top: -80,
    right: -50,
  },
  summaryTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginVertical: 8,
    fontVariant: ['tabular-nums'],
  },
  summaryPeriod: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: palette.ink,
  },
  categoryList: {
    backgroundColor: palette.card,
    borderRadius: 22,
    paddingHorizontal: 18,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  categoryItemLast: {
    borderBottomWidth: 0,
  },
  categoryIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14.5,
    fontWeight: '700',
    color: palette.ink,
  },
  categoryPercent: {
    fontSize: 12.5,
    fontWeight: '700',
    color: palette.inkSoft,
    fontVariant: ['tabular-nums'],
  },
  categoryUsage: {
    fontSize: 12.5,
    color: palette.inkFaint,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    height: 6,
    backgroundColor: palette.bg,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
