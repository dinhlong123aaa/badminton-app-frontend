// PaymentScreen.js
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import Toast from 'react-native-simple-toast';

const PaymentScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const { amount } = route.params;

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
      console.error('Payment error:', error);
      Toast.show('Lỗi khi thực hiện thanh toán');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentCallback = (navState) => {
    if (navState.url.includes('vn-pay-callback')) {
      const urlParams = new URLSearchParams(navState.url.split('?')[1]);
      const vnp_ResponseCode = urlParams.get('vnp_ResponseCode');
      
      if (vnp_ResponseCode === '00') {
        Toast.show('Thanh toán thành công');
        navigation.goBack();
      } else {
        Toast.show('Thanh toán thất bại');
        setPaymentUrl(null);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handlePaymentCallback}
        startInLoadingState={true}
        renderLoading={() => (
          <ActivityIndicator
            style={styles.loader}
            size="large"
            color="#2196F3"
          />
        )}
      />
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.payButton}
        onPress={initiatePayment}
      >
        <Text style={styles.buttonText}>
          Thanh toán {amount.toLocaleString()}đ
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'center'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  payButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }]
  }
});

export default PaymentScreen;