// ListCourse.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import axios from 'axios';

const ListCourse = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { username, userId } = route.params || {};

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

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
      const response = await axios.get('http://10.0.2.2:8080/api/courses/all');
      if (response.status === 200) {
        setCourses(response.data.data || []);
      }
    } catch (error) {
      setError('Không thể tải danh sách khóa học');
      Toast.show('Không thể tải danh sách khóa học', Toast.LONG);
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
          <View style={styles.courseHeader}>
            <Text style={styles.courseName}>{item.courseName}</Text>
            <View style={[styles.levelBadge, { backgroundColor: levelDetails.color + '20' }]}>
              <Icon name={levelDetails.icon} size={16} color={levelDetails.color} />
              <Text style={[styles.levelText, { color: levelDetails.color }]}>
                {levelDetails.text}
              </Text>
            </View>
          </View>
  
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
  
          <View style={styles.courseFooter}>
            <Text style={styles.fee}>
              {item.fee > 0 ? `${item.fee.toLocaleString()} VNĐ` : ''}
            </Text>
            <Icon name="chevron-right" size={16} color="#666" />
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
      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
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
  listContainer: {
    padding: 16,
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
  },
  courseContent: {
    padding: 16,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
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
  courseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fee: {
    fontSize: 16,
    fontWeight: '600',
    color: '#28a745',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  }
});

export default ListCourse;