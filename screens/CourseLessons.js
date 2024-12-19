// CourseLessons.js
import React, { useState, useEffect, use } from 'react';
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
  Linking,
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
const BANNED_WORDS = [
  'dm', 'đm', 'đkm', 'dkm', 'vcl', 'clm', 'cc', 'ccc', 'cl', 'lon', 'loz',
  'đệch', 'dech', 'deo', 'đéo', 'đít', 'dit', 'đụ', 'du', 'điếm', 'diem',
  'đĩ', 'di', 'fuck', 'shit', 'dick', 'bitch'
];

const getLevelDetails = (level) => {
  switch (level?.toLowerCase()) {
    case 'cơ bản':
      return { icon: 'star-o', color: '#28a745' };
    case 'trung bình':
      return { icon: 'star-half-o', color: '#ffc107' };
    case 'nâng cao':
      return { icon: 'star', color: '#dc3545' };
    default:
      return { icon: 'star-o', color: '#6c757d' };
  }
};

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
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (!courseId || !studentId) {
      Toast.show('Thiếu thông tin khóa học hoặc người dùng', Toast.LONG);
      navigation.goBack();
      return;
    }
    fetchCourseDetails();
    fetchRegistrationStatus();
    fetchLessons();
    fetchFeedbacks();
  }, [courseId, studentId]);

  const fetchRegistrationStatus = async () => {
    try {
      const response = await axios.get(
        `http://13.213.1.45:8080/api/v1/registrations/student/${studentId}/course/${courseId}`
      );
      setRegistration(response.data);
    } catch (error) {
      console.log('No registration found');
      setRegistration(null);
    }
  };

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`http://13.213.1.45:8080/api/courses/${courseId}`);
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
      const response = await axios.get(`http://13.213.1.45:8080/api/lessons/course/${courseId}`);
      if (response.status === 200) {
        setLessons(response.data.data);
      }
    } catch (error) {
      Toast.show('Không thể tải danh sách bài học', Toast.LONG);
    }
  };

  const validateContent = (content) => {
    const words = content.toLowerCase().split(/\s+/);
    const foundBannedWords = words.filter(word => BANNED_WORDS.includes(word));

    if (foundBannedWords.length > 0) {
      return {
        isValid: false,
        message: 'Nội dung chứa từ ngữ không phù hợp'
      };
    }
    return {
      isValid: true
    };
  };
  const showCustomerServiceAlert = (onProceed) => {
    Alert.alert(
      'Đánh giá 1 sao ⭐',
      'Chúng tôi rất tiếc về trải nghiệm không tốt của bạn. Bạn có muốn liên hệ với bộ phận CSKH để được hỗ trợ?',
      [
        {
          text: 'Liên hệ CSKH',
          onPress: () => {
            const url = "https://www.facebook.com/profile.php?id=61569270992841&mibextid=ZbWKwL";
            Linking.canOpenURL(url).then(supported => {
              if (supported) {
                Linking.openURL(url);
              } else {
                Toast.show('Không thể mở liên kết Facebook');
              }
            });
          },
          style: 'default',
        },
        {
          text: 'Tiếp tục đánh giá',
          onPress: onProceed,
          style: 'default'
        },
        {
          text: 'Hủy',
          style: 'cancel',
          color: '#6c757d'
        }
      ],
      {
        cancelable: true,
        titleStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          color: '#dc3545'
        },
        messageStyle: {
          fontSize: 16,
          color: '#212529',
          lineHeight: 24
        },
        containerStyle: {
          backgroundColor: '#fff',
          borderRadius: 12,
          padding: 20,
          elevation: 5
        }
      }
    );
  };
  const fetchFeedbacks = async () => {
    try {
      const response = await axios.get(`http://13.213.1.45:8080/api/feedbacks/course/${courseId}`);
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
        amount: courseDetails.fee,
        courseId: courseId,
        courseName: courseDetails.courseName,
        level: courseDetails.level,
        studentId: studentId,
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
  
    const validation = validateContent(newFeedback.content);
    if (!validation.isValid) {
      Toast.show(validation.message, Toast.LONG);
      return;
    }
  
    // Check for 1-star rating
    if (newFeedback.rating === 1) {
      showCustomerServiceAlert(async () => {
        try {
          const feedbackData = {
            studentId: studentId,
            courseId: courseId,
            content: newFeedback.content.trim(),
            rating: newFeedback.rating,
          };
          const response = await axios.post('http://13.213.1.45:8080/api/feedbacks', feedbackData);
          if (response.status === 200) {
            Toast.show('Phản hồi đã được thêm');
            setNewFeedback({ content: '', rating: 5 });
            fetchFeedbacks();
            setIsFeedbackModalVisible(false);
          }
        } catch (error) {
          Toast.show('Không thể thêm phản hồi', Toast.LONG);
        }
      });
      return;
    }
  
    // Normal feedback flow
    try {
      const feedbackData = {
        studentId: studentId,
        courseId: courseId,
        content: newFeedback.content.trim(),
        rating: newFeedback.rating,
      };
      const response = await axios.post('http://13.213.1.45:8080/api/feedbacks', feedbackData);
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
  
  const handleEditFeedback = async () => {
    if (!editingFeedback.content.trim()) {
      Toast.show('Vui lòng nhập nội dung phản hồi', Toast.LONG);
      return;
    }
  
    const validation = validateContent(editingFeedback.content);
    if (!validation.isValid) {
      Toast.show(validation.message, Toast.LONG);
      return;
    }
  
    // Check for 1-star rating
    if (editingFeedback.rating === 1) {
      showCustomerServiceAlert(async () => {
        try {
          const response = await axios.patch(
            `http://13.213.1.45:8080/api/feedbacks/${editingFeedback.id}`,
            {
              id: editingFeedback.id,
              content: editingFeedback.content.trim(),
              rating: editingFeedback.rating,
              feedbackDate: new Date().toISOString().split('T')[0]
            }
          );
          if (response.status === 200) {
            Toast.show('Cập nhật đánh giá thành công');
            setIsEditModalVisible(false);
            setEditingFeedback(null);
            fetchFeedbacks();
          }
        } catch (error) {
          Toast.show('Lỗi khi cập nhật đánh giá');
        }
      });
      return;
    }
  
    // Normal edit flow
    try {
      const response = await axios.patch(
        `http://13.213.1.45:8080/api/feedbacks/${editingFeedback.id}`,
        {
          id: editingFeedback.id,
          content: editingFeedback.content.trim(),
          rating: editingFeedback.rating,
          feedbackDate: new Date().toISOString().split('T')[0]
        }
      );
      if (response.status === 200) {
        Toast.show('Cập nhật đánh giá thành công');
        setIsEditModalVisible(false);
        setEditingFeedback(null);
        fetchFeedbacks();
      }
    } catch (error) {
      Toast.show('Lỗi khi cập nhật đánh giá');
    }
  };

  const renderLessonItem = ({ item }) => {
    const hasAccess = courseDetails?.fee === 0 ||
      (registration && registration.paymentStatus);

    return (
      <TouchableOpacity
        style={[
          styles.lessonCard,
          !hasAccess && styles.lockedLesson
        ]}
        onPress={() => {
          if (hasAccess) {
            navigation.navigate('LessonScreen', {
              lessonId: item.id,
              title: item.title,
            });
          } else {
            Toast.show('Vui lòng thanh toán để xem bài học');
          }
        }}
      >
        <View style={styles.lessonContent}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          {!hasAccess && (
            <Icon name="lock" size={20} color="#666" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeedbackItem = ({ item }) => (
    <View style={styles.feedbackCard}>
      <View style={styles.feedbackHeader}>
        <Text style={styles.studentName}>{item.studentName}</Text>
        <View style={styles.actionButtons}>
          {item.studentId === studentId && (
            <TouchableOpacity
              onPress={() => {
                setEditingFeedback(item);
                setIsEditModalVisible(true);
              }}
              style={styles.editButton}
            >
              <Icon name="edit" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
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
          {courseDetails && courseDetails.fee > 0 && !registration?.paymentStatus && (
            <TouchableOpacity
              style={styles.paymentButton}
              onPress={handlePayment}
            >
              <View style={styles.paymentButtonContent}>
                <Icon name="credit-card" size={24} color="#fff" style={styles.paymentIcon} />
                <Text style={styles.paymentButtonText}>
                  Thanh toán {courseDetails.fee.toLocaleString()} VNĐ
                </Text>
              </View>
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
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chỉnh sửa đánh giá</Text>

            <RatingStars
              rating={editingFeedback?.rating || 0}
              onRatingChange={(rating) =>
                setEditingFeedback(prev => ({ ...prev, rating }))}
            />

            <TextInput
              style={styles.feedbackInput}
              placeholder="Nhập đánh giá của bạn"
              value={editingFeedback?.content}
              onChangeText={(content) =>
                setEditingFeedback(prev => ({ ...prev, content }))}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsEditModalVisible(false);
                  setEditingFeedback(null);
                }}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleEditFeedback}
              >
                <Text style={styles.buttonText}>Cập nhật</Text>
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
    backgroundColor: '#2ecc71',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  paymentButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIcon: {
    marginRight: 12,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
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
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    padding: 8,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  lockedLesson: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  lessonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default CourseLessons;