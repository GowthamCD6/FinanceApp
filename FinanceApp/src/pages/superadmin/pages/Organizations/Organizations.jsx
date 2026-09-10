import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const Organizations = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>Organizations</Text>
    <Text style={styles.sub}>Manage tenant organizations here.</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content:   { padding: 24 },
  heading:   { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  sub:       { fontSize: 14, color: '#64748B' },
});

export default Organizations;
