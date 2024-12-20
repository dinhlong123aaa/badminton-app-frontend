// navigation/TabNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import HomeScreen from '../screens/HomeScreen';
import LessonsStackNavigator from './LessonsStackNavigator';
import UserInfoScreen from '../screens/UserInfoScreen';
import ManagementStackNavigator from './ManagementStackNavigator';
import BadmintonScoreScreen from '../screens/BadmintonScoreScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = ({ screenProps }) => {
  const { username, userId, role } = screenProps || {};

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Trang chủ':
              iconName = 'home';
              break;
            case 'Bài học':
              iconName = 'book';
              break;
            case 'Thông tin cá nhân':
              iconName = 'user';
              break;
            case 'Quản lý':
              iconName = 'cogs';
              break;
            case 'Luyện tập':
              iconName = 'circle-o';
              break;
            default:
              iconName = 'circle';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false
      })}
    >
      <Tab.Screen
        name="Trang chủ"
        component={HomeScreen}
        initialParams={{ 
          userId: userId,
          username: username,
          role: role
        }}
      />
      <Tab.Screen
        name="Bài học"
        component={LessonsStackNavigator}
        initialParams={{
          username: username,
          userId: userId,
          role: role
        }}
      />
      <Tab.Screen
        name="Thông tin cá nhân"
        component={UserInfoScreen}
        initialParams={{ username: username }}
      />
      {role === 'ADMIN' && (
        <Tab.Screen
          name="Quản lý"
          component={ManagementStackNavigator}
        />
      )}
      <Tab.Screen
        name="Luyện tập"
        component={BadmintonScoreScreen}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
