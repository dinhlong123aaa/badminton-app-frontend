import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  Platform,
  ScrollView
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';
import axios from 'axios';
import Toast from 'react-native-simple-toast';



const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB in bytes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const LessonManagerScreen = ({ route }) => {
  const { courseId } = route.params;
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newLesson, setNewLesson] = useState({
    title: '',
    content: '',
    lessonOrder: 1
  });


  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://13.213.1.45:8080/api/lessons/course/${courseId}`);
      setLessons(response.data.data);
    } catch (error) {
      Toast.show('Không thể tải danh sách bài học');
    } finally {
      setLoading(false);
    }
  };

  const generateUniqueFileName = (originalName, prefix) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const extension = originalName.split('.').pop();
    return `${prefix}_${timestamp}_${originalName}`;
  };
  
  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['video/*', 'video/mp4'],
        copyToCacheDirectory: true,
        multiple: false
      });
  
      if (result.assets && result.assets[0]) {
        const videoAsset = result.assets[0];
        const uniqueFileName = generateUniqueFileName(videoAsset.name, 'video');
  
        setSelectedVideo({
          uri: videoAsset.uri,
          type: videoAsset.mimeType || 'video/mp4',
          name: uniqueFileName,
          size: videoAsset.size
        });
        Toast.show('Đã chọn video thành công');
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Toast.show('Lỗi khi chọn video');
    }
  };

  const pickImage = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
        multiple: false
      });
  
      if (result.assets && result.assets[0]) {
        const imageAsset = result.assets[0];
        const uniqueFileName = generateUniqueFileName(imageAsset.name, 'image');
  
        setSelectedImage({
          uri: imageAsset.uri,
          type: imageAsset.mimeType || 'image/jpeg',
          name: uniqueFileName,
          size: imageAsset.size
        });
        Toast.show('Đã chọn hình ảnh thành công');
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Toast.show('Lỗi khi chọn hình ảnh');
    }
  };

  const handleAddLesson = async () => {
    if (!newLesson.title.trim() || !newLesson.content.trim() || !selectedVideo || !selectedImage) {
      Toast.show('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('courseId', courseId);
      formData.append('title', newLesson.title.trim());
      formData.append('content', newLesson.content.trim());
      formData.append('lessonOrder', newLesson.lessonOrder);
      formData.append('videoFile', {
        uri: Platform.OS === 'android' ? selectedVideo.uri : selectedVideo.uri.replace('file://', ''),
        type: selectedVideo.type,
        name: selectedVideo.name
      });
      formData.append('imageFile', {
        uri: Platform.OS === 'android' ? selectedImage.uri : selectedImage.uri.replace('file://', ''),
        type: selectedImage.type,
        name: selectedImage.name
      });

      await axios.post('http://13.213.1.45:8080/api/lessons/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      Toast.show('Thêm bài học thành công');
      setModalVisible(false);
      resetForm();
      fetchLessons();
    } catch (error) {
      Toast.show('Lỗi khi thêm bài học');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewLesson({
      title: '',
      content: '',
      lessonOrder: 1
    });
    setSelectedVideo(null);
    setSelectedImage(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.lessonCard}>
      <Text style={styles.lessonTitle}>{item.title}</Text>
      <Text style={styles.lessonContent}>{item.content}</Text>
      {item.imgUrl && (
        <Image source={{ uri: item.imgUrl }} style={styles.thumbnail} />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonText}>Thêm bài học mới</Text>
      </TouchableOpacity>

      <FlatList
        data={lessons}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>Thêm bài học mới</Text>

            <TextInput
              style={styles.input}
              placeholder="Tiêu đề bài học"
              value={newLesson.title}
              onChangeText={(text) => setNewLesson({ ...newLesson, title: text })}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Nội dung bài học"
              value={newLesson.content}
              onChangeText={(text) => setNewLesson({ ...newLesson, content: text })}
              multiline
            />

            <TouchableOpacity style={styles.fileButton} onPress={pickVideo}>
              <Text style={styles.fileButtonText}>
                {selectedVideo ? 'Chọn video khác' : 'Chọn video'}
              </Text>
            </TouchableOpacity>

            {selectedVideo && (
              <Video
                source={{ uri: selectedVideo.uri }}
                style={styles.videoPreview}
                useNativeControls
                resizeMode="contain"
              />
            )}

            <TouchableOpacity style={styles.fileButton} onPress={pickImage}>
              <Text style={styles.fileButtonText}>
                {selectedImage ? 'Chọn hình ảnh khác' : 'Chọn hình ảnh'}
              </Text>
            </TouchableOpacity>

            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleAddLesson}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Thêm</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  listContainer: {
    padding: 8,
  },
  lessonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lessonContent: {
    fontSize: 14,
    color: '#666',
  },
  thumbnail: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  addButton: {
    backgroundColor: '#2196F3',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  fileButton: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    borderStyle: 'dashed',
  },
  fileButtonText: {
    fontSize: 16,
    color: '#666',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    backgroundColor: '#000',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9E9E9E',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
});

export default LessonManagerScreen;