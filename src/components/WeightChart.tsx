// src/components/WeightChart.tsx
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { GrowthMeasurement } from '../types';
import whoWeightAge from '../data/who-weight-age.json';
import { LmsTable } from '../utils/lms';
import { buildPercentileCurves } from '../utils/percentileCurves';

const { width } = Dimensions.get('window');

type Props = {
  measurements: GrowthMeasurement[];
  sex: 'male' | 'female';
  maxMonths?: number;
  height?: number;
};

const DEFAULT_PCT_ORDER = [3, 10, 25, 50, 75, 90, 97];
const DEFAULT_COLORS = ['#d6eaff', '#bfe0ff', '#a6ccff', '#6ea8ff', '#a6ccff', '#bfe0ff', '#d6eaff'];

/**
 * Replace NaN/undefined values in `arr` by linearly interpolating between neighboring numeric points.
 * If a run at the start or end is missing, it uses the nearest available numeric value (clamp).
 */
function interpolateMissing(arr: (number | null | undefined)[]): number[] {
  const n = arr.length;
  const out: number[] = new Array(n);

  // find indices with valid numbers
  const validIdx: number[] = [];
  for (let i = 0; i < n; i++) {
    const v = arr[i];
    if (typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v)) validIdx.push(i);
  }

  if (validIdx.length === 0) {
    // nothing numeric at all — fill with zeros as safe fallback
    for (let i = 0; i < n; i++) out[i] = 0;
    return out;
  }

  // fill leading gap by clamping to first valid
  const first = validIdx[0];
  for (let i = 0; i < first; i++) out[i] = Number(arr[first]);

  // fill internal gaps by linear interpolation
  for (let k = 0; k < validIdx.length - 1; k++) {
    const i0 = validIdx[k];
    const i1 = validIdx[k + 1];
    const v0 = Number(arr[i0]);
    const v1 = Number(arr[i1]);
    out[i0] = v0;
    const gap = i1 - i0;
    for (let j = 1; j < gap; j++) {
      const t = j / gap;
      out[i0 + j] = v0 + (v1 - v0) * t;
    }
  }

  // set last valid
  const last = validIdx[validIdx.length - 1];
  out[last] = Number(arr[last]);

  // fill trailing gap by clamping to last valid
  for (let i = last + 1; i < n; i++) out[i] = Number(arr[last]);

  return out;
}

export default function WeightChart({
  measurements,
  sex,
  maxMonths = 60,
  height = 320,
}: Props) {
  // Build curves
  const curves = useMemo(() => {
    try {
      if (!whoWeightAge || !(whoWeightAge as any).male) return null;
      return buildPercentileCurves((whoWeightAge as unknown) as LmsTable, sex, DEFAULT_PCT_ORDER, maxMonths, 1);
    } catch (e) {
      console.warn('Failed to build percentile curves:', e);
      return null;
    }
  }, [sex, maxMonths]);

  // Labels
  const labels = useMemo(() => {
    const arr: string[] = [];
    for (let m = 0; m <= maxMonths; m += 1) arr.push(String(m));
    return arr;
  }, [maxMonths]);

  // Build percentile datasets and sanitize (interpolate NaN)
  const percentileDatasets = useMemo(() => {
    if (!curves) return [];
    return DEFAULT_PCT_ORDER.map((p, idx) => {
      // map month -> value (may contain NaN)
      const dataMap = new Map<number, number>();
      (curves as any)[p].forEach((pt: any) => {
        // pt.x is month (may be float); we align to integer months
        const monthIdx = Math.round(pt.x);
        dataMap.set(monthIdx, pt.y);
      });

      // build array matching labels length, allow nulls for missing
      const raw: (number | null)[] = labels.map((lbl) => {
        const month = Number(lbl);
        const v = dataMap.get(month);
        if (v == null || !Number.isFinite(v)) return null;
        return v;
      });

      // interpolate internal gaps, clamp ends
      const filled = interpolateMissing(raw);

      return {
        data: filled,
        color: () => DEFAULT_COLORS[idx],
        strokeWidth: p === 50 ? 2.2 : 1.0,
        withDots: false,
        legend: `${p}th`,
      };
    });
  }, [curves, labels]);

  // measurement dataset: average per integer month, sanitized similarly
  const measurementDataset = useMemo(() => {
    if (!measurements || measurements.length === 0) return null;

    const map = new Map<number, number[]>();
    measurements.forEach((m) => {
      const month = Math.round(m.ageInDays / 30.4375);
      const arr = map.get(month) ?? [];
      arr.push(Number(m.weightKg));
      map.set(month, arr);
    });

    const raw: (number | null)[] = labels.map((lbl) => {
      const month = Number(lbl);
      const arr = map.get(month);
      if (!arr || arr.length === 0) return null;
      const avg = arr.reduce((s, v) => s + v, 0) / arr.length;
      return Number(avg);
    });

    const filled = interpolateMissing(raw);

    return {
      data: filled,
      color: () => '#2a7bff',
      strokeWidth: 0,
      withDots: true,
      legend: 'Measurements',
    };
  }, [measurements, labels]);

  const datasets = useMemo(() => {
    const d = [...percentileDatasets];
    if (measurementDataset) d.push(measurementDataset);
    return d;
  }, [percentileDatasets, measurementDataset]);

  // final data object
  const chartData = { labels, datasets };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight-for-age</Text>

      <LineChart
        data={chartData}
        width={Math.max(width - 24, 300)}
        height={height}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          labelColor: () => '#666',
          style: { borderRadius: 8 },
          propsForDots: {
            r: '4',
            strokeWidth: '1',
            stroke: '#fff',
          },
        }}
        bezier={false}
        style={{ borderRadius: 8 }}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={true}
        fromZero={true}
        segments={5}
      />
      <Text style={styles.note}>Percentile curves (3,10,25,50,75,90,97) • Points are measurements averaged per month</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  note: { marginTop: 8, color: '#555', fontSize: 12, textAlign: 'center' },
});
