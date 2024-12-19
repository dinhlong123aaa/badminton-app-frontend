// StatisticsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const StatCard = ({ title, value, icon, color, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { borderLeftColor: color }]}
    onPress={onPress}
  >
    <View style={styles.cardIcon}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

const StatisticsScreen = ({ navigation }) => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [revenueRes, usersRes, coursesRes] = await Promise.all([
        axios.get('http://13.213.1.45:8080/api/v1/registrations/total-fee-pay'),
        axios.get('http://13.213.1.45:8080/api/auth/count'),
        axios.get('http://13.213.1.45:8080/api/courses/count')
      ]);

      setStats({
        totalRevenue: revenueRes.data.data || 0,
        totalStudents: usersRes.data.data || 0,
        totalCourses: coursesRes.data.data || 0
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  const handleRevenuePress = () => {
    navigation.navigate('RevenueChart', {
      totalRevenue: stats.totalRevenue
    });
  };

  const handleCoursePress = () => {
    navigation.navigate('CourseStats', {
      totalCourses: stats.totalCourses
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchStatistics}
        >
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê</Text>
      </View>

      <View style={styles.grid}>
        <StatCard
          title="Tổng số học viên"
          value={stats.totalStudents - 1}
          icon="users"
          color="#007AFF"
        />
        <StatCard
          title="Số khóa học"
          value={stats.totalCourses}
          icon="book"
          color="#FF9500"
          onPress={handleCoursePress}  // Add this
        />
        <StatCard
          title="Doanh thu (VNĐ)"
          value={stats.totalRevenue?.toLocaleString()}
          icon="money"
          color="#FF3B30"
          onPress={handleRevenuePress}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  grid: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default StatisticsScreen;