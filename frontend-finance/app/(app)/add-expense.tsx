import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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

const CATEGORIES = [
  { id: 'food', icon: 'cash', label: 'Gaji Pegawai' },
  { id: 'shopping', icon: 'cart', label: 'Restock' },
  { id: 'utilities', icon: 'flash', label: 'Utilities' },
  { id: 'other', icon: 'grid', label: 'Other' },
];

export default function AddExpense() {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const params = useLocalSearchParams();
  const monthParam = params.month !== undefined ? Number(params.month) : undefined;
  const yearParam = params.year !== undefined ? Number(params.year) : undefined;

  const canSave = !!(amount && title && selectedCategory);

  const handleSave = async () => {
    if (!amount || !title || !selectedCategory) return;
    const selectedCategoryObj = CATEGORIES.find(cat => cat.id === selectedCategory);
    const categoryLabel = selectedCategoryObj ? selectedCategoryObj.label : selectedCategory;
    // Tentukan tanggal sesuai input user, param, atau default
    let expenseDate: string;
    if (selectedDate) {
      // Gabungkan tanggal yang dipilih user dengan waktu saat ini agar unik
      const now = new Date();
      const dateOnly = selectedDate.substring(0, 10);
      expenseDate = new Date(`${dateOnly}T${now.toISOString().substring(11, 19)}Z`).toISOString();
    } else if (typeof monthParam === 'number' && typeof yearParam === 'number') {
      // Default tetap jam 12:00:00Z
      const monthStr = String(monthParam + 1).padStart(2, '0');
      expenseDate = `${yearParam}-${monthStr}-01T12:00:00Z`;
    } else {
      expenseDate = new Date().toISOString();
    }
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title,
          amount: Number(amount),
          date: expenseDate,
          category: categoryLabel, // label, bukan id
          type: 'expense',
          user_id: 1
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Success', 'Expense added successfully');
        router.replace('/expenses');
      } else {
        Alert.alert('Error', data.error || 'Failed to add expense');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to connect to server');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Sheet header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.headerAction}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Expense</Text>
        <TouchableOpacity onPress={handleSave} disabled={!canSave} hitSlop={10}>
          <Text style={[styles.headerAction, styles.headerSave, !canSave && styles.headerSaveDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount — gaya "how much" ala Apple Cash */}
        <View style={styles.amountBlock}>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.currency}>Rp</Text>
            <TextInput
              style={styles.amountTextInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={palette.inkFaint}
            />
          </View>
        </View>

        {/* Title */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="What did you spend on?"
            placeholderTextColor={palette.inkFaint}
          />
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={selectedDate ? selectedDate.substring(0, 10) : ''}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                width: '100%',
                height: 54,
                borderRadius: 14,
                border: 'none',
                background: palette.bg,
                padding: '0 16px',
                fontSize: 15,
                color: palette.ink,
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateRow} activeOpacity={0.7}>
                <View style={styles.dateRowLeft}>
                  <Ionicons name="calendar-outline" size={18} color={palette.inkFaint} />
                  <Text style={styles.dateRowText}>
                    {selectedDate ? selectedDate.substring(0, 10) : 'Select date'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={palette.inkFaint} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate ? new Date(selectedDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, picked) => {
                    setShowDatePicker(false);
                    if (picked) setSelectedDate(picked.toISOString());
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Category */}
        <View style={[styles.inputContainer, { marginBottom: 32 }]}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((category) => {
              const selected = selectedCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryItem, selected && styles.categoryItemSelected]}
                  onPress={() => setSelectedCategory(category.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIconWrap, selected && styles.categoryIconWrapSelected]}>
                    <Ionicons
                      name={category.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={selected ? '#fff' : palette.red}
                    />
                  </View>
                  <Text style={[styles.categoryLabel, selected && styles.categoryLabelSelected]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    color: palette.ink,
  },
  headerAction: {
    fontSize: 15.5,
    color: palette.inkSoft,
    fontWeight: '500',
  },
  headerSave: {
    color: palette.blue,
    fontWeight: '700',
  },
  headerSaveDisabled: {
    color: palette.inkFaint,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  amountBlock: {
    alignItems: 'center',
    paddingVertical: 26,
    marginBottom: 20,
    marginTop: 6,
    backgroundColor: palette.card,
    borderRadius: 20,
  },
  amountLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: palette.inkSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currency: {
    fontSize: 26,
    fontWeight: '600',
    color: palette.inkSoft,
    marginRight: 6,
    marginTop: 6,
  },
  amountTextInput: {
    fontSize: 48,
    fontWeight: '800',
    color: palette.ink,
    minWidth: 40,
    fontVariant: ['tabular-nums'],
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },

  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: palette.inkSoft,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textInput: {
    backgroundColor: palette.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 15.5,
    color: palette.ink,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null),
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.card,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
  },
  dateRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateRowText: {
    fontSize: 15.5,
    color: palette.ink,
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryItem: {
    width: '47%',
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: 16,
    paddingVertical: 16,
  },
  categoryItemSelected: {
    backgroundColor: palette.red,
  },
  categoryIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,69,58,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryIconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  categoryLabel: {
    fontSize: 12.5,
    color: palette.ink,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#fff',
  },
});
