// LessonScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Dimensions
} from 'react-native';
import { Video } from 'expo-av';
import * as ScreenOrientation from 'expo-screen-orientation';
import axios from 'axios';

const windowWidth = Dimensions.get('window').width;

const LessonScreen = ({ route }) => {
  const { lessonId } = route.params;
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({});
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const fetchLesson = async () => {
    try {
      const response = await axios.get(`http://47.129.50.166:8080/api/lessons/${lessonId}`);
      if (response.status === 200) {
        console.log('Lesson data:', response.data.data);
        setLesson(response.data.data);
      } else {
        setError('Không thể tải bài học. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Không thể tải bài học. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const onFullscreenUpdate = async ({ fullscreenUpdate }) => {
    if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (fullscreenUpdate === Video.FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS) {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{lesson?.title}</Text>
        <Text style={styles.lessonContent}>{lesson?.content}</Text>

        {lesson?.imgUrl && (
          <ScrollView
            style={styles.imageScroll}
            showsVerticalScrollIndicator={true}
          >
            <View style={styles.imageContainer}>
              {imageLoading && (
                <ActivityIndicator
                  size="large"
                  color="#007AFF"
                  style={styles.imageLoader}
                />
              )}
              <Image
                source={{
                  uri: lesson.imgUrl,
                  headers: {
                    'Accept': 'image/*'
                  }
                }}
                style={styles.image}
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
              />
            </View>
          </ScrollView>
        )}
        
        {lesson?.videoUrl && (
          <View style={styles.videoContainer}>
            <Video
              source={{ uri: lesson.videoUrl }}
              style={styles.video}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
              onPlaybackStatusUpdate={status => setStatus(() => status)}
              onFullscreenUpdate={onFullscreenUpdate}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  scrollContainer: {
    padding: 16
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  lessonContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 16
  },
  imageScroll: {
    width: windowWidth,
    marginBottom: 16,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  image: {
    width: windowWidth * 2,
    height: undefined, // Let height be determined by aspect ratio
    aspectRatio: 0.5, // Adjust based on your image aspect ratio
    resizeMode: 'contain',
  },
  imageLoader: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 1
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16
  },
  video: {
    width: '100%',
    height: '100%'
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center'
  }
});

export default LessonScreen;