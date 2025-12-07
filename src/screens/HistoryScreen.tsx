// src/screens/HistoryScreen.tsx

import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import HistoryItem from '../components/history/HistoryItem';
import { useAppContext } from '../store';

export default function HistoryScreen() {
  const { measurements, deleteMeasurement } = useAppContext();

  // Sort by date descending
  const sorted = [...measurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Measurement History</Text>

      {sorted.length === 0 ? (
        <Text style={styles.empty}>No measurements added yet.</Text>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryItem
              item={item}
              onDelete={(id) => deleteMeasurement(id)}
              onEdit={() => {}}
            />
          )}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 16,
    color: '#555',
  },
});
