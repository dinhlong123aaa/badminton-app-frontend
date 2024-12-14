// screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const HomeScreen = ({ navigation,route }) => {
  const { userId } = route.params || {};
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeaturedCourses();
  }, []);

  const fetchFeaturedCourses = async () => {
    try {
      const response = await axios.get('http://47.129.50.166:8080/api/courses/highest-rated-courses-all');
      if (response.status === 200) {
        const topThreeCourses = response.data.data.slice(0, 3);
        setCourses(topThreeCourses);
      }
    } catch (error) {
      setError('Không thể tải khóa học nổi bật');
    } finally {
      setLoading(false);
    }
  };

  const getLevelDetails = (level) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return { icon: 'star-o', color: '#28a745', text: 'Cơ bản' };
      case 'intermediate':
        return { icon: 'star-half-o', color: '#ffc107', text: 'Trung bình' };
      case 'advanced':
        return { icon: 'star', color: '#dc3545', text: 'Nâng cao' };
      default:
        return { icon: 'star-o', color: '#6c757d', text: 'Chưa xác định' };
    }
  };

  const renderCourseItem = ({ item }) => {
    const levelDetails = getLevelDetails(item.level);
    
    return (
      <TouchableOpacity
        style={styles.courseCard}
        onPress={() => navigation.navigate('CourseLessons', {
          courseId: item.id,
          courseName: item.courseName,
          studentId: userId
        })}
      >
        <View style={styles.courseContent}>
          <Text style={styles.courseName}>{item.courseName}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.courseFooter}>
            <View style={[styles.levelBadge, { backgroundColor: levelDetails.color + '20' }]}>
              <Icon name={levelDetails.icon} size={16} color={levelDetails.color} />
              <Text style={[styles.levelText, { color: levelDetails.color }]}>
                {levelDetails.text}
              </Text>
            </View>
            
            <Text style={styles.fee}>
              {item.fee} VNĐ
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Khóa học nổi bật</Text>
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
  },
  courseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  courseContent: {
    padding: 16,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  fee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  }
});

export default HomeScreen;