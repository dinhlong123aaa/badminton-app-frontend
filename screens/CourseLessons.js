// CourseLessons.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Toast from 'react-native-simple-toast';

const RatingStars = ({ rating, onRatingChange, disabled }) => (
  <View style={styles.ratingContainer}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity
        key={star}
        onPress={() => !disabled && onRatingChange(star)}
        disabled={disabled}
      >
        <Icon
          name={star <= rating ? 'star' : 'star-o'}
          size={24}
          color="#FFD700"
          style={styles.star}
        />
      </TouchableOpacity>
    ))}
  </View>
);

const CourseLessons = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { courseId, courseName, studentId } = route.params || {};

  const [courseDetails, setCourseDetails] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [newFeedback, setNewFeedback] = useState({
    content: '',
    rating: 5,
  });
  const [loading, setLoading] = useState(true);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);

  useEffect(() => {
    if (!courseId || !studentId) {
      Toast.show('Thiếu thông tin khóa học hoặc người dùng', Toast.LONG);
      navigation.goBack();
      return;
    }
    fetchCourseDetails();
    fetchLessons();
    fetchFeedbacks();
  }, [courseId, studentId]);

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:8080/api/courses/${courseId}`);
      if (response.status === 200) {
        setCourseDetails(response.data.data);
      }
    } catch (error) {
      Toast.show('Không thể tải thông tin khóa học');
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:8080/api/lessons/course/${courseId}`);
      if (response.status === 200) {
        setLessons(response.data.data);
      }
    } catch (error) {
      Toast.show('Không thể tải danh sách bài học', Toast.LONG);
    }
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:8080/api/feedbacks/course/${courseId}`);
      if (response.status === 200) {
        setFeedbacks(response.data.data);
      }
    } catch (error) {
      Toast.show('Không thể tải phản hồi', Toast.LONG);
    }
  };

  const handlePayment = () => {
    if (courseDetails?.fee) {
      navigation.navigate('Payment', {
        amount: courseDetails.fee * 1000,
        courseId: courseId,
        courseName: courseDetails.courseName,
      });
    } else {
      Toast.show('Không thể lấy thông tin học phí');
    }
  };

  const handleAddFeedback = async () => {
    if (!newFeedback.content.trim()) {
      Toast.show('Vui lòng nhập nội dung phản hồi', Toast.LONG);
      return;
    }

    try {
      const feedbackData = {
        studentId: studentId,
        courseId: courseId,
        content: newFeedback.content.trim(),
        rating: newFeedback.rating,
      };

      const response = await axios.post('http://10.0.2.2:8080/api/feedbacks', feedbackData);
      if (response.status === 200) {
        Toast.show('Phản hồi đã được thêm');
        setNewFeedback({ content: '', rating: 5 });
        fetchFeedbacks();
        setIsFeedbackModalVisible(false);
      }
    } catch (error) {
      Toast.show('Không thể thêm phản hồi', Toast.LONG);
    }
  };

  const renderLessonItem = ({ item }) => (
    <TouchableOpacity
      style={styles.lessonCard}
      onPress={() =>
        navigation.navigate('LessonScreen', {
          lessonId: item.id,
          title: item.title,
        })
      }
    >
      <Text style={styles.lessonTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <Text style={styles.feedbackDate}>{item.feedbackDate}</Text>
      </View>
      <RatingStars rating={item.rating} disabled={true} />
      <Text style={styles.feedbackContent}>{item.content}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Course Header */}
        <View style={styles.header}>
          <Text style={styles.courseTitle}>{courseName}</Text>
          {courseDetails && (
            <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
              <Text style={styles.paymentButtonText}>
                Thanh toán {courseDetails.fee}k VNĐ
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lessons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danh sách bài học</Text>
          <FlatList
            data={lessons}
            renderItem={renderLessonItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <View style={styles.feedbackHeaderContainer}>
            <Text style={styles.sectionTitle}>Đánh giá khóa học</Text>
            <TouchableOpacity
              style={styles.addFeedbackButton}
              onPress={() => setIsFeedbackModalVisible(true)}
            >
              <Text style={styles.addFeedbackButtonText}>Thêm đánh giá</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={feedbacks}
            renderItem={renderFeedbackItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <Modal
        visible={isFeedbackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFeedbackModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm đánh giá</Text>

            <RatingStars
              rating={newFeedback.rating}
              onRatingChange={(rating) => setNewFeedback({ ...newFeedback, rating })}
            />

            <TextInput
              style={styles.feedbackInput}
              placeholder="Nhập đánh giá của bạn"
              value={newFeedback.content}
              onChangeText={(content) => setNewFeedback({ ...newFeedback, content })}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsFeedbackModalVisible(false);
                  setNewFeedback({ content: '', rating: 5 });
                }}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddFeedback}
              >
                <Text style={styles.buttonText}>Gửi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    elevation: 2,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  paymentButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1A1A1A',
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  feedbackHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addFeedbackButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addFeedbackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  feedbackCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  feedbackDate: {
    fontSize: 12,
    color: '#999999',
  },
  feedbackContent: {
    fontSize: 14,
    color: '#666666',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  star: {
    marginRight: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CourseLessons;