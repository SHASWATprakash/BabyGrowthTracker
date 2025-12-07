// src/screens/ProfileScreen.tsx
import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useAppContext } from '../store';
import { v4 as uuidv4 } from 'uuid';
import { seedMeasurements } from '../utils/seed';
import { GrowthMeasurement } from '../types';
import { ageInDays } from '../utils/age';

export default function ProfileScreen() {
  const { babyProfile, setBabyProfile, addMeasurement } = useAppContext();

  const [name, setName] = useState(babyProfile?.name ?? '');
  const [birthDate, setBirthDate] = useState(babyProfile?.birthDate ?? '');
  const [gender, setGender] = useState<'male' | 'female'>(babyProfile?.gender ?? 'male');
  const [seededOnce, setSeededOnce] = useState(false);

  const save = () => {
    if (!name || !birthDate) {
      Alert.alert('Missing', 'Please enter name and birth date (YYYY-MM-DD).');
      return;
    }

    const profileToSave = {
      id: babyProfile?.id ?? uuidv4(),
      name,
      birthDate,
      gender,
    };

    setBabyProfile(profileToSave);

    // Ask user whether to seed sample measurements (optional). Only seed once to avoid duplicates.
    if (!seededOnce) {
      Alert.alert(
        'Seed data?',
        'Would you like to add sample measurements for POC/testing?',
        [
          {
            text: 'No',
            onPress: () => {
              Alert.alert('Saved', 'Baby profile saved');
            },
            style: 'cancel',
          },
          {
            text: 'Yes',
            onPress: () => {
              try {
                const seeded: GrowthMeasurement[] = seedMeasurements(birthDate);
                // Ensure seeded items have correct ageInDays (seedMeasurements should already do this, but be safe)
                seeded.forEach((m) => {
                  if (m.ageInDays == null || m.ageInDays === 0) {
                    m.ageInDays = ageInDays(birthDate, m.date);
                  }
                  addMeasurement(m);
                });
                setSeededOnce(true);
                Alert.alert('Saved', 'Baby profile saved and sample measurements added');
              } catch (err) {
                console.warn('Seeding failed', err);
                Alert.alert('Saved', 'Baby profile saved (seeding failed)');
              }
            },
          },
        ],
        { cancelable: true }
      );
    } else {
      Alert.alert('Saved', 'Baby profile saved');
    }
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
