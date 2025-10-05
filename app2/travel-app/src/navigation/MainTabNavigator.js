import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import theme from "../config/theme";
import MyTicketsScreen from "../screens/booking/MyTicketsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import TravelListScreen from "../screens/travel/TravelListScreen";

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Explore") {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === "My Tickets") {
            iconName = focused ? "ticket" : "ticket-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explore" component={TravelListScreen} />
      <Tab.Screen name="My Tickets" component={MyTicketsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
