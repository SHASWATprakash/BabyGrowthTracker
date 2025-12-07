// src/components/forms/MeasurementForm.tsx

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import { lbToKg, inToCm } from '../../utils/units';
import { ageInDays } from '../../utils/age';
import { GrowthMeasurement } from '../../types';
import { useAppContext } from '../../store';
import { v4 as uuidv4 } from 'uuid';

// Form input shape
type FormValues = {
  date: string;
  weight: number;
  weightUnit: 'kg' | 'lb';
  height: number;
  heightUnit: 'cm' | 'in';
  head: number;
  headUnit: 'cm' | 'in';
};

// Validation schema with string-to-number transformation
const schema = Yup.object().shape({
  date: Yup.string().required('Date is required'),
  weight: Yup.number()
    .transform((value, originalValue) => Number(originalValue))
    .typeError('Enter weight')
    .positive('Must be > 0')
    .required('Weight required'),
  weightUnit: Yup.string().oneOf(['kg', 'lb']).required(),
  height: Yup.number()
    .transform((value, originalValue) => Number(originalValue))
    .typeError('Enter height')
    .positive('Must be > 0')
    .required('Height required'),
  heightUnit: Yup.string().oneOf(['cm', 'in']).required(),
  head: Yup.number()
    .transform((value, originalValue) => Number(originalValue))
    .typeError('Enter head circumference')
    .positive('Must be > 0')
    .required('Head circumference required'),
  headUnit: Yup.string().oneOf(['cm', 'in']).required(),
});

export default function MeasurementForm() {
  const { babyProfile, addMeasurement } = useAppContext();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: dayjs().format('YYYY-MM-DD'),
      weight: 0,
      weightUnit: 'kg',
      height: 0,
      heightUnit: 'cm',
      head: 0,
      headUnit: 'cm',
    },
    resolver: yupResolver(schema),
  });

  const onSubmit: SubmitHandler<FormValues> = (values) => {
    if (!babyProfile) {
      alert('Baby profile not set');
      return;
    }

    const weightKg =
      values.weightUnit === 'kg'
        ? Number(values.weight)
        : lbToKg(Number(values.weight));

    const heightCm =
      values.heightUnit === 'cm'
        ? Number(values.height)
        : inToCm(Number(values.height));

    const headCm =
      values.headUnit === 'cm'
        ? Number(values.head)
        : inToCm(Number(values.head));

    const days = ageInDays(babyProfile.birthDate, values.date);

    const measurement: GrowthMeasurement = {
      id: uuidv4(),
      date: values.date,
      ageInDays: days,
      weightKg,
      heightCm,
      headCm,
    };

    addMeasurement(measurement);
    alert('Measurement added!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Measurement</Text>

      {/* DATE */}
      <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <TextInput {...field} style={styles.input} placeholder="2024-01-01" />
        )}
      />
      {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}

      {/* WEIGHT */}
      <Text style={styles.label}>Weight</Text>
      <View style={styles.row}>
        <Controller
          name="weight"
          control={control}
          render={({ field }) => (
            <TextInput
              value={String(field.value)}
              onChangeText={(text) => field.onChange(text === '' ? 0 : Number(text))}
              keyboardType="numeric"
              style={[styles.input, styles.flex]}
              placeholder="e.g. 3.2"
            />
          )}
        />
        <Controller
          name="weightUnit"
          control={control}
          render={({ field }) => (
            <TouchableOpacity
              onPress={() => field.onChange(field.value === 'kg' ? 'lb' : 'kg')}
            >
              <Text style={styles.unitButton}>{field.value}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      {errors.weight && <Text style={styles.error}>{errors.weight.message}</Text>}

      {/* HEIGHT */}
      <Text style={styles.label}>Height</Text>
      <View style={styles.row}>
        <Controller
          name="height"
          control={control}
          render={({ field }) => (
            <TextInput
              value={String(field.value)}
              onChangeText={(text) => field.onChange(text === '' ? 0 : Number(text))}
              keyboardType="numeric"
              style={[styles.input, styles.flex]}
              placeholder="Number"
            />
          )}
        />
        <Controller
          name="heightUnit"
          control={control}
          render={({ field }) => (
            <TouchableOpacity
              onPress={() => field.onChange(field.value === 'cm' ? 'in' : 'cm')}
            >
              <Text style={styles.unitButton}>{field.value}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      {errors.height?.message && <Text style={styles.error}>{errors.height.message}</Text>}

      {/* HEAD */}
      <Text style={styles.label}>Head Circumference</Text>
      <View style={styles.row}>
        <Controller
          name="head"
          control={control}
          render={({ field }) => (
            <TextInput
              value={String(field.value)}
              onChangeText={(text) => field.onChange(text === '' ? 0 : Number(text))}
              keyboardType="numeric"
              style={[styles.input, styles.flex]}
              placeholder="Number"
            />
          )}
        />
        <Controller
          name="headUnit"
          control={control}
          render={({ field }) => (
            <TouchableOpacity
              onPress={() => field.onChange(field.value === 'cm' ? 'in' : 'cm')}
            >
              <Text style={styles.unitButton}>{field.value}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      {errors.head?.message && <Text style={styles.error}>{errors.head.message}</Text>}

      <Button title="Save Measurement" onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12 },
  label: { marginTop: 12, fontWeight: '500' },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },
  error: { color: 'red', marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  flex: { flex: 1 },
  unitButton: {
    padding: 10,
    backgroundColor: '#dedede',
    borderRadius: 6,
    overflow: 'hidden',
  },
});
function alert(arg0: string) {
    throw new Error('Function not implemented.');
}

