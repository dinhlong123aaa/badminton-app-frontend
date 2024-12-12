// screens/StatisticsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const StatisticsScreen = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeStudents: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      // Mock data - replace with actual API call
      setStats({
        totalStudents: 150,
        totalCourses: 8,
        activeStudents: 120,
        totalRevenue: 45000
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        <StatCard
          title="Tổng số học viên"
          value={stats.totalStudents}
          icon="users"
          color="#007AFF"
        />
        <StatCard
          title="Số khóa học"
          value={stats.totalCourses}
          icon="book"
          color="#FF9500"
        />
        <StatCard
          title="Doanh thu (k VNĐ)"
          value={stats.totalRevenue}
          icon="money"
          color="#FF3B30"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    width: '46%',
    backgroundColor: '#FFF',
    padding: 16,
    margin: '2%',
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  }
});

export default StatisticsScreen;