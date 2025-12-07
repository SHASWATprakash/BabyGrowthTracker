// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppContext } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { seedMeasurements } from '../utils/seed';   
import { GrowthMeasurement } from '../types';

export default function ProfileScreen() {
  const { babyProfile, setBabyProfile } = useAppContext();
  const [name, setName] = useState(babyProfile?.name ?? '');
  const [birthDate, setBirthDate] = useState(babyProfile?.birthDate ?? '');
  const [gender, setGender] = useState<'male' | 'female'>(babyProfile?.gender ?? 'male');

  const seeded = seedMeasurements(birthDate);


  const save = () => {
    if (!name || !birthDate) {
      Alert.alert('Missing', 'Please enter name and birth date (YYYY-MM-DD).');
      return;
    }
    setBabyProfile({
      id: babyProfile?.id ?? uuidv4(),
      name,
      birthDate,
      gender,
    });
     
    seeded.forEach(m => addMeasurement(m));
    Alert.alert('Saved', 'Baby profile saved');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Baby name" />
        <Text style={styles.label}>Birth date (YYYY-MM-DD)</Text>
        <TextInput value={birthDate} onChangeText={setBirthDate} style={styles.input} placeholder="2024-01-01" />
        <Text style={styles.label}>Gender</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title={gender === 'male' ? 'Male ✓' : 'Male'} onPress={() => setGender('male')} />
          <Button title={gender === 'female' ? 'Female ✓' : 'Female'} onPress={() => setGender('female')} />
        </View>

        <View style={{ height: 16 }} />
        <Button title="Save Profile" onPress={save} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  label: { marginTop: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6, marginTop: 6 },
});
function addMeasurement(m: GrowthMeasurement): void {
    throw new Error('Function not implemented.');
}

