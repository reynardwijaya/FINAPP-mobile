import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Modal, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';
import Markdown from 'react-native-markdown-display';
import { API_BASE_URL } from '../../constants/Api';

const palette = {
  bg: '#F2F4F8',
  card: '#FFFFFF',
  ink: '#1C1C1E',
  inkSoft: '#6E6E73',
  inkFaint: '#AEAEB2',
  divider: '#EDEDF2',
  blue: '#0A84FF',
  green: '#30D158',
};

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
      const spendingRes = await fetch(`${API_BASE_URL}/analytics/spending-distribution?user_id=1&month=${selectedMonth + 1}&year=${selectedYear}`);
      const spendingData = await spendingRes.json();
      if (spendingRes.ok) {
        setSpendingDistributionData(spendingData.data || []);
      } else {
        console.error('Failed to fetch spending distribution', spendingData.error);
        setSpendingDistributionData([]);
      }

      // Fetch Monthly Spending Trend
      const trendRes = await fetch(`${API_BASE_URL}/analytics/monthly-trend?user_id=1&year=${selectedYear}`);
      const trendData = await trendRes.json();
      if (trendRes.ok) {
        setMonthlyTrendData(trendData.data || []);
      } else {
        console.error('Failed to fetch monthly trend', trendData.error);
        setMonthlyTrendData([]);
      }

      // Fetch Monthly Income Trend
      const incomeTrendRes = await fetch(`${API_BASE_URL}/analytics/monthly-income-trend?user_id=1&year=${selectedYear}`);
      const incomeTrendData = await incomeTrendRes.json();
      if (incomeTrendRes.ok) {
        setMonthlyIncomeTrendData(incomeTrendData.data || []);
      } else {
        console.error('Failed to fetch monthly income trend', incomeTrendData.error);
        setMonthlyIncomeTrendData([]);
      }

      // Fetch AI Insights
      const insightsRes = await fetch(`${API_BASE_URL}/analytics/insights?user_id=1&month=${selectedMonth + 1}&year=${selectedYear}`);
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
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={palette.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity onPress={() => setShowMonthYearModal(true)} style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={18} color={palette.blue} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Spending Distribution */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending Distribution</Text>
          <Text style={styles.cardSubtitle}>{months[selectedMonth]} {selectedYear}</Text>

          {totalSpendingForDistribution === 0 ? (
            <View style={styles.emptyBlock}>
              <Ionicons name="pie-chart-outline" size={26} color={palette.inkFaint} />
              <Text style={styles.emptyText}>No spending data for this period.</Text>
            </View>
          ) : (
            <View style={styles.legendList}>
              {spendingDistributionData.map((item) => {
                const percentage = totalSpendingForDistribution > 0 ? (item.total_amount / totalSpendingForDistribution) * 100 : 0;
                const color = SPENDING_COLORS[item.category] || '#8E8E93';
                return (
                  <View key={item.category} style={styles.legendRow}>
                    <View style={styles.legendTopRow}>
                      <View style={styles.legendLabelWrap}>
                        <View style={[styles.legendColor, { backgroundColor: color }]} />
                        <Text style={styles.legendTitle}>{item.category}</Text>
                      </View>
                      <Text style={styles.legendValue}>Rp {Number(item.total_amount).toLocaleString('id-ID')}</Text>
                    </View>
                    <View style={styles.legendTrack}>
                      <View style={[styles.legendBar, { width: `${percentage}%`, backgroundColor: color }]} />
                    </View>
                    <Text style={styles.legendPercentage}>{percentage.toFixed(1)}%</Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Combined Monthly Trend Card */}
        <View style={styles.card}>
          <View style={styles.trendHeader}>
            <TouchableOpacity onPress={handlePrevTrend} style={styles.trendArrowButton} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={16} color={palette.ink} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.cardTitle}>
                {currentTrendView === 'spending' ? 'Spending Trend' : 'Income Trend'}
              </Text>
              <Text style={styles.cardSubtitle}>{selectedYear}</Text>
            </View>
            <TouchableOpacity onPress={handleNextTrend} style={styles.trendArrowButton} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={16} color={palette.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.trendDots}>
            {trendViews.map((view, idx) => (
              <View key={view} style={[styles.trendDot, idx === currentTrendIndex && styles.trendDotActive]} />
            ))}
          </View>

          {currentTrendView === 'spending' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barChartContentContainer}>
              {monthlyTrendData.length === 0 ? (
                <Text style={styles.emptyInlineText}>No monthly trend data for this year.</Text>
              ) : (
                monthlyTrendData.map((item) => {
                  const monthName = months[item.month - 1].substring(0, 3);
                  const barHeight = maxAmount > 0 ? (item.total_amount / maxAmount) * 140 : 0;
                  const active = (selectedMonth + 1) === item.month;
                  return (
                    <View key={item.month} style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(barHeight, 4), backgroundColor: active ? palette.blue : palette.divider }
                        ]}
                      />
                      <Text style={[styles.barLabel, active && styles.barLabelActive]}>{monthName}</Text>
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
                <Text style={styles.emptyInlineText}>No monthly income trend data for this year.</Text>
              ) : (
                monthlyIncomeTrendData.map((item) => {
                  const monthName = months[item.month - 1].substring(0, 3);
                  const barHeight = maxIncomeAmount > 0 ? (item.total_amount / maxIncomeAmount) * 140 : 0;
                  const active = (selectedMonth + 1) === item.month;
                  return (
                    <View key={item.month} style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(barHeight, 4), backgroundColor: active ? palette.green : palette.divider }
                        ]}
                      />
                      <Text style={[styles.barLabel, active && styles.barLabelActive]}>{monthName}</Text>
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

        {/* Key Insights */}
        <View style={[styles.card, styles.insightsCard]}>
          <View style={styles.insightsHeader}>
            <View style={styles.insightsBadge}>
              <Ionicons name="sparkles" size={14} color={palette.blue} />
            </View>
            <Text style={styles.cardTitle}>Key Insights</Text>
          </View>
          {isLoadingInsights ? (
            <View style={styles.emptyBlock}>
              <ActivityIndicator size="small" color={palette.blue} />
            </View>
          ) : (
            <Markdown style={markdownStyles}>{keyInsights}</Markdown>
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal
        visible={showMonthYearModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthYearModal(false)}
      >
        <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month & Year</Text>
              <TouchableOpacity onPress={() => setShowMonthYearModal(false)} style={styles.iconGhostButton}>
                <Ionicons name="close" size={20} color={palette.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.pickerLabel}>Month</Text>
            <View style={styles.monthGrid}>
              {months.map((month, idx) => (
                <TouchableOpacity
                  key={month}
                  style={[styles.monthChip, tempSelectedMonth === idx && styles.chipSelected]}
                  onPress={() => setTempSelectedMonth(idx)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, tempSelectedMonth === idx && styles.chipTextSelected]}>
                    {month.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.pickerLabel, { marginTop: 18 }]}>Year</Text>
            <View style={styles.yearList}>
              {years.map(year => (
                <TouchableOpacity
                  key={year}
                  style={[styles.yearChip, tempSelectedYear === year && styles.chipSelected]}
                  onPress={() => setTempSelectedYear(year)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, tempSelectedYear === year && styles.chipTextSelected]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => handleMonthYearSelect(tempSelectedMonth, tempSelectedYear)}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    </View>
  );
}

const SPENDING_COLORS: { [key: string]: string } = {
  'Food & Drinks': '#0A84FF',
  'Transportation': '#34C759',
  'Shopping': '#FF9500',
  'Utilities': '#5856D6',
  'Other': '#FF2D55',
  'Penjualan': '#0A84FF',
  'Sponsor': '#34C759',
  'Gaji Pegawai': '#0A84FF',
  'Restock': '#34C759',
};

const markdownStyles = {
  body: { fontSize: 14, color: palette.inkSoft, lineHeight: 21 },
  heading1: { fontSize: 17, fontWeight: '700' as const, color: palette.ink, marginTop: 10, marginBottom: 6 },
  heading2: { fontSize: 15.5, fontWeight: '700' as const, color: palette.ink, marginTop: 10, marginBottom: 6 },
  heading3: { fontSize: 14.5, fontWeight: '700' as const, color: palette.ink, marginTop: 8, marginBottom: 4 },
  strong: { fontWeight: '700' as const, color: palette.ink },
  em: { fontStyle: 'italic' as const },
  paragraph: { marginTop: 0, marginBottom: 10 },
  bullet_list: { marginVertical: 2 },
  ordered_list: { marginVertical: 2 },
  list_item: { marginBottom: 6 },
  hr: { backgroundColor: palette.divider, height: 1, marginVertical: 12 },
};

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    marginTop: 2,
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: palette.ink,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: palette.inkFaint,
    marginTop: 2,
    marginBottom: 16,
  },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyText: {
    color: palette.inkFaint,
    fontSize: 13.5,
    fontWeight: '500',
  },
  emptyInlineText: {
    textAlign: 'center',
    color: palette.inkFaint,
    flex: 1,
    fontSize: 13,
  },

  legendList: {
    gap: 16,
  },
  legendRow: {
    gap: 6,
  },
  legendTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
  legendTitle: {
    fontSize: 14,
    color: palette.ink,
    fontWeight: '600',
  },
  legendValue: {
    fontSize: 13,
    color: palette.inkSoft,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  legendTrack: {
    height: 6,
    backgroundColor: palette.bg,
    borderRadius: 3,
    overflow: 'hidden',
  },
  legendBar: {
    height: '100%',
    borderRadius: 3,
  },
  legendPercentage: {
    fontSize: 11.5,
    color: palette.inkFaint,
    fontWeight: '500',
  },

  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  trendArrowButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  trendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: palette.divider,
  },
  trendDotActive: {
    backgroundColor: palette.blue,
    width: 16,
  },
  barChartContentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 190,
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    width: 68,
  },
  bar: {
    width: 18,
    borderRadius: 9,
  },
  barLabel: {
    fontSize: 12,
    color: palette.inkFaint,
    marginTop: 8,
    fontWeight: '500',
  },
  barLabelActive: {
    color: palette.ink,
    fontWeight: '700',
  },
  barValue: {
    fontSize: 9.5,
    color: palette.inkFaint,
    marginTop: 3,
  },

  insightsCard: {
    marginBottom: 24,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  insightsBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(10,132,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Month/Year modal
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
    maxHeight: Dimensions.get('window').height - 100,
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
  iconGhostButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: palette.inkSoft,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  monthChip: {
    width: (width - 84) / 4,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 11,
    backgroundColor: palette.bg,
  },
  yearList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  yearChip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 11,
    backgroundColor: palette.bg,
  },
  chipSelected: {
    backgroundColor: palette.blue,
  },
  chipText: {
    fontSize: 13.5,
    color: palette.ink,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: palette.blue,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 22,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
