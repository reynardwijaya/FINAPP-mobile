import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

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
      const res = await fetch('http://127.0.0.1:8000/transactions', {
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
    <LinearGradient
      colors={['#ADD8E6', '#87CEEB', '#6495ED']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Expense</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!amount || !title || !selectedCategory}
            style={[
              styles.saveButton,
              (!amount || !title || !selectedCategory) && styles.saveButtonDisabled
            ]}
          >
            <Text style={[
              styles.saveButtonText,
              (!amount || !title || !selectedCategory) && styles.saveButtonTextDisabled
            ]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount</Text>
            <View style={styles.amountInput}>
              <Text style={styles.currency}>Rp</Text>
              <TextInput
                style={styles.amountTextInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="What did you spend on?"
              placeholderTextColor="#999"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category.id && styles.categoryItemSelected
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Ionicons
                    name={category.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={selectedCategory === category.id ? '#fff' : '#007AFF'}
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.categoryLabelSelected
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date Picker Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={selectedDate ? selectedDate.substring(0, 10) : ''}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  width: '100%',
                  height: 48,
                  borderRadius: 8,
                  border: '1px solid #007AFF',
                  padding: 12,
                  fontSize: 16,
                  background: '#fff',
                  color: '#333',
                  marginBottom: 8,
                  outline: 'none',
                  marginTop: 4,
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={styles.dateInputBox}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={{
                    color: selectedDate ? '#333' : '#999',
                    fontSize: 16,
                    paddingVertical: 6,
                    paddingHorizontal: 2,
                  }}>
                    {selectedDate ? selectedDate.substring(0, 10) : 'Select date'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#007AFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
                {showDatePicker && (
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <TextInput
                        style={[styles.textInput, { marginBottom: 12 }]}
                        value={selectedDate ? selectedDate.substring(0, 10) : ''}
                        onChangeText={setSelectedDate}
                        placeholder="YYYY-MM-DD"
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Text style={styles.confirmButtonText}>Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#E5E5EA',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currency: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 24,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    fontSize: 16,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  categoryItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 16,
  },
  categoryItemSelected: {
    backgroundColor: '#007AFF',
  },
  categoryLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryLabelSelected: {
    color: '#fff',
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    padding: 12,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: 300,
    maxWidth: '90%',
    maxHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 16,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  gradientBackground: {
    flex: 1,
  },
}); 