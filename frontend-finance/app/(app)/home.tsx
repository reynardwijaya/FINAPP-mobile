import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, Platform, Alert } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { API_BASE_URL } from '../../constants/Api';

const { width, height } = Dimensions.get('window');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Palet warna gaya Apple: biru sebagai warna utama, putih/abu sangat muda sebagai dasar.
const palette = {
  bg: '#F2F4F8',
  card: '#FFFFFF',
  ink: '#1C1C1E',
  inkSoft: '#6E6E73',
  inkFaint: '#AEAEB2',
  divider: '#EDEDF2',
  blue: '#0A84FF',
  blueDeep: '#1D4ED8',
  cyan: '#38C6F4',
  green: '#30D158',
  red: '#FF453A',
  chipBg: '#EAF2FF',
};

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

export default function Home() {
  const params = useLocalSearchParams();
  const userRole = params.userRole as 'admin' | 'staff' | null;
  const userName = params.userName as string | null;

  useEffect(() => {
    if (!userRole || !userName) {
      router.replace('/');
    }
  }, [userRole, userName]);

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
    colors: [string, string];
  }[] = [
    {
      icon: 'wallet',
      title: 'Expenses',
      onPress: () => router.push('/expenses'),
      roles: ['admin', 'staff'],
      colors: ['#0A84FF', '#4FA6FF'],
    },
    {
      icon: 'bar-chart',
      title: 'Budget',
      onPress: () => router.push('/budget'),
      roles: ['admin'],
      colors: ['#7C5CFC', '#A78BFA'],
    },
    {
      icon: 'pie-chart',
      title: 'Analytics',
      onPress: () => router.push('/analytics'),
      roles: ['admin'],
      colors: ['#12B8C4', '#38C6F4'],
    },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole as 'admin' | 'staff'));

  // Tambahkan fungsi untuk fetch balance sesuai bulan/tahun
  const fetchBalance = (month: number, year: number) => {
    fetch(`${API_BASE_URL}/balance?user_id=1&month=${month+1}&year=${year}`)
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

      fetch(`${API_BASE_URL}/transactions`)
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
      const res = await fetch(`${API_BASE_URL}/transactions/${deleteId}`, { method: 'DELETE' });
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
    <View style={styles.screen}>
      {/* Hero wash — nuansa biru lembut di atas, memudar ke putih */}
      <LinearGradient
        colors={['#E4EEFF', '#F2F4F8']}
        style={styles.heroWash}
        pointerEvents="none"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBarWrap}>
          <BlurView intensity={55} tint="light" style={styles.topBar}>
            <View style={styles.topBarLeft}>
              <LinearGradient
                colors={['#0A84FF', '#38C6F4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>{(userName ?? '?').trim().charAt(0).toUpperCase()}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.greeting}>Welcome back</Text>
                <Text style={styles.name} numberOfLines={1}>{userName}</Text>
              </View>
            </View>
            <View style={styles.topBarRight}>
              <View style={styles.rolePill}>
                <View style={styles.roleDot} />
                <Text style={styles.roleText}>
                  {userRole === 'admin' ? 'Admin' : 'Staff'}
                </Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} activeOpacity={0.7}>
                <Ionicons name="log-out-outline" size={18} color={palette.red} />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={['#1D4ED8', '#0A84FF', '#38C6F4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.balanceGlow} pointerEvents="none" />

          <View style={styles.balanceHeader}>
            <View>
              <Text style={styles.balanceTitle}>Total Balance</Text>
              <TouchableOpacity
                onPress={() => setShowMonthYearModal(true)}
                style={styles.periodChip}
                activeOpacity={0.75}
              >
                <Ionicons name="calendar-outline" size={13} color="#fff" />
                <Text style={styles.periodChipText}>{months[selectedMonth]} {selectedYear}</Text>
              </TouchableOpacity>
            </View>
            {userRole === 'admin' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/add-balance')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.balanceAmount}>{balance}</Text>

          <View style={styles.balanceRow}>
            <View style={styles.balancePill}>
              <View style={[styles.balanceIconDot, { backgroundColor: 'rgba(48,209,88,0.22)' }]}>
                <Ionicons name="arrow-down" size={13} color="#65E88C" />
              </View>
              <View>
                <Text style={styles.balanceLabel}>Income</Text>
                <Text style={[styles.balanceValue, { color: '#7CF0A0' }]}>{income}</Text>
              </View>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balancePill}>
              <View style={[styles.balanceIconDot, { backgroundColor: 'rgba(255,69,58,0.22)' }]}>
                <Ionicons name="arrow-up" size={13} color="#FF9187" />
              </View>
              <View>
                <Text style={styles.balanceLabel}>Expenses</Text>
                <Text style={[styles.balanceValue, { color: '#FF9187' }]}>{expenses}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Income Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Income Breakdown</Text>
          <TouchableOpacity onPress={() => router.push('/income')} activeOpacity={0.6}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          <View style={styles.incomeHeader}>
            <Text style={styles.incomeTitle}>{months[selectedMonth]} {selectedYear}</Text>
            <TouchableOpacity
              onPress={() => setShowMonthYearModal(true)}
              style={styles.iconGhostButton}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={16} color={palette.blue} />
            </TouchableOpacity>
          </View>

          {selectedPeriod === 'This Month' ? (
            <View>
              <IncomeRow label="Penjualan" amount={salaryIncome} />
              <IncomeRow label="Sponsor" amount={giftIncome} />
              <IncomeRow label="Other" amount={otherIncome} />
              <TotalRow label="Total Income" amount={totalMonthlyIncome} />
            </View>
          ) : (
            <View>
              <IncomeRow label={`Q1 ${selectedYear}`} amount={q1Income} />
              <IncomeRow label={`Q2 ${selectedYear}`} amount={q2Income} />
              <IncomeRow label={`Q3 ${selectedYear}`} amount={q3Income} />
              <IncomeRow label={`Q4 ${selectedYear}`} amount={q4Income} />
              <TotalRow label="Total Year Income" amount={totalYearIncome} />
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
            <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select {selectedPeriod === 'This Month' ? 'Month' : 'Year'}</Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)} style={styles.iconGhostButton}>
                    <Ionicons name="close" size={20} color={palette.ink} />
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
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
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
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={item.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.menuIconBox}
              >
                <Ionicons name={item.icon} size={24} color="#fff" />
              </LinearGradient>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/expenses')} activeOpacity={0.6}>
            <Text style={styles.seeAllButton}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.card}>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={28} color={palette.inkFaint} />
              <Text style={styles.emptyStateText}>No transactions found</Text>
            </View>
          ) : (
            [...transactions]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 3)
              .map((tx, index, arr) => (
                <View
                  key={index}
                  style={[styles.transactionItem, index === arr.length - 1 && styles.transactionItemLast]}
                >
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: tx.type === 'income' ? 'rgba(48,209,88,0.12)' : 'rgba(10,132,255,0.12)' },
                      ]}
                    >
                      <Ionicons
                        name={tx.type === 'income' ? 'cash' : 'cart'}
                        size={18}
                        color={tx.type === 'income' ? palette.green : palette.blue}
                      />
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
                        tx.type === 'income' ? { color: palette.green } : { color: palette.red },
                        { flexShrink: 1 }
                      ]}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.7}
                    >
                      {tx.type === 'expense' ? '-' : '+'}Rp {Number(tx.amount).toLocaleString('id-ID')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => { if (typeof tx.id !== 'undefined') handleDeleteExpense(tx.id); }}
                      style={styles.deleteIconButton}
                    >
                      <Ionicons name="trash-outline" size={16} color={palette.inkFaint} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
          )}
        </View>

        {/* Modal Konfirmasi Hapus */}
        <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={cancelDeleteExpense}>
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.confirmCard}>
              <View style={styles.confirmIconWrap}>
                <Ionicons name="trash" size={22} color={palette.red} />
              </View>
              <Text style={styles.confirmCardTitle}>Delete Transaction</Text>
              <Text style={styles.confirmCardBody}>This action can't be undone. Are you sure you want to delete this transaction?</Text>
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

        {/* Modal Pilih Bulan & Tahun */}
        <Modal visible={showMonthYearModal} transparent animationType="fade" onRequestClose={() => setShowMonthYearModal(false)}>
          <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
            <View style={styles.periodModalCard}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>

              <Text style={styles.pickerLabel}>Month</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
                {months.map((month, idx) => (
                  <TouchableOpacity
                    key={month}
                    style={[styles.monthPickerChip, tempSelectedMonth === idx && styles.monthPickerChipActive]}
                    onPress={() => setTempSelectedMonth(idx)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.monthPickerChipText, tempSelectedMonth === idx && styles.monthPickerChipTextActive]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.pickerLabel, { marginTop: 18 }]}>Year</Text>
              <View style={styles.yearRow}>
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <TouchableOpacity
                      key={year}
                      style={[styles.monthPickerChip, tempSelectedYear === year && styles.monthPickerChipActive]}
                      onPress={() => setTempSelectedYear(year)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.monthPickerChipText, tempSelectedYear === year && styles.monthPickerChipTextActive]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.confirmCardActions, { marginTop: 24 }]}>
                <TouchableOpacity onPress={() => setShowMonthYearModal(false)} style={styles.ghostActionButton} activeOpacity={0.75}>
                  <Text style={styles.ghostActionText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleMonthYearSelect(tempSelectedMonth, tempSelectedYear)}
                  style={styles.primaryActionButton}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dangerActionText}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Modal>
      </ScrollView>
    </View>
  );
}

