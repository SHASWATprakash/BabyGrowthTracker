// src/components/WeightChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as Victory from 'victory-native'; // import as namespace to avoid TS export differences
import whoWeightAge from '../data/who-weight-age.json';
import { LmsTable } from '../utils/lms';
import { buildPercentileCurves } from '../utils/percentileCurves';
import { GrowthMeasurement } from '../types';

const { width } = Dimensions.get('window');

/**
 * We import victory-native as a namespace and then pull components dynamically.
 * This avoids TypeScript "no exported member" errors for some victory-native versions.
 */
const V = Victory as any;
const createContainer = V.createContainer ?? ((...args: any[]) => null);
const VictoryChart = V.VictoryChart ?? V.Chart ?? null;
const VictoryAxis = V.VictoryAxis ?? null;
const VictoryLine = V.VictoryLine ?? null;
const VictoryScatter = V.VictoryScatter ?? null;
const VictoryTooltip = V.VictoryTooltip ?? null;

/**
 * Composite container for voronoi + tooltip (if available)
 */
const VoronoiTooltip =
  createContainer && typeof createContainer === 'function'
    ? createContainer('voronoi', 'tooltip')
    : null;

type Props = {
  measurements: GrowthMeasurement[];
  sex: 'male' | 'female';
  height?: number;
};

export default function WeightChart({ measurements, sex, height = 320 }: Props) {
  // prepare percentile curves (if who data exists)
  const curves = useMemo(() => {
    try {
      if (!whoWeightAge || !(whoWeightAge as any).male) return null;
      return buildPercentileCurves((whoWeightAge as unknown) as LmsTable, sex);
    } catch (e) {
      console.warn('Failed to build percentile curves:', e);
      return null;
    }
  }, [sex]);

  // Points for scatter: x -> months (1 decimal), y -> kg
  const points = measurements
    .map((m) => ({
      x: Math.round((m.ageInDays / 30.4375) * 10) / 10,
      y: Number(m.weightKg),
      label: `${m.date}\n${m.weightKg.toFixed(2)} kg${m.weightPercentile ? '\n' + m.weightPercentile + 'th' : ''}`,
    }))
    .sort((a, b) => a.x - b.x);

  const percentileOrder = [3, 10, 25, 50, 75, 90, 97];
  const colors = ['#d6eaff', '#bfe0ff', '#a6ccff', '#6ea8ff', '#a6ccff', '#bfe0ff', '#d6eaff'];

  // If VictoryChart or other components are missing, fall back to a simple message + points list
  if (!VictoryChart || !VictoryLine || !VictoryScatter || !VictoryAxis || !VoronoiTooltip || !VictoryTooltip) {
    return (
      <View style={styles.fallback}>
        <Text style={styles.title}>Weight (chart not available)</Text>
        {points.length === 0 ? (
          <Text style={styles.empty}>No measurements yet.</Text>
        ) : (
          points.map((p, idx) => (
            <Text key={idx} style={styles.point}>
              {p.x} mo — {p.y} kg {/** percentile shown in label if available */}
            </Text>
          ))
        )}
        <Text style={styles.note}>Install a compatible victory-native version to enable charts.</Text>
      </View>
    );
  }

  // Now render Victory chart using dynamic components
  return (
    <View style={{ padding: 8 }}>
      <Text style={styles.title}>Weight-for-age</Text>

      <VictoryChart
        width={width - 16}
        height={height}
        padding={{ top: 20, bottom: 50, left: 50, right: 20 }}
        containerComponent={
          <VoronoiTooltip
            labels={(d: any) => (d && d.label ? d.label : '')}
            labelComponent={<VictoryTooltip cornerRadius={4} flyoutStyle={{ fill: 'white' }} />}
          />
        }
      >
        <VictoryAxis
          label="Age (months)"
          tickFormat={(t: any) => `${t}`}
          style={{
            axisLabel: { padding: 30 },
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Weight (kg)"
          style={{
            axisLabel: { padding: 40 },
          }}
        />

        {/* Percentile lines */}
        {curves &&
          percentileOrder.map((p: number, idx: number) => (
            <VictoryLine
              key={`p-${p}`}
              interpolation="monotoneX"
              data={curves[p]}
              style={{
                data: {
                  stroke: colors[idx],
                  strokeWidth: p === 50 ? 2.2 : 1.2,
                  strokeDasharray: p === 50 ? undefined : '4,2',
                },
              }}
            />
          ))}

        {/* measurement points */}
        <VictoryScatter
          data={points}
          size={4}
          style={{
            data: { fill: '#2a7bff' },
            labels: { fontSize: 10 },
          }}
        />
      </VictoryChart>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  fallback: { padding: 16 },
  empty: { color: '#666', marginTop: 8 },
  point: { fontSize: 14, marginTop: 6 },
  note: { marginTop: 12, color: '#999', fontSize: 12 },
});
