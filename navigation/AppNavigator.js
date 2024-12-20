// AppNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainApp from '../screens/MainApp';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import StartScreen from '../screens/StartScreen';
import CourseLessons from '../screens/CourseLessons';
import LessonScreen from '../screens/LessonScreen';
import PaymentScreen from '../screens/PaymentScreen';
import RevenueChartScreen from '../screens/RevenueChartScreen';
import CourseStatsScreen from '../screens/CourseStatsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="MainApp">
      <Stack.Screen
        name="MainApp"
        component={MainApp}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Đăng nhập' }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Đăng ký' }}
      />
      <Stack.Screen
        name="StartScreen"
        component={StartScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CourseLessons"
        component={CourseLessons}
        options={({ route }) => ({ title: route.params?.courseName })}
      />
      <Stack.Screen
        name="LessonScreen"
        component={LessonScreen}
        options={({ route }) => ({ title: route.params?.title })}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'Thanh toán',
          presentation: 'modal'
        }}
      />
      <Stack.Screen
        name="RevenueChart"
        component={RevenueChartScreen}
        options={{ title: 'Thống kê doanh thu' }}
      />
      <Stack.Screen
        name="CourseStats"
        component={CourseStatsScreen}
        options={{
          title: 'Thống kê khóa học',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>

  );
};
export default AppNavigator;