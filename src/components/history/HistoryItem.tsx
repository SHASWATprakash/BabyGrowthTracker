// src/components/history/HistoryItem.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GrowthMeasurement } from '../../types';

type Props = {
  item: GrowthMeasurement;
  onDelete: (id: string) => void;
  onEdit?: (item: GrowthMeasurement) => void; // placeholder for Step 9
};

export default function HistoryItem({ item, onDelete, onEdit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.date}>{item.date}</Text>

        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Text style={styles.delete}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.age}>Age: {item.ageInDays} days</Text>

      <View style={styles.metrics}>
        <Text style={styles.metricText}>
          Weight: {item.weightKg} kg 
          {item.weightPercentile !== undefined &&
            ` (${item.weightPercentile}th %)`}
        </Text>

        <Text style={styles.metricText}>
          Height: {item.heightCm} cm 
          {item.heightPercentile !== undefined &&
            ` (${item.heightPercentile}th %)`}
        </Text>

        <Text style={styles.metricText}>
          Head: {item.headCm} cm 
          {item.headPercentile !== undefined &&
            ` (${item.headPercentile}th %)`}
        </Text>
      </View>

      {onEdit && (
        <TouchableOpacity onPress={() => onEdit(item)}>
          <Text style={styles.edit}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  date: { fontSize: 16, fontWeight: '600' },
  delete: { color: 'red', fontWeight: '600' },
  edit: {
    marginTop: 12,
    color: '#0A84FF',
    fontWeight: '600',
    fontSize: 15,
  },
  age: {
    marginTop: 4,
    color: '#555',
  },
  metrics: { marginTop: 10 },
  metricText: {
    fontSize: 15,
    marginBottom: 4,
  },
});
