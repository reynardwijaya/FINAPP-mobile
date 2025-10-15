import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Tipe untuk transaksi
interface Transaction {
  id: number;
  title: string;
  date: string;
  created_at: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
}

// Tipe untuk userRole dan userName
let userRole: 'admin' | 'staff' | null = null;
let userName: string | null = null;
if (typeof window !== 'undefined') {
  const params = new URLSearchParams(window.location.search);
  userRole = params.get('userRole') as 'admin' | 'staff' | null;
  userName = params.get('userName');
} else {
  // @ts-ignore
  const { useLocalSearchParams } = require('expo-router');
  const params = useLocalSearchParams();
  userRole = params.userRole as 'admin' | 'staff' | null;
  userName = params.userName as string | null;
}

useEffect(() => {
  if (!userRole || !userName) {
    router.replace('/');
  }
}, []);

export default function Home() {
  const [balance, setBalance] = useState('Rp 5.000.000');
  const [expenses, setExpenses] = useState('Rp 2.500.000');
  const [income, setIncome] = useState('Rp 7.500.000');
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [showMonthYearModal, setShowMonthYearModal] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date().getMonth());
  const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    if (showMonthYearModal) {
      setTempSelectedMonth(selectedMonth);
      setTempSelectedYear(selectedYear);
    }
  }, [showMonthYearModal, selectedMonth, selectedYear]);

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - 2 + i
  );

  const handleLogout = async () => {
    router.replace('/');
  };

  const togglePeriod = () => {
    setSelectedPeriod(prev => prev === 'This Month' ? 'This Year' : 'This Month');
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateSelection = (month?: number, year?: number) => {
    if (month !== undefined) setSelectedMonth(month);
    if (year !== undefined) setSelectedYear(year);
  };

  const confirmDateSelection = () => {
    setShowDatePicker(false);
    // Here you would typically fetch data for the selected month/year
  };

  const getDisplayPeriod = () => {
    if (selectedPeriod === 'This Month') {
      return `${months[selectedMonth]} ${selectedYear}`;
    }
    return `Year ${selectedYear}`;
  };

  const menuItems: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    onPress: () => void;
    roles: ('admin' | 'staff')[];
  }[] = [
    { 
      icon: 'wallet', 
      title: 'Expenses', 
      onPress: () => router.push('/expenses'),
      roles: ['admin', 'staff']
    },
    { 
      icon: 'bar-chart', 
      title: 'Budget', 
      onPress: () => router.push('/budget'),
      roles: ['admin'] 
    },
    { 
      icon: 'pie-chart', 
      title: 'Analytics', 
      onPress: () => router.push('/analytics'),
      roles: ['admin'] 
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole as 'admin' | 'staff'));

  // Tambahkan fungsi untuk fetch balance sesuai bulan/tahun
  const fetchBalance = (month: number, year: number) => {
    fetch(`https://backendreact-production-e680.up.railway.app/balance?user_id=1&month=${month+1}&year=${year}`)
      .then(res => res.json())
      .then(data => {
        setBalance(`Rp ${Number(data.balance).toLocaleString('id-ID')}`);
        setIncome(`Rp ${Number(data.income).toLocaleString('id-ID')}`);
        setExpenses(`Rp ${Number(data.expenses).toLocaleString('id-ID')}`);
      })
      .catch(() => {
        setBalance('Rp 0');
        setIncome('Rp 0');
        setExpenses('Rp 0');
      });
  };

  useEffect(() => {
    // fetchBalance(selectedMonth, selectedYear); // Panggilan ini akan dipindahkan ke useFocusEffect
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      // Panggil fetchBalance di sini agar selalu update saat layar fokus
      fetchBalance(selectedMonth, selectedYear);

      fetch('https://backendreact-production-e680.up.railway.app/transactions')
        .then(res => res.json())
        .then(data => {
          setTransactions(data.transactions || []);
          // Tambahkan log untuk debug
          console.log('ALL TRANSACTIONS:', data.transactions);
        })
        .catch(() => setTransactions([]));
    }, [selectedMonth, selectedYear]) // Tambahkan selectedMonth, selectedYear sebagai dependencies
  );

  const handleDeleteExpense = (id: number) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteExpense = async () => {
    if (deleteId === null) return;
    setShowDeleteModal(false);
    try {
      const res = await fetch(`https://backendreact-production-e680.up.railway.app/transactions/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setTransactions(prev => prev.filter(tx => tx.id !== deleteId));
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

  // Hitung income breakdown dinamis
  const filteredIncomes = transactions.filter(tx => tx.type === 'income');

  // Untuk breakdown bulanan
  const monthlyIncomes = filteredIncomes.filter(tx => {
    const date = new Date(tx.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });
  const salaryIncome = monthlyIncomes.filter(tx => tx.category === 'salary').reduce((sum, tx) => sum + tx.amount, 0);
  const giftIncome = monthlyIncomes.filter(tx => tx.category === 'gift').reduce((sum, tx) => sum + tx.amount, 0);
  const otherIncome = monthlyIncomes.filter(tx => tx.category === 'other').reduce((sum, tx) => sum + tx.amount, 0);
  const totalMonthlyIncome = salaryIncome + giftIncome + otherIncome;

  // Untuk breakdown tahunan (per kuartal)
  const yearlyIncomes = filteredIncomes.filter(tx => {
    const date = new Date(tx.date);
    return date.getFullYear() === selectedYear;
  });
  const getQuarter = (month: number) => Math.floor(month / 3) + 1;
  const q1Income = yearlyIncomes.filter(tx => getQuarter(new Date(tx.date).getMonth()) === 1).reduce((sum, tx) => sum + tx.amount, 0);
  const q2Income = yearlyIncomes.filter(tx => getQuarter(new Date(tx.date).getMonth()) === 2).reduce((sum, tx) => sum + tx.amount, 0);
  const q3Income = yearlyIncomes.filter(tx => getQuarter(new Date(tx.date).getMonth()) === 3).reduce((sum, tx) => sum + tx.amount, 0);
  const q4Income = yearlyIncomes.filter(tx => getQuarter(new Date(tx.date).getMonth()) === 4).reduce((sum, tx) => sum + tx.amount, 0);
  const totalYearIncome = q1Income + q2Income + q3Income + q4Income;

  // Fungsi untuk memilih bulan/tahun dari modal
  const handleMonthYearSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowMonthYearModal(false);
  };

  const filteredExpenses = transactions.filter(tx => tx.type === 'expense');
  console.log('FILTERED EXPENSES:', filteredExpenses);

  const monthlyExpenses = filteredExpenses.filter(tx => {
    const date = new Date(tx.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });
  console.log('MONTHLY EXPENSES:', monthlyExpenses);

  if (!userRole || !userName) {
    return null;
  }

  return (
    <LinearGradient
      colors={['#ADD8E6', '#87CEEB', '#6495ED']}
      style={styles.gradientBackground}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back!</Text>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.roleText}>
              {userRole === 'admin' ? 'Administrator' : 'Staff Member'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceTitle}>Total Balance</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.periodText}>{months[selectedMonth]} {selectedYear}</Text>
                <TouchableOpacity onPress={() => setShowMonthYearModal(true)} style={{ marginLeft: 8 }}>
                  <Ionicons name="calendar" size={24} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
            {userRole === 'admin' && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => router.push('/add-balance')}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.balanceAmount}>{balance}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Income</Text>
              <Text style={[styles.balanceValue, styles.incomeValue]}>{income}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Expenses</Text>
              <Text style={[styles.balanceValue, styles.expenseValue]}>{expenses}</Text>
            </View>
          </View>
        </View>

        {/* Income Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Income Breakdown</Text>
          <TouchableOpacity onPress={() => router.push('/income')}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.incomeCard}>
          <View style={styles.incomeHeader}>
            <Text style={styles.incomeTitle}>{months[selectedMonth]} {selectedYear}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => setShowMonthYearModal(true)} style={{ marginLeft: 8 }}>
                <Ionicons name="calendar" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          {selectedPeriod === 'This Month' ? (
            <View style={styles.incomeDetails}>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Penjualan</Text>
                <Text style={styles.incomeAmount}>Rp {salaryIncome.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Sponsor</Text>
                <Text style={styles.incomeAmount}>Rp {giftIncome.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Other</Text>
                <Text style={styles.incomeAmount}>Rp {otherIncome.toLocaleString('id-ID')}</Text>
              </View>
              <View style={[styles.incomeRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Income</Text>
                <Text style={styles.totalAmount}>Rp {totalMonthlyIncome.toLocaleString('id-ID')}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.incomeDetails}>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Q1 {selectedYear}</Text>
                <Text style={styles.incomeAmount}>Rp {q1Income.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Q2 {selectedYear}</Text>
                <Text style={styles.incomeAmount}>Rp {q2Income.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Q3 {selectedYear}</Text>
                <Text style={styles.incomeAmount}>Rp {q3Income.toLocaleString('id-ID')}</Text>
              </View>
              <View style={styles.incomeRow}>
                <Text style={styles.incomeLabel}>Q4 {selectedYear}</Text>
                <Text style={styles.incomeAmount}>Rp {q4Income.toLocaleString('id-ID')}</Text>
              </View>
              <View style={[styles.incomeRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Year Income</Text>
                <Text style={styles.totalAmount}>Rp {totalYearIncome.toLocaleString('id-ID')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Date Picker Modal */}
        {Platform.OS !== 'web' && (
          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select {selectedPeriod === 'This Month' ? 'Month' : 'Year'}</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                {selectedPeriod === 'This Month' && (
                  <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Month</Text>
                    <View style={styles.monthGrid}>
                      {months.map((month, index) => (
                        <TouchableOpacity
                          key={month}
                          style={[
                            styles.monthItem,
                            selectedMonth === index && styles.selectedItem
                          ]}
                          onPress={() => handleDateSelection(index)}
                        >
                          <Text style={[
                            styles.monthText,
                            selectedMonth === index && styles.selectedText
                          ]}>
                            {month.substring(0, 3)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerLabel}>Year</Text>
                  <View style={styles.yearList}>
                    {years.map(year => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.yearItem,
                          selectedYear === year && styles.selectedItem
                        ]}
                        onPress={() => handleDateSelection(undefined, year)}
                      >
                        <Text style={[
                          styles.yearText,
                          selectedYear === year && styles.selectedText
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={confirmDateSelection}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.menuGrid}>
          {filteredMenuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name={item.icon} size={24} color="#007AFF" />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/expenses')}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionList}>
          {transactions.length === 0 ? (
            <Text style={{ color: '#666', textAlign: 'center' }}>No transactions found.</Text>
          ) : (
            [...transactions]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((tx, index) => (
                <View key={index} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={styles.transactionIcon}>
                      <Ionicons name={tx.type === 'income' ? 'cash' : 'cart'} size={20} color="#007AFF" />
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.transactionTitle} numberOfLines={1} ellipsizeMode="tail">{tx.title}</Text>
                      <Text style={styles.transactionDate}>{tx.date.substring(0, 10)}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        tx.type === 'income' ? { color: '#4CAF50' } : { color: '#FF3B30' },
                        { flexShrink: 1 }
                      ]}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                    >
                      {tx.type === 'expense' ? '-' : '+'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => { if (typeof tx.id !== 'undefined') handleDeleteExpense(tx.id); }} 
                      style={{ marginLeft: 12, flexShrink: 0 }}
                    >
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>

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

        {/* Modal Pilih Bulan & Tahun */}
        {showMonthYearModal && (
          <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <View style={{ backgroundColor: '#fff', padding: 24, borderRadius: 12, alignItems: 'center', width: 320 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Select Month & Year</Text>
              <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxWidth: 220 }}>
                  {months.map((month, idx) => (
                    <TouchableOpacity
                      key={month}
                      style={{ padding: 10, margin: 4, borderRadius: 8, backgroundColor: tempSelectedMonth === idx ? '#007AFF' : '#f0f0f0' }}
                      onPress={() => setTempSelectedMonth(idx)}
                    >
                      <Text style={{ color: tempSelectedMonth === idx ? '#fff' : '#333', fontWeight: tempSelectedMonth === idx ? 'bold' : 'normal' }}>{month}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ flexDirection: 'row', marginBottom: 24 }}>
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={{ padding: 10, margin: 4, borderRadius: 8, backgroundColor: tempSelectedYear === year ? '#007AFF' : '#f0f0f0' }}
                      onPress={() => setTempSelectedYear(year)}
                    >
                      <Text style={{ color: tempSelectedYear === year ? '#fff' : '#333', fontWeight: tempSelectedYear === year ? 'bold' : 'normal' }}>{year}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={{ flexDirection: 'row', width: '100%' }}>
                <TouchableOpacity onPress={() => setShowMonthYearModal(false)} style={{ flex: 1, marginRight: 8, padding: 12, backgroundColor: '#eee', borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleMonthYearSelect(tempSelectedMonth, tempSelectedYear)} style={{ flex: 1, marginLeft: 8, padding: 12, backgroundColor: '#007AFF', borderRadius: 8, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  roleText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  balanceCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#007AFF',
    borderRadius: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllButton: {
    color: '#007AFF',
    fontSize: 14,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  menuItem: {
    width: (width / 3) - 10,
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 5,
    marginBottom: 20,
  },
  menuIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
  },
  transactionList: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  incomeValue: {
    color: '#4CAF50',
  },
  expenseValue: {
    color: '#FF3B30',
  },
  incomeBreakdown: {
    marginBottom: 20,
  },
  incomeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  incomeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  periodButton: {
    padding: 8,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
  },
  incomeDetails: {
    marginTop: 10,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  incomeLabel: {
    fontSize: 14,
    color: '#666',
  },
  incomeAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  totalRow: {
    marginTop: 10,
    borderBottomWidth: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: width - 40,
    maxHeight: height - 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 10,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  monthItem: {
    width: (width - 80) / 4,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  monthText: {
    fontSize: 14,
    color: '#333',
  },
  yearList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  yearItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    margin: 5,
  },
  yearText: {
    fontSize: 14,
    color: '#333',
  },
  selectedItem: {
    backgroundColor: '#007AFF',
  },
  selectedText: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  }
}); 