// ListCourse.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';

const ListCourse = ({ navigation, route }) => {
  const { username, userId } = route.params || {};
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    validateUser();
  }, []);

  const validateUser = () => {
    if (!username || !userId) {
      Alert.alert(
        'Xác thực',
        'Vui lòng đăng nhập để xem danh sách khóa học',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      return;
    }
    fetchCourses();
  };

  const fetchCourses = async () => {
    try {
      setError(null);
      const response = await axios.get('http://13.213.1.45:8080/api/courses/all');
      if (response.status === 200) {
        setCourses(response.data.data || []);
      }
    } catch (error) {
      setError('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCourses();
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchCourses();
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(`http://13.213.1.45:8080/api/courses/search-course?keyword=${searchQuery}`);
      setCourses(response.data.data || []);
    } catch (error) {
      setError('Không thể tìm kiếm khóa học');
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khóa học..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Icon name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id.toString()}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Icon name="graduation-cap" size={70} color="#ccc" />
            <Text style={styles.emptyTitle}>Chưa có khóa học nào</Text>
            <Text style={styles.emptySubtitle}>Các khóa học sẽ sớm được cập nhật</Text>
          </View>
        }
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
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
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
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  }
});

export default ListCourse;