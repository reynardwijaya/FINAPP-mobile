import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate years from 2020 to current year
const YEARS = Array.from(
  { length: new Date().getFullYear() - 2020 + 1 },
  (_, i) => 2020 + i
);

interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
}

export default function Expenses() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch data dari backend
  useEffect(() => {
    setLoading(true);
    fetch('https://backendreact-production-e680.up.railway.app/expenses')
      .then(res => res.json())
      .then(data => {
        console.log('RAW DATA FROM BACKEND:', data);
        // Ambil array dari property 'expenses'
        let expenseData = Array.isArray(data.expenses) ? data.expenses : [];
        // Urutkan data terbaru di atas
        expenseData = expenseData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setExpenses(expenseData.map((tx: any, idx: number) => ({
          ...tx,
          id: String(tx.id),
          amount: Number(tx.amount),
        })));
      })
      .catch(() => setExpenses([]))
      .finally(() => setLoading(false));
  }, []);

  console.log(
    expenses.map(e => ({
      title: e.title,
      date: e.date,
      month: new Date(e.date).getMonth(),
      year: new Date(e.date).getFullYear()
    }))
  );
  console.log('selectedMonth', selectedMonth, 'selectedYear', selectedYear);

  // Filter sesuai bulan & tahun
  const filteredExpenses = expenses.filter(expense => {
    // Tambahkan 'Z' jika belum ada, agar dianggap UTC
    const dateStr = expense.date.endsWith('Z') ? expense.date : expense.date + 'Z';
    const expenseDate = new Date(dateStr);
    return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => {
    return sum + expense.amount;
  }, 0);

  expenses.forEach(e => {
    const dateStr = e.date.endsWith('Z') ? e.date : e.date + 'Z';
    const d = new Date(dateStr);
    console.log(e.title, e.date, 'getMonth:', d.getMonth(), 'getFullYear:', d.getFullYear());
  });

  // Tambahkan fungsi hapus expense
  const handleDeleteExpense = (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteExpense = async () => {
    if (!deleteId) return;
    setShowDeleteModal(false);
    try {
      const res = await fetch(`https://backendreact-production-e680.up.railway.app/transactions/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses(prev => prev.filter(tx => tx.id !== deleteId));
      } else {
        alert('Failed to delete expense');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
    setDeleteId(null);
  };

  const cancelDeleteExpense = () => {
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseLeft}>
        <View style={styles.expenseIcon}>
          <Ionicons 
            name={item.category === 'cart' ? 'restaurant' : 
                  item.category === 'transport' ? 'bus' : 'flash'} 
            size={20} 
            color="#007AFF" 
          />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.expenseTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>
          <Text style={styles.expenseDate}>{item.date.substring(0, 10)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text 
          style={styles.expenseAmount}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.7}
        >Rp {item.amount.toLocaleString('id-ID')}</Text>
        <TouchableOpacity 
          onPress={() => handleDeleteExpense(item.id)} 
          style={{ marginLeft: 12, padding: 8, flexShrink: 0 }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#ADD8E6', '#87CEEB', '#6495ED']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace('/home')}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Expenses</Text>
          <TouchableOpacity onPress={() => router.push({ pathname: '/add-expense', params: { month: selectedMonth, year: selectedYear } })}>
            <Ionicons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.dateSelector}>
          <ScrollView horizontal style={styles.monthSelector} showsHorizontalScrollIndicator={false}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthItem,
                  selectedMonth === index && styles.monthItemSelected
                ]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text style={[
                  styles.monthText,
                  selectedMonth === index && styles.monthTextSelected
                ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView horizontal style={styles.yearSelector} showsHorizontalScrollIndicator={false}>
            {YEARS.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearItem,
                  selectedYear === year && styles.yearItemSelected
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text style={[
                  styles.yearText,
                  selectedYear === year && styles.yearTextSelected
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Total Expenses</Text>
          <Text style={styles.summaryAmount}>Rp {totalExpenses.toLocaleString()}</Text>
          <Text style={styles.summaryPeriod}>{MONTHS[selectedMonth]} {selectedYear}</Text>
        </View>

        <FlatList
          data={filteredExpenses}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {loading ? 'Loading...' : `No expenses for ${MONTHS[selectedMonth]} ${selectedYear}`}
              </Text>
            </View>
          }
        />

        {/* Modal Konfirmasi Hapus */}
        {showDeleteModal && (
          <View style={{
            position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 1000
          }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', width: 300 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Delete Expense</Text>
              <Text style={{ fontSize: 16, marginBottom: 24 }}>Are you sure you want to delete this expense?</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                <TouchableOpacity onPress={cancelDeleteExpense} style={{ flex: 1, marginRight: 8, padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDeleteExpense} style={{ flex: 1, marginLeft: 8, padding: 12, backgroundColor: '#FF3B30', borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </LinearGradient>
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
  dateSelector: {
    backgroundColor: '#fff',
    paddingBottom: 10,
  },
  monthSelector: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  monthItem: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  monthItemSelected: {
    backgroundColor: '#007AFF',
  },
  monthText: {
    fontSize: 14,
    color: '#666',
  },
  monthTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  yearSelector: {
    paddingHorizontal: 10,
  },
  yearItem: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#f0f0f0',
  },
  yearItemSelected: {
    backgroundColor: '#007AFF',
  },
  yearText: {
    fontSize: 13,
    color: '#666',
  },
  yearTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  summary: {
    margin: 20,
    padding: 20,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    alignItems: 'center',
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
  list: {
    padding: 20,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  expenseDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  gradientBackground: {
    flex: 1,
  },
}); 