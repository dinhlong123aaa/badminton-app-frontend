// screens/UserInfoScreen.js
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import Toast from 'react-native-simple-toast';

const UserInfoScreen = ({ route }) => {
  const navigation = useNavigation();
  const { username } = route.params || {};
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, [username]);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`http://10.0.2.2:8080/api/auth/users/username/${username}`);
      if (response.status === 200) {
        setUserInfo(response.data.data);
      }
    } catch (error) {
      Toast.show('Không thể tải thông tin người dùng', Toast.LONG);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show('Mật khẩu xác nhận không khớp', Toast.LONG);
      return;
    }

    try {
      const response = await axios.put(`http://10.0.2.2:8080/api/auth/users/${userInfo.id}/password`, {
        newPassword: newPassword
      });

      if (response.status === 200) {
        Toast.show('Đổi mật khẩu thành công', Toast.SHORT);
        setModalVisible(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      Toast.show('Không thể đổi mật khẩu', Toast.LONG);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            Toast.show('Đã đăng xuất', Toast.SHORT);
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainApp' }]
            });
          }
        }
      ]
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Icon name="user-circle" size={80} color="#007AFF" />
        </View>
        <Text style={styles.userName}>{userInfo?.fullName}</Text>
        <Text style={styles.userRole}>{userInfo?.role === 'STUDENT' ? 'Học viên' : 'Quản trị viên'}</Text>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Icon name="user" size={20} color="#666" />
          <Text style={styles.infoLabel}>Tên tài khoản:</Text>
          <Text style={styles.infoValue}>{userInfo?.username}</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="envelope" size={20} color="#666" />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{userInfo?.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="phone" size={20} color="#666" />
          <Text style={styles.infoLabel}>Số điện thoại:</Text>
          <Text style={styles.infoValue}>{userInfo?.phoneNumber}</Text>
        </View>

        <View style={styles.infoItem}>
          <Icon name="calendar" size={20} color="#666" />
          <Text style={styles.infoLabel}>Ngày sinh:</Text>
          <Text style={styles.infoValue}>{userInfo?.dateOfBirth}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.changePasswordButton}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="lock" size={20} color="#fff" />
          <Text style={styles.buttonText}>Đổi mật khẩu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Icon name="sign-out" size={20} color="#fff" />
          <Text style={styles.buttonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi mật khẩu</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu mới"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleChangePassword}
              >
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
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
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    width: 120,
  },
  infoValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  actionButtons: {
    padding: 20,
  },
  changePasswordButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 0.45,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
});

export default UserInfoScreen;