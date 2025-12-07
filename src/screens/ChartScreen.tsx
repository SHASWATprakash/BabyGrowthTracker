// src/screens/ChartScreen.tsx
import React from 'react';
import { SafeAreaView, View, StyleSheet, Text } from 'react-native';
import WeightChart from '../components/WeightChart';
import { useAppContext } from '../store';

export default function ChartScreen() {
  const { measurements, babyProfile } = useAppContext();

  if (!babyProfile) {
    return (
      <SafeAreaView style={styles.center}>
        <View style={{ padding: 16 }}>
          <Text>Please create a baby profile first.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WeightChart measurements={measurements} sex={babyProfile.gender} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
