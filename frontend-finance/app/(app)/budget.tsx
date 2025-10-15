import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

const BUDGET_CATEGORIES = [
  { id: '1', title: 'Food & Drinks', budget: 'Rp 2.000.000', spent: 'Rp 1.200.000', icon: 'restaurant' },
  { id: '2', title: 'Transportation', budget: 'Rp 800.000', spent: 'Rp 400.000', icon: 'bus' },
  { id: '3', title: 'Shopping', budget: 'Rp 1.000.000', spent: 'Rp 750.000', icon: 'cart' },
];

export default function Budget() {
  const [currentBudget, setCurrentBudget] = useState(5000000);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Budget</Text>
        <TouchableOpacity onPress={() => { /* Handle Add Budget */ }}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.budgetSummaryCard}>
          <Text style={styles.summaryTitle}>Current Monthly Budget</Text>
          <Text style={styles.summaryAmount}>Rp {currentBudget.toLocaleString('id-ID')}</Text>
          <Text style={styles.summaryPeriod}>October 2023</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Budget Categories</Text>
        </View>

        {/* Example Budget Categories (can be dynamic) */}
        <View style={styles.categoryList}>
          <View style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Ionicons name="fast-food" size={24} color="#FF9500" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>Food & Drinks</Text>
              <Text style={styles.categoryUsage}>Rp 800.000 / Rp 1.000.000</Text>
            </View>
            <View style={styles.categoryProgress}>
              <View style={[styles.progressBar, { width: '80%' }]} />
            </View>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Ionicons name="car" size={24} color="#34C759" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>Transportation</Text>
              <Text style={styles.categoryUsage}>Rp 400.000 / Rp 500.000</Text>
            </View>
            <View style={styles.categoryProgress}>
              <View style={[styles.progressBar, { width: '80%' }]} />
            </View>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Ionicons name="home" size={24} color="#5856D6" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>Utilities</Text>
              <Text style={styles.categoryUsage}>Rp 600.000 / Rp 800.000</Text>
            </View>
            <View style={styles.categoryProgress}>
              <View style={[styles.progressBar, { width: '75%' }]} />
            </View>
          </View>

          <View style={styles.categoryItem}>
            <View style={styles.categoryIcon}>
              <Ionicons name="shirt" size={24} color="#FF2D55" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>Shopping</Text>
              <Text style={styles.categoryUsage}>Rp 1.200.000 / Rp 1.500.000</Text>
            </View>
            <View style={styles.categoryProgress}>
              <View style={[styles.progressBar, { width: '80%' }]} />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
  },
  budgetSummaryCard: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  summaryPeriod: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  categoryList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  categoryUsage: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoryProgress: {
    width: 80,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
}); 