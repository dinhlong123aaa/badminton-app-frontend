import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  RefreshControl,
  Modal,
  TextInput,
  ScrollView
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import Toast from 'react-native-simple-toast';
import axios from 'axios';

const LEVELS = [
  { label: 'Người mới bắt đầu', value: 'BEGINNER' },
  { label: 'Trung cấp', value: 'INTERMEDIATE' },
  { label: 'Nâng cao', value: 'ADVANCED' }
];

const CourseManagerScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    description: '',
    level: 'BEGINNER',
    fee: ''
  });

  const fetchCourses = async () => {
    try {
      setError(null);
      const response = await axios.get('http://10.0.2.2:8080/api/courses/all');
      if (response.status === 200) {
        setCourses(response.data.data);
      }
    } catch (error) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCourses();
    }, [])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchCourses();
  }, []);

  const validateForm = () => {
    if (!newCourse.courseName.trim()) {
      Toast.show('Vui lòng nhập tên khóa học');
      return false;
    }
    if (!newCourse.description.trim()) {
      Toast.show('Vui lòng nhập mô tả khóa học');
      return false;
    }
    if (!newCourse.fee.trim()) {
      Toast.show('Vui lòng nhập học phí');
      return false;
    }
    return true;
  };

  const handleAddCourse = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://10.0.2.2:8080/api/courses', {
        ...newCourse,
        fee: parseFloat(newCourse.fee)
      });

      if (response.status === 200) {
        Toast.show('Thêm khóa học thành công');
        setModalVisible(false);
        setNewCourse({
          courseName: '',
          description: '',
          level: 'BEGINNER',
          fee: ''
        });
        fetchCourses();
      }
    } catch (error) {
      Toast.show(error.response?.data?.message || 'Có lỗi xảy ra khi thêm khóa học');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = (courseId) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa khóa học này?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          onPress: async () => {
            try {
              const response = await axios.delete(`http://10.0.2.2:8080/api/courses/${courseId}`);
              if (response.status === 200) {
                Toast.show(response.data.message);
                fetchCourses();
              }
            } catch (error) {
              Toast.show(error.response?.data?.message || "Có lỗi xảy ra khi xóa khóa học");
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const renderCourseItem = ({ item }) => (
    <View style={styles.courseCard}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseName}>{item.courseName}</Text>
        <Text style={styles.courseDetail}>Cấp độ: {item.level}</Text>
        <Text style={styles.courseDetail}>Học phí: {item.fee} VNĐ</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => navigation.navigate('LessonManager', {
            courseId: item.id,
            courseName: item.courseName
          })}
        >
          <Text style={styles.buttonText}>Quản lý bài học</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => deleteCourse(item.id)}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Thêm khóa học mới</Text>
      </TouchableOpacity>

      <FlatList
        data={courses}
        renderItem={renderCourseItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Thêm khóa học mới</Text>

              <Text style={styles.label}>Tên khóa học</Text>
              <TextInput
                style={styles.input}
                value={newCourse.courseName}
                onChangeText={(text) => setNewCourse({ ...newCourse, courseName: text })}
                placeholder="Nhập tên khóa học"
              />

              <Text style={styles.label}>Mô tả</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={newCourse.description}
                onChangeText={(text) => setNewCourse({ ...newCourse, description: text })}
                placeholder="Nhập mô tả khóa học"
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Cấp độ</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newCourse.level}
                  onValueChange={(value) => setNewCourse({ ...newCourse, level: value })}
                >
                  {LEVELS.map((level) => (
                    <Picker.Item key={level.value} label={level.label} value={level.value} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Học phí ( VNĐ)</Text>
              <TextInput
                style={styles.input}
                value={newCourse.fee}
                onChangeText={(text) => setNewCourse({ ...newCourse, fee: text })}
                placeholder="Nhập học phí"
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.submitButton]}
                  onPress={handleAddCourse}
                >
                  <Text style={styles.buttonText}>Thêm</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  listContainer: {
    padding: 16
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2
  },
  courseInfo: {
    marginBottom: 12
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  courseDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    margin: 16,
    borderRadius: 4,
    alignItems: 'center'
  },
  editButton: {
    backgroundColor: '#4CAF50'
  },
  deleteButton: {
    backgroundColor: '#F44336'
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center'
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 4,
    marginBottom: 16
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8
  },
  cancelButton: {
    backgroundColor: '#9E9E9E'
  },
  submitButton: {
    backgroundColor: '#4CAF50'
  }
});

export default CourseManagerScreen;