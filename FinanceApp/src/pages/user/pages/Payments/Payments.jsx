import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Payments = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>Payments</Text>
    <Text style={styles.sub}>Payment history and upcoming dues appear here.</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content:   { padding: 24 },
  heading:   { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  sub:       { fontSize: 14, color: '#64748B' },
});

export default Payments;
