// CourseStatsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const CourseStatsScreen = ({ route }) => {
  const { totalCourses } = route.params;
  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState([]);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    fetchCourseStats();
  }, [startDate, endDate]);

  const fetchCourseStats = async () => {
    try {
      setLoading(true);
      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const response = await axios.get(
        `http://10.0.2.2:8080/api/courses/revenue-by-course-in-period?startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      
      if (response.data.data) {
        setCourseData(response.data.data);
      }
    } catch (error) {
      setError('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF9500" />
      </View>
    );
  }

  const chartData = {
    labels: courseData.map(item => item.courseName),
    datasets: [{
      data: courseData.map(item => item.totalRevenue)
    }]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Thống kê khóa học</Text>
        <Text style={styles.subtitle}>Tổng số: {totalCourses} khóa học</Text>
      </View>

      <View style={styles.datePickerContainer}>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowStartPicker(true)}
        >
          <Icon name="calendar" size={16} color="#666" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            Từ: {startDate.toLocaleDateString('vi-VN')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setShowEndPicker(true)}
        >
          <Icon name="calendar" size={16} color="#666" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            Đến: {endDate.toLocaleDateString('vi-VN')}
          </Text>
        </TouchableOpacity>
      </View>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
        />
      )}

      <ScrollView horizontal>
        <BarChart
          data={chartData}
          width={Math.max(Dimensions.get('window').width - 32, courseData.length * 100)}
          height={220}
          yAxisLabel=""
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 149, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16
            }
          }}
          style={styles.chart}
          verticalLabelRotation={30}
          showValuesOnTopOfBars={true}
        />
      </ScrollView>

      <View style={styles.statsGrid}>
        {courseData.map((course, index) => (
          <View key={index} style={styles.courseCard}>
            <Text style={styles.courseName}>{course.courseName}</Text>
            <Text style={styles.courseRevenue}>
              {course.totalRevenue.toLocaleString()} VNĐ
            </Text>
          </View>
        ))}
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
  },
  statsGrid: {
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  courseRevenue: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
  }
});

export default CourseStatsScreen;