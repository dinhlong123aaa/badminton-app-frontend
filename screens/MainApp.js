// screens/MainApp.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';

const MainApp = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Badminton L&L</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.buttonText}>Đăng nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',  // Light gray background
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 80
  },
  logo: {
    width: 160, // Increased from 120
    height: 160, // Increased from 120
    marginBottom: 30, // Increased margin
    borderRadius: 25, // Slightly larger radius
    backgroundColor: '#fff',
    elevation: 4, // Slightly stronger shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300
  },
  button: {
    backgroundColor: '#3498DB',  // Softer blue
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  registerButton: {
    backgroundColor: '#2ECC71'  // Softer green
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default MainApp;