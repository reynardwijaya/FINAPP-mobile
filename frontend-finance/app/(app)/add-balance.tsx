import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

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

  const handleSave = async () => {
    if (!amount || !description || !selectedType) return;
    try {
      const res = await fetch('https://backendreact-production-e680.up.railway.app/transactions', {
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
    <LinearGradient
      colors={['#ADD8E6', '#87CEEB', '#6495ED']}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Income</Text>
          <TouchableOpacity 
            onPress={handleSave}
            disabled={!amount || !description || !selectedType}
            style={[
              styles.saveButton,
              (!amount || !description || !selectedType) && styles.saveButtonDisabled
            ]}
          >
            <Text style={[
              styles.saveButtonText,
              (!amount || !description || !selectedType) && styles.saveButtonTextDisabled
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
              value={description}
              onChangeText={setDescription}
              placeholder="Title of income"
              placeholderTextColor="#999"
            />
          </View>

          {/* Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            {Platform.OS === 'web' ? (
              <input
                type="date"
                value={date.toISOString().slice(0, 10)}
                onChange={e => setDate(new Date(e.target.value))}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 12,
                  border: '1px solid #ccc',
                  padding: 16,
                  fontSize: 16,
                  color: '#333',
                }}
              />
            ) : (
              <>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.textInput, { justifyContent: 'center' }]}> 
                  <Text style={{ color: '#333' }}>{date.toLocaleDateString('id-ID')}</Text>
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

          {/* Income Type Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Income Type</Text>
            <View style={styles.typeGrid}>
              {INCOME_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeItem,
                    selectedType === type.id && styles.typeItemSelected
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons
                    name={type.icon as keyof typeof Ionicons.glyphMap}
                    size={24}
                    color={selectedType === type.id ? '#fff' : '#34C759'}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      selectedType === type.id && styles.typeLabelSelected
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    backgroundColor: '#34C759',
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  typeItem: {
    width: '33.33%',
    padding: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    paddingVertical: 16,
  },
  typeItemSelected: {
    backgroundColor: '#34C759',
  },
  typeLabel: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: '#fff',
  },
  gradientBackground: {
    flex: 1,
  },
}); 