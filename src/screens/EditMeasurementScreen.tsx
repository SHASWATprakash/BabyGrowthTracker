// src/screens/EditMeasurementScreen.tsx

import React from 'react';
import { SafeAreaView, Alert } from 'react-native';
import MeasurementForm, { FormValues } from '../components/forms/MeasurementForm';
import { useAppContext } from '../store';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ageInDays } from '../utils/age';

type RouteParams = {
  measurementId: string;
};

export default function EditMeasurementScreen() {
  const { params } = useRoute() as { params: RouteParams };
  const { measurementId } = params;
  const { measurements, updateMeasurement, babyProfile } = useAppContext();
  const navigation = useNavigation();

  const measurement = measurements.find((m) => m.id === measurementId);

  if (!measurement) {
    // show alert and navigate back
    Alert.alert('Not found', 'Measurement not found', [
      { text: 'OK', onPress: () => (navigation as any).goBack() },
    ]);
    return null;
  }

  // prepare initial values for the form (and include helper fields _birthDate and _gender)
  const initial: Partial<FormValues & { _birthDate?: string; _gender?: 'male' | 'female' }> = {
    id: measurement.id,
    date: measurement.date,
    weight: measurement.weightKg,
    weightUnit: 'kg',
    height: measurement.heightCm,
    heightUnit: 'cm',
    head: measurement.headCm,
    headUnit: 'cm',
    _birthDate: babyProfile?.birthDate,
    _gender: babyProfile?.gender,
  };

  const handleSave = (m: any) => {
    // m already contains percentiles recalculated by MeasurementForm (if birthDate provided)
    // but we must ensure ageInDays is correctly set for storage
    const days = babyProfile ? ageInDays(babyProfile.birthDate, m.date) : m.ageInDays ?? 0;
    m.ageInDays = days;

    updateMeasurement(m);
    Alert.alert('Saved', 'Measurement updated');
    (navigation as any).goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MeasurementForm initialValues={initial} onSave={handleSave} />
    </SafeAreaView>
  );
}
