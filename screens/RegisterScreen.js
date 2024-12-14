// RegisterScreen.js
import React, { useState, useEffect, useRef, useMemo } from 'react';import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-simple-toast';
import axios from 'axios';

const REGEX_PATTERNS = {
  username: /^[a-zA-Z0-9_]{3,20}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
  fullName: /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*(?:[ ][A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]*)*$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  phone: /^(0|\+84)([0-9]{9,10})$/,
  date: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
};

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: ''
  });
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpTimer, setOtpTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); // Add this state
  const timerRef = useRef(null);

  const validateForm = () => {
    if (!REGEX_PATTERNS.username.test(formData.username)) {
      Toast.show('Tên đăng nhập phải từ 3-20 ký tự, chỉ bao gồm chữ cái, số và dấu gạch dưới');
      return false;
    }

    if (!REGEX_PATTERNS.password.test(formData.password)) {
      Toast.show('Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ và số');
      return false;
    }

    if (!REGEX_PATTERNS.fullName.test(formData.fullName)) {
      Toast.show('Họ tên không hợp lệ (phải viết hoa chữ cái đầu mỗi từ)');
      return false;
    }

    if (!REGEX_PATTERNS.email.test(formData.email)) {
      Toast.show('Email không hợp lệ');
      return false;
    }

    if (!REGEX_PATTERNS.phone.test(formData.phoneNumber)) {
      Toast.show('Số điện thoại không hợp lệ (phải bắt đầu bằng 0 hoặc +84)');
      return false;
    }

    if (!REGEX_PATTERNS.date.test(formData.dateOfBirth)) {
      Toast.show('Ngày sinh không hợp lệ (định dạng DD/MM/YYYY)');
      return false;
    }

    const birthDate = new Date(formData.dateOfBirth.split('/').reverse().join('-'));
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 6) {
      Toast.show('Người dùng phải từ 6 tuổi trở lên');
      return false;
    }

    return true;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toLocaleDateString('en-GB');
      setFormData(prev => ({ ...prev, dateOfBirth: formattedDate }));
    }
  };

  useEffect(() => {
    if (otpModalVisible && otpTimer > 0) {
      timerRef.current = setInterval(() => {
        setOtpTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [otpModalVisible, otpTimer]);

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://10.0.2.2:8080/api/auth/register', {
        ...formData,
        role: 'STUDENT'
      });

      if (response.status === 200) {
        Toast.show('Đăng ký thành công. Vui lòng xác thực email.');
        setOtpModalVisible(true);
      }
    } catch (error) {
      Toast.show(error.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      Toast.show('Vui lòng nhập mã OTP');
      return;
    }

    try {
      setVerifyingOtp(true);
      const response = await axios.post('http://10.0.2.2:8080/api/auth/verify-otp', {
        email: formData.email,
        otp
      });

      if (response.status === 200) {
        Toast.show('Xác thực thành công');
        setOtpModalVisible(false);
        navigation.replace('Login');
      }else{
        Toast.show(response.data.message);
      }
    } catch (error) {
      Toast.show(error.response?.data?.message || 'Mã OTP không đúng');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post('http://10.0.2.2:8080/api/auth/resend-otp', {
        email: formData.email
      });
      setOtpTimer(60);
      Toast.show('Đã gửi lại mã OTP');
    } catch (error) {
      Toast.show('Không thể gửi lại mã OTP');
    }
  };

  const MemoizedOTPModal = useMemo(() => (
    <Modal
      visible={otpModalVisible}
      transparent
      animationType="slide"
      onRequestClose={() => null}
    >
      <TouchableOpacity 
        activeOpacity={1}
        style={styles.modalOverlay}
        onPress={() => null}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Xác thực OTP</Text>
          <Text style={styles.modalSubtitle}>
            Vui lòng nhập mã OTP đã được gửi đến email {formData.email}
          </Text>

          <TextInput
            style={styles.otpInput}
            placeholder="Nhập mã OTP"
            value={otp}
            onChangeText={(text) => {
              if (otp.length !== 6) {
                Toast.show('Mã OTP phải có 6 ký tự.');
                return;
              }
              setOtp(text);
            }}
            keyboardType="numeric"
            maxLength={6}
          />

          <TouchableOpacity
            style={[styles.verifyButton, !otp && styles.disabledButton]}
            onPress={handleVerifyOTP}
            disabled={verifyingOtp || !otp}
          >
            {verifyingOtp ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Xác nhận</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resendButton, otpTimer > 0 && styles.disabledButton]}
            onPress={handleResendOTP}
            disabled={otpTimer > 0}
          >
            <Text style={styles.resendText}>
              {otpTimer > 0 ? `Gửi lại mã (${otpTimer}s)` : 'Gửi lại mã'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  ), [otpModalVisible, otp, verifyingOtp, otpTimer, formData.email]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Đăng Ký</Text>

        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={formData.username}
          onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={formData.password}
          onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Họ và tên"
          value={formData.fullName}
          onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại"
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
          keyboardType="phone-pad"
        />

        <TouchableOpacity
          style={styles.dateContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <TextInput
            style={styles.dateInput}
            placeholder="Ngày sinh (DD/MM/YYYY)"
            value={formData.dateOfBirth}
            editable={false}
          />
          <Icon name="calendar" size={20} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dateOfBirth ? new Date(formData.dateOfBirth.split('/').reverse().join('-')) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginText}>Đã có tài khoản? Đăng nhập</Text>
        </TouchableOpacity>
      </View>
      {MemoizedOTPModal}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  form: {
    padding: 20,
    marginTop: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16
  },
  dateContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    paddingRight: 15
  },
  dateInput: {
    flex: 1,
    padding: 15,
    fontSize: 16
  },
  registerButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold'
  },
  loginButton: {
    marginTop: 20
  },
  loginText: {
    color: '#2196F3',
    textAlign: 'center',
    fontSize: 14
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
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  otpInput: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 5,
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  resendButton: {
    marginTop: 15,
    padding: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  resendText: {
    color: '#2196F3',
    textAlign: 'center',
  },
});

export default RegisterScreen;