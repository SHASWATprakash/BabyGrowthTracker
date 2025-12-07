// src/screens/AddMeasurementScreen.tsx

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import MeasurementForm from '../components/forms/MeasurementForm';

export default function AddMeasurementScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <MeasurementForm />
    </SafeAreaView>
  );
}
