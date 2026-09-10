import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const UserDashboard = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <Text style={styles.heading}>My Dashboard</Text>
    <Text style={styles.sub}>Your loan overview coming soon.</Text>
  </ScrollView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content:   { padding: 24 },
  heading:   { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 6 },
  sub:       { fontSize: 14, color: '#64748B' },
});

export default UserDashboard;
