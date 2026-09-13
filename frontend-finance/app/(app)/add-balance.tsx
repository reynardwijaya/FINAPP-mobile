import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
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
  green: '#30D158',
};

const INCOME_TYPES = [
  { id: 'salary', icon: 'cash', label: 'Penjualan' },
  { id: 'gift', icon: 'gift', label: 'Sponsor' },
  { id: 'other', icon: 'grid', label: 'Other' },
];

export default function AddBalance() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const canSave = !!(amount && description && selectedType);

  const handleSave = async () => {
    if (!amount || !description || !selectedType) return;
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          title: description,
          type: 'income',
          category: selectedType,
          date: date.toISOString(),
          user_id: 1
        })
      });
      if (res.ok) {
        router.back();
      } else {
        alert('Failed to add income');
      }
    } catch (err) {
      alert('Failed to connect to server');
    }
  };

  return (
    <View style={styles.screen}>
      {/* Sheet header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Text style={styles.headerAction}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Income</Text>
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
            value={description}
            onChangeText={setDescription}
            placeholder="Title of income"
            placeholderTextColor={palette.inkFaint}
          />
        </View>

        {/* Date */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              value={date.toISOString().slice(0, 10)}
              onChange={e => setDate(new Date(e.target.value))}
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
                  <Text style={styles.dateRowText}>{date.toLocaleDateString('id-ID')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={palette.inkFaint} />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Income Type */}
        <View style={[styles.inputContainer, { marginBottom: 32 }]}>
          <Text style={styles.label}>Income Type</Text>
          <View style={styles.typeGrid}>
            {INCOME_TYPES.map((type) => {
              const selected = selectedType === type.id;
              return (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeItem, selected && styles.typeItemSelected]}
                  onPress={() => setSelectedType(type.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.typeIconWrap, selected && styles.typeIconWrapSelected]}>
                    <Ionicons
                      name={type.icon as keyof typeof Ionicons.glyphMap}
                      size={20}
                      color={selected ? '#fff' : palette.green}
                    />
                  </View>
                  <Text style={[styles.typeLabel, selected && styles.typeLabelSelected]}>
                    {type.label}
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

  typeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  typeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: palette.card,
    borderRadius: 16,
    paddingVertical: 16,
  },
  typeItemSelected: {
    backgroundColor: palette.green,
  },
  typeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(48,209,88,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typeIconWrapSelected: {
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  typeLabel: {
    fontSize: 12.5,
    color: palette.ink,
    fontWeight: '600',
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#fff',
  },
});
