import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/auth/LoginScreen";
import OTPVerificationScreen from "../screens/auth/OTPVerificationScreen";
import BookingConfirmationScreen from "../screens/booking/BookingConfirmationScreen.js";
import BookingScreen from "../screens/booking/BookingScreen";
import MyTicketsScreen from "../screens/booking/MyTicketsScreen";
import CommentScreen from "../screens/comments/CommentScreen";
import DocumentViewerScreen from "../screens/documents/DocumentViewerScreen";
import LanguageScreen from "../screens/profile/LanguageScreen";
import TravelDetailScreen from "../screens/travel/TravelDetailScreen";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createStackNavigator();

const RootStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="TravelDetail" component={TravelDetailScreen} />
      <Stack.Screen name="Comment" component={CommentScreen} />
      <Stack.Screen name="Booking" component={BookingScreen} />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
      />
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
      <Stack.Screen name="DocumentViewer" component={DocumentViewerScreen} />
      <Stack.Screen name="Comments" component={CommentScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
    </Stack.Navigator>
  );
};

export default RootStack;
