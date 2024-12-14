// navigation/LessonsStackNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListCourse from '../screens/ListCourse';
import CourseLessons from '../screens/CourseLessons';
import LessonScreen from '../screens/LessonScreen';
import PaymentScreen from '../screens/PaymentScreen';

const LessonsStack = createNativeStackNavigator();
export default function LessonsStackNavigator({ route }) {
  // Get params from TabNavigator
  const params = route?.params || {};

  return (
    <LessonsStack.Navigator>
      <LessonsStack.Screen
        name="ListCourse"
        component={ListCourse}
        initialParams={{
          username: params.username,
          userId: params.userId
        }}
        options={{ title: 'Danh sách khóa học' }}
      />
      <LessonsStack.Screen
        name="CourseLessons"
        component={CourseLessons}
        options={({ route }) => ({ title: route.params?.courseName })}
      />
      <LessonsStack.Screen
        name="LessonScreen"
        component={LessonScreen}
        options={({ route }) => ({ title: route.params?.title })}
      />
      {/* Corrected the navigator here */}
      {/* <LessonsStack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          title: 'Thanh toán',
          presentation: 'modal'
        }}
        initialParams={{
          userId: params.userId
        }}
      /> */}
    </LessonsStack.Navigator>
  );
}