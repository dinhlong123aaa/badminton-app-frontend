// PaymentScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/FontAwesome';

const PaymentScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [processedTransactions, setProcessedTransactions] = useState(new Set());
  const [paymentUrl, setPaymentUrl] = useState(null);
  const { amount, courseId, courseName, level, studentId } = route.params;

  const initiatePayment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://10.0.2.2:8080/api/v1/payment/vn-pay?amount=${amount}&bankCode=NCB`
      );

      if (response.data.code === 200 && response.data.data.paymentUrl) {
        setPaymentUrl(response.data.data.paymentUrl);
      } else {
        Toast.show('Không thể khởi tạo thanh toán');
      }
    } catch (error) {
      Toast.show('Lỗi khi thực hiện thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = async (navState) => {
    if (navState.url.includes('vn-pay-callback')) {
      const urlParams = new URLSearchParams(navState.url.split('?')[1]);
      const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
      const vnp_TransactionNo = urlParams.get('vnp_TransactionNo');
  
      // Check if transaction was already processed
      if (processedTransactions.has(vnp_TransactionNo)) {
        return;
      }

      if (vnp_ResponseCode === '00') {
        try {
          setProcessedTransactions(prev => new Set(prev).add(vnp_TransactionNo));
          Toast.show('Thanh toán thành công');

          await registerCourse(vnp_TransactionNo);
          navigation.goBack();
        } catch (error) {          
          // Remove failed transaction
          setProcessedTransactions(prev => {
            const newSet = new Set(prev);
            newSet.delete(vnp_TransactionNo);
            return newSet;
          });
  
          // Show appropriate error message
          if (error.response) {
            // Server responded with error
            Toast.show('Thanh toán thành công nhưng đăng ký thất bại: ' + 
              (error.response.data?.message || 'Lỗi server'));
          } else if (error.request) {
            // Network error
            Toast.show('Thanh toán thành công nhưng không thể kết nối để đăng ký');
          } else {
            Toast.show('Thanh toán thành công nhưng đăng ký thất bại');
          }
        }
      } else {
        Toast.show('Thanh toán thất bại');
      }
      setPaymentUrl(null);
    }
  };

  // Update registerCourse
  const registerCourse = async (transactionNo) => {
    try {
      const registrationData = {
        studentId: studentId,
        courseId: courseId,
        fee_paid: amount,
        registrationDate: new Date().toISOString().split('T')[0],
        paymentStatus: true,
        transactionNo: transactionNo // Add transaction tracking
      };

      const response = await axios.post(
        'http://10.0.2.2:8080/api/v1/registrations',
        registrationData
      );

      if (response.data.code === 200) {
        Toast.show('Đăng ký khóa học thành công');
      }
      else {
        Toast.show(response.data.message || 'Đăng ký khóa học thất bại');
      }
    } catch (error) {
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handlePaymentCallback}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle}>{courseName}</Text>
        <Text style={styles.courseLevel}>Cấp độ: {level}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Học phí:</Text>
          <Text style={styles.priceValue}>
            {amount?.toLocaleString('vi-VN')}đ
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={initiatePayment}
          disabled={loading}
        >
          <View style={styles.payButtonContent}>
            <Icon name="credit-card" size={24} color="#fff" style={styles.payIcon} />
            <Text style={styles.buttonText}>Thanh toán ngay</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
  courseInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  courseLevel: {
    fontSize: 16,
    color: '#3498db',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  priceLabel: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  payButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default PaymentScreen;