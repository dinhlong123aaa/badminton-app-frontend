// screens/ManagementScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const ManagementScreen = ({ navigation }) => {
  const menuItems = [
    {
      title: 'Quản lý học viên',
      icon: 'users',
      screen: 'UserManager',
      description: 'Xem và quản lý thông tin học viên',
    },
    {
      title: 'Quản lý khóa học',
      icon: 'book',
      screen: 'CourseManager',
      description: 'Xem và quản lý các khóa học',
    },
    {
      title: 'Thống kê',
      icon: 'bar-chart',
      screen: 'Statistics',
      description: 'Xem thống kê và báo cáo',
    },
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.iconContainer}>
            <Icon name={item.icon} size={24} color="#007AFF" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
          <Icon name="chevron-right" size={16} color="#999" />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});

export default ManagementScreen;