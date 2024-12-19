// HomeScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const HomeScreen = ({ navigation, route }) => {
  const { userId } = route.params || {};
  const [topRatedCourses, setTopRatedCourses] = useState([]);
  const [mostPurchasedCourses, setMostPurchasedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const [ratedResponse, purchasedResponse] = await Promise.all([
        axios.get('http://10.0.2.2:8080/api/courses/highest-rated-courses-all'),
        axios.get('http://10.0.2.2:8080/api/courses/highest-purchase-count')
      ]);
  
      if (ratedResponse.status === 200) {
        setTopRatedCourses(ratedResponse.data.data.slice(0, 3));
      }
  
      if (purchasedResponse.status === 200) {
        setMostPurchasedCourses(purchasedResponse.data.data.slice(0, 3));
      }
    } catch (error) {
      setError('Không thể tải danh sách khóa học');
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
        <Image 
          source={require('../assets/images/thump.png')}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.courseContent}>
          <Text style={styles.courseName}>{item.courseName}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.courseFooter}>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>
                {item.averageRating ? item.averageRating.toFixed(1) : 'Chưa có đánh giá'}
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: levelDetails.color + '20' }]}>
              <Icon name={levelDetails.icon} size={16} color={levelDetails.color} />
              <Text style={[styles.levelText, { color: levelDetails.color }]}>
                {levelDetails.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  const renderPurchasedCourseItem = ({ item }) => {
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
        <Image 
          source={require('../assets/images/thump.png')}
          style={styles.courseImage}
          resizeMode="cover"
        />
        <View style={styles.courseContent}>
          <Text style={styles.courseName}>{item.courseName}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.courseFooter}>
            <View style={styles.purchaseContainer}>
              <Icon name="users" size={16} color="#2196F3" />
              <Text style={styles.purchaseText}>
                {item.purchaseCount || 0} học viên
              </Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: levelDetails.color + '20' }]}>
              <Icon name={levelDetails.icon} size={16} color={levelDetails.color} />
              <Text style={[styles.levelText, { color: levelDetails.color }]}>
                {levelDetails.text}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khóa học được đánh giá cao</Text>
        <FlatList
          data={topRatedCourses}
          renderItem={renderCourseItem}
          keyExtractor={item => `rated-${item.id}`}
          scrollEnabled={false}
        />
      </View>
  
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Khóa học phổ biến</Text>
        <FlatList
          data={mostPurchasedCourses}
          renderItem={renderPurchasedCourseItem}
          keyExtractor={item => `purchased-${item.id}`}
          scrollEnabled={false}
        />
      </View>
    </ScrollView>
  );  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    height: 140,
  },
  courseImage: {
    width: 120,
    height: '100%',
  },
  courseContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  courseName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    flex: 1,
  },
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 16,
  },
  purchaseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  purchaseText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
});

export default HomeScreen;