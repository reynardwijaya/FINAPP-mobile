import { View, Text, StyleSheet, TouchableOpacity, FlatList, ScrollView, Modal } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { API_BASE_URL } from '../../constants/Api';

const palette = {
  bg: '#F2F4F8',
  card: '#FFFFFF',
  ink: '#1C1C1E',
  inkSoft: '#6E6E73',
  inkFaint: '#AEAEB2',
  divider: '#EDEDF2',
  blue: '#0A84FF',
  red: '#FF453A',
};

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
    fetch(`${API_BASE_URL}/expenses`)
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
      const res = await fetch(`${API_BASE_URL}/transactions/${deleteId}`, { method: 'DELETE' });
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

  const renderItem = ({ item, index }: { item: Expense; index: number }) => (
    <View style={[styles.expenseItem, index === filteredExpenses.length - 1 && styles.expenseItemLast]}>
      <View style={styles.expenseLeft}>
        <View style={styles.expenseIcon}>
          <Ionicons
            name={item.category === 'cart' ? 'restaurant' :
                  item.category === 'transport' ? 'bus' : 'flash'}
            size={18}
            color={palette.blue}
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
        >-Rp {item.amount.toLocaleString('id-ID')}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteExpense(item.id)}
          style={styles.deleteIconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={16} color={palette.inkFaint} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={palette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Expenses</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/add-expense', params: { month: selectedMonth, year: selectedYear } })}
          style={styles.iconButton}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={22} color={palette.blue} />
        </TouchableOpacity>
      </View>

      <View style={styles.dateSelector}>
        <ScrollView horizontal style={styles.monthSelector} showsHorizontalScrollIndicator={false}>
          {MONTHS.map((month, index) => (
            <TouchableOpacity
              key={month}
              style={[styles.monthItem, selectedMonth === index && styles.monthItemSelected]}
              onPress={() => setSelectedMonth(index)}
              activeOpacity={0.75}
            >
              <Text style={[styles.monthText, selectedMonth === index && styles.monthTextSelected]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal style={styles.yearSelector} showsHorizontalScrollIndicator={false}>
          {YEARS.map((year) => (
            <TouchableOpacity
              key={year}
              style={[styles.yearItem, selectedYear === year && styles.yearItemSelected]}
              onPress={() => setSelectedYear(year)}
              activeOpacity={0.75}
            >
              <Text style={[styles.yearText, selectedYear === year && styles.yearTextSelected]}>
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredExpenses}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.summary}>
            <LinearGradient
              colors={['#1D4ED8', '#0A84FF', '#38C6F4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.summaryGlow} pointerEvents="none" />
            <Text style={styles.summaryTitle}>Total Expenses</Text>
            <Text style={styles.summaryAmount}>Rp {totalExpenses.toLocaleString('id-ID')}</Text>
            <Text style={styles.summaryPeriod}>{MONTHS[selectedMonth]} {selectedYear}</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={28} color={palette.inkFaint} />
            <Text style={styles.emptyStateText}>
              {loading ? 'Loading...' : `No expenses for ${MONTHS[selectedMonth]} ${selectedYear}`}
            </Text>
          </View>
        }
      />

      {/* Modal Konfirmasi Hapus */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={cancelDeleteExpense}>
        <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Ionicons name="trash" size={22} color={palette.red} />
            </View>
            <Text style={styles.confirmCardTitle}>Delete Expense</Text>
            <Text style={styles.confirmCardBody}>This action can't be undone. Are you sure you want to delete this expense?</Text>
            <View style={styles.confirmCardActions}>
              <TouchableOpacity onPress={cancelDeleteExpense} style={styles.ghostActionButton} activeOpacity={0.75}>
                <Text style={styles.ghostActionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDeleteExpense} style={styles.dangerActionButton} activeOpacity={0.85}>
                <Text style={styles.dangerActionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
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
  dateSelector: {
    paddingBottom: 6,
  },
  monthSelector: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  monthItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: palette.card,
  },
  monthItemSelected: {
    backgroundColor: palette.blue,
  },
  monthText: {
    fontSize: 13.5,
    color: palette.inkSoft,
    fontWeight: '500',
  },
  monthTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  yearSelector: {
    paddingHorizontal: 20,
  },
  yearItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: palette.card,
  },
  yearItemSelected: {
    backgroundColor: palette.blue,
  },
  yearText: {
    fontSize: 12.5,
    color: palette.inkSoft,
    fontWeight: '500',
  },
  yearTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  summary: {
    padding: 22,
    borderRadius: 26,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: 6,
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: palette.card,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  expenseItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(10,132,255,0.1)',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  expenseTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: palette.ink,
  },
  expenseDate: {
    fontSize: 12,
    color: palette.inkFaint,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14.5,
    fontWeight: '700',
    color: palette.red,
    fontVariant: ['tabular-nums'],
  },
  deleteIconButton: {
    marginLeft: 10,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 8,
    backgroundColor: palette.card,
    borderRadius: 22,
  },
  emptyStateText: {
    color: palette.inkFaint,
    fontSize: 13.5,
    fontWeight: '500',
  },

  // Delete confirmation modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: 300,
  },
  confirmIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,69,58,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
    marginBottom: 8,
  },
  confirmCardBody: {
    fontSize: 13.5,
    color: palette.inkSoft,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  confirmCardActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  ghostActionButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: palette.bg,
    alignItems: 'center',
  },
  ghostActionText: {
    color: palette.ink,
    fontWeight: '700',
    fontSize: 14.5,
  },
  dangerActionButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: palette.red,
    alignItems: 'center',
  },
  dangerActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14.5,
  },
});
