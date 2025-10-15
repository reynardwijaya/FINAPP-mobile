import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const years = Array.from(
  { length: 5 },
  (_, i) => new Date().getFullYear() - 2 + i
);

interface SpendingDistributionItem {
  category: string;
  total_amount: number;
}

interface MonthlyTrendItem {
  month: number;
  total_amount: number;
}

export default function Analytics() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [spendingDistributionData, setSpendingDistributionData] = useState<SpendingDistributionItem[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendItem[]>([]);
  const [monthlyIncomeTrendData, setMonthlyIncomeTrendData] = useState<MonthlyTrendItem[]>([]);
  const [keyInsights, setKeyInsights] = useState<string>('');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [showMonthYearModal, setShowMonthYearModal] = useState(false);
  const [tempSelectedMonth, setTempSelectedMonth] = useState(new Date().getMonth());
  const [tempSelectedYear, setTempSelectedYear] = useState(new Date().getFullYear());

  const trendViews = ['spending', 'income'];
  const [currentTrendIndex, setCurrentTrendIndex] = useState(0); // 0: Spending, 1: Income

  const currentTrendView = trendViews[currentTrendIndex];

  const handlePrevTrend = () => {
    setCurrentTrendIndex((prevIndex) =>
      prevIndex === 0 ? trendViews.length - 1 : prevIndex - 1
    );
  };

  const handleNextTrend = () => {
    setCurrentTrendIndex((prevIndex) =>
      prevIndex === trendViews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const fetchAnalyticsData = useCallback(async () => {
    setIsLoadingInsights(true);
    try {
      // Fetch Spending Distribution
      const spendingRes = await fetch(`https://backendreact-production-e680.up.railway.app/analytics/spending-distribution?user_id=1&month=${selectedMonth + 1}&year=${selectedYear}`);
      const spendingData = await spendingRes.json();
      if (spendingRes.ok) {
        setSpendingDistributionData(spendingData.data || []);
      } else {
        console.error('Failed to fetch spending distribution', spendingData.error);
        setSpendingDistributionData([]);
      }

      // Fetch Monthly Spending Trend
      const trendRes = await fetch(`https://backendreact-production-e680.up.railway.app/analytics/monthly-trend?user_id=1&year=${selectedYear}`);
      const trendData = await trendRes.json();
      if (trendRes.ok) {
        setMonthlyTrendData(trendData.data || []);
      } else {
        console.error('Failed to fetch monthly trend', trendData.error);
        setMonthlyTrendData([]);
      }

      // Fetch Monthly Income Trend
      const incomeTrendRes = await fetch(`https://backendreact-production-e680.up.railway.app/analytics/monthly-income-trend?user_id=1&year=${selectedYear}`);
      const incomeTrendData = await incomeTrendRes.json();
      if (incomeTrendRes.ok) {
        setMonthlyIncomeTrendData(incomeTrendData.data || []);
      } else {
        console.error('Failed to fetch monthly income trend', incomeTrendData.error);
        setMonthlyIncomeTrendData([]);
      }

      // Fetch AI Insights
      const insightsRes = await fetch(`https://backendreact-production-e680.up.railway.app/analytics/insights?user_id=1&month=${selectedMonth + 1}&year=${selectedYear}`);
      const insightsData = await insightsRes.json();
      if (insightsRes.ok) {
        setKeyInsights(insightsData.insights || 'No insights available.');
      } else {
        console.error('Failed to fetch insights', insightsData.error);
        setKeyInsights('Failed to load insights.');
      }

    } catch (err) {
      console.error('Failed to connect to analytics server', err);
      setSpendingDistributionData([]);
      setMonthlyTrendData([]);
      setMonthlyIncomeTrendData([]);
      setKeyInsights('Could not connect to insights server.');
    } finally {
      setIsLoadingInsights(false);
    }
  }, [selectedMonth, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      fetchAnalyticsData();
    }, [fetchAnalyticsData])
  );

  useEffect(() => {
    if (showMonthYearModal) {
      setTempSelectedMonth(selectedMonth);
      setTempSelectedYear(selectedYear);
    }
  }, [showMonthYearModal, selectedMonth, selectedYear]);

  const handleMonthYearSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setShowMonthYearModal(false);
  };

  const totalSpendingForDistribution = spendingDistributionData.reduce((sum, item) => sum + item.total_amount, 0);

  const maxAmount = monthlyTrendData.reduce((max, item) => Math.max(max, item.total_amount), 0);
  const maxIncomeAmount = monthlyIncomeTrendData.reduce((max, item) => Math.max(max, item.total_amount), 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={() => setShowMonthYearModal(true)}>
          <Ionicons name="calendar" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Distribution ({months[selectedMonth]} {selectedYear})</Text>
          <View style={styles.pieChart}>
            {totalSpendingForDistribution === 0 ? (
              <Text style={{ textAlign: 'center', color: '#666' }}>No spending data for this period.</Text>
            ) : (
              spendingDistributionData.map((item, index) => {
                const percentage = totalSpendingForDistribution > 0 ? (item.total_amount / totalSpendingForDistribution) * 100 : 0;
                const color = SPENDING_COLORS[item.category] || '#ccc'; 
                return (
                  <View key={item.category} style={styles.pieChartLegend}> 
                    <View style={[styles.legendColor, { backgroundColor: color }]} />
                    <View style={styles.legendText}> 
                      <Text style={styles.legendTitle}>{item.category}</Text> 
                      <Text style={styles.legendPercentage}>{percentage.toFixed(1)}% • Rp {Number(item.total_amount).toLocaleString('id-ID')}</Text> 
                    </View> 
                  </View>
                );
              })
            )}
          </View>
        </View>

        {/* Combined Monthly Trend Card */}
        <View style={styles.card}>
          <View style={styles.trendHeader}>
            <TouchableOpacity onPress={handlePrevTrend}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.cardTitle}> 
              {currentTrendView === 'spending' ? 'Monthly Spending Trend' : 'Monthly Income Trend'} ({selectedYear})
            </Text>
            <TouchableOpacity onPress={handleNextTrend}>
              <Ionicons name="arrow-forward" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {currentTrendView === 'spending' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barChartContentContainer}> 
              {monthlyTrendData.length === 0 ? (
                 <Text style={{ textAlign: 'center', color: '#666', flex: 1 }}>No monthly trend data for this year.</Text>
              ) : (
                monthlyTrendData.map((item, index) => {
                  const monthName = months[item.month - 1].substring(0, 3); 
                  const barHeight = maxAmount > 0 ? (item.total_amount / maxAmount) * 150 : 0;
                  return (
                    <View key={item.month} style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            height: barHeight, 
                            backgroundColor: (selectedMonth + 1) === item.month ? '#007AFF' : '#E5E5EA'
                          }
                        ]}
                      />
                      <Text style={styles.barLabel}>{monthName}</Text>
                      <Text 
                        style={styles.barValue}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.5}
                      >Rp {item.total_amount.toLocaleString('id-ID')}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView> 
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barChartContentContainer}> 
              {monthlyIncomeTrendData.length === 0 ? (
                 <Text style={{ textAlign: 'center', color: '#666', flex: 1 }}>No monthly income trend data for this year.</Text>
              ) : (
                monthlyIncomeTrendData.map((item, index) => {
                  const monthName = months[item.month - 1].substring(0, 3); 
                  const barHeight = maxIncomeAmount > 0 ? (item.total_amount / maxIncomeAmount) * 150 : 0;
                  return (
                    <View key={item.month} style={styles.barContainer}>
                      <View 
                        style={[
                          styles.bar, 
                          { 
                            height: barHeight, 
                            backgroundColor: (selectedMonth + 1) === item.month ? '#4CAF50' : '#E5E5EA'
                          }
                        ]}
                      />
                      <Text style={styles.barLabel}>{monthName}</Text>
                      <Text 
                        style={styles.barValue}
                        adjustsFontSizeToFit={true}
                        minimumFontScale={0.5}
                      >Rp {item.total_amount.toLocaleString('id-ID')}</Text>
                    </View>
                  );
                })
              )}
            </ScrollView> 
          )}
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showMonthYearModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMonthYearModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Month & Year</Text>
                <TouchableOpacity onPress={() => setShowMonthYearModal(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Month</Text>
                <View style={styles.monthGrid}>
                  {months.map((month, idx) => (
                    <TouchableOpacity
                      key={month}
                      style={{ padding: 10, margin: 4, borderRadius: 8, backgroundColor: tempSelectedMonth === idx ? '#007AFF' : '#f0f0f0' }}
                      onPress={() => setTempSelectedMonth(idx)}
                    >
                      <Text style={{ color: tempSelectedMonth === idx ? '#fff' : '#333', fontWeight: tempSelectedMonth === idx ? 'bold' : 'normal' }}>{month.substring(0, 3)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Year</Text>
                <View style={styles.yearList}>
                  {years.map(year => (
                    <TouchableOpacity
                      key={year}
                      style={{ padding: 10, margin: 4, borderRadius: 8, backgroundColor: tempSelectedYear === year ? '#007AFF' : '#f0f0f0' }}
                      onPress={() => setTempSelectedYear(year)}
                    >
                      <Text style={{ color: tempSelectedYear === year ? '#fff' : '#333', fontWeight: tempSelectedYear === year ? 'bold' : 'normal' }}>{year}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleMonthYearSelect(tempSelectedMonth, tempSelectedYear)}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Key Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Key Insights</Text>
          {isLoadingInsights ? (
            <ActivityIndicator size="small" color="#007AFF" />
          ) : (
            <Text style={styles.insightTextContent}>{keyInsights}</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const SPENDING_COLORS: { [key: string]: string } = {
  'Food & Drinks': '#007AFF',
  'Transportation': '#34C759',
  'Shopping': '#FF9500',
  'Utilities': '#5856D6',
  'Other': '#FF2D55',
  'Penjualan': '#007AFF',
  'Sponsor': '#34C759',
  'Gaji Pegawai': '#007AFF',
  'Restock': '#34C759',
};

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
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  pieChart: {
    marginTop: 10,
  },
  pieChartLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  legendText: {
    flex: 1,
  },
  legendTitle: {
    fontSize: 14,
    color: '#333',
  },
  legendPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  barChartContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: 120,
    marginHorizontal: 0,
    paddingHorizontal: 5,
  },
  bar: {
    width: 20,
    borderRadius: 10,
  },
  barLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  barValue: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  insightTextContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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
    maxHeight: Dimensions.get('window').height - 100,
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
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
}); 