function IncomeRow({ label, amount }: { label: string; amount: number }) {
  return (
    <View style={styles.incomeRow}>
      <View style={styles.incomeRowLeft}>
        <View style={styles.incomeDot} />
        <Text style={styles.incomeLabel}>{label}</Text>
      </View>
      <Text style={styles.incomeAmount}>Rp {amount.toLocaleString('id-ID')}</Text>
    </View>
  );
}

function TotalRow({ label, amount }: { label: string; amount: number }) {
  return (
    <View style={[styles.incomeRow, styles.totalRow]}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={styles.totalAmount}>Rp {amount.toLocaleString('id-ID')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  heroWash: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 340,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  topBarWrap: {
    paddingHorizontal: 16,
    paddingTop: 58,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 26,
    paddingVertical: 10,
    paddingHorizontal: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: palette.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
  },
  greeting: {
    fontSize: 12,
    color: palette.inkSoft,
    letterSpacing: 0.1,
    fontWeight: '500',
  },
  name: {
    fontSize: 16.5,
    fontWeight: '800',
    color: palette.ink,
    marginTop: 1,
    letterSpacing: 0.1,
    maxWidth: 150,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.green,
    marginRight: 6,
  },
  roleText: {
    fontSize: 12,
    color: palette.inkSoft,
    fontWeight: '600',
  },
  logoutButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  // Balance card
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 18,
    padding: 22,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  balanceGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.14)',
    top: -90,
    right: -60,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  balanceTitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  periodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
  },
  periodChipText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '700',
    marginLeft: 2,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#fff',
    marginTop: 18,
    marginBottom: 22,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balancePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.22)',
    marginHorizontal: 12,
  },
  balanceIconDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.72)',
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },

  // Section
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: palette.ink,
    letterSpacing: 0.1,
  },
  seeAllButton: {
    color: palette.blue,
    fontSize: 14,
    fontWeight: '600',
  },

  // Generic card
  card: {
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 20,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  iconGhostButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.chipBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Income breakdown
  incomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  incomeTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: palette.ink,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  incomeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  incomeDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: palette.blue,
  },
  incomeLabel: {
    fontSize: 14.5,
    color: palette.inkSoft,
    fontWeight: '500',
  },
  incomeAmount: {
    fontSize: 14.5,
    fontWeight: '700',
    color: palette.ink,
    fontVariant: ['tabular-nums'],
  },
  totalRow: {
    marginTop: 4,
    borderBottomWidth: 0,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: palette.divider,
  },
  totalLabel: {
    fontSize: 15.5,
    fontWeight: '700',
    color: palette.ink,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: palette.blue,
    fontVariant: ['tabular-nums'],
  },

  // Quick actions
  menuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  menuItem: {
    width: (width / 3) - 16,
    alignItems: 'center',
  },
  menuIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  menuText: {
    fontSize: 12.5,
    color: palette.ink,
    marginTop: 10,
    fontWeight: '600',
  },

  // Transactions
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateText: {
    color: palette.inkFaint,
    fontSize: 13.5,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: palette.divider,
  },
  transactionItemLast: {
    borderBottomWidth: 0,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 14.5,
    fontWeight: '600',
    color: palette.ink,
  },
  transactionDate: {
    fontSize: 12,
    color: palette.inkFaint,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 14.5,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  deleteIconButton: {
    marginLeft: 10,
    padding: 4,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 22,
    width: width - 40,
    maxHeight: height - 100,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: palette.ink,
  },
  pickerContainer: {
    marginBottom: 18,
  },
  pickerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.inkSoft,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  monthItem: {
    width: (width - 84) / 4,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 12,
    backgroundColor: palette.bg,
  },
  monthText: {
    fontSize: 14,
    color: palette.ink,
    fontWeight: '500',
  },
  yearList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  yearItem: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: palette.bg,
    margin: 5,
  },
  yearText: {
    fontSize: 14,
    color: palette.ink,
    fontWeight: '500',
  },
  selectedItem: {
    backgroundColor: palette.blue,
  },
  selectedText: {
    color: '#fff',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: palette.blue,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: palette.blue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // Delete confirmation card
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
  primaryActionButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: palette.blue,
    alignItems: 'center',
  },

  // Month/year modal
  periodModalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: 340,
  },
  monthScroll: {
    maxWidth: '100%',
  },
  yearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthPickerChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: palette.bg,
    marginRight: 8,
  },
  monthPickerChipActive: {
    backgroundColor: palette.blue,
  },
  monthPickerChipText: {
    color: palette.ink,
    fontSize: 13.5,
    fontWeight: '500',
  },
  monthPickerChipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
});
