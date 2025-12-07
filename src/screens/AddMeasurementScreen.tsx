// src/screens/AddMeasurementScreen.tsx

import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import MeasurementForm, { FormValues } from '../components/forms/MeasurementForm';
import { useAppContext } from '../store';
import { ageInDays } from '../utils/age';

export default function AddMeasurementScreen() {
  const { addMeasurement, babyProfile } = useAppContext();

  const handleSave = (m: any) => {
    // compute ageInDays if babyProfile exists
    if (babyProfile) {
      m.ageInDays = ageInDays(babyProfile.birthDate, m.date);
    } else {
      m.ageInDays = 0;
    }

    addMeasurement(m);
    Alert.alert('Saved', 'Measurement added');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MeasurementForm
        initialValues={
          {
            _birthDate: babyProfile?.birthDate,
            _gender: babyProfile?.gender,
          } as any
        }
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}
