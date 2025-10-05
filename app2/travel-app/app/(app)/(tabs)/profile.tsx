// import { useAuth } from "@/context/AuthContext";
// import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/src/context/AuthContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const menuItems = [
  {
    icon: "person-outline" as const,
    label: "edit_profile",
    screen: "EditProfile",
  },
  {
    icon: "language-outline" as const,
    label: "language",
    screen: "LanguageSettings",
  },
  {
    icon: "notifications-outline" as const,
    label: "notifications",
    screen: "NotificationSettings",
  },
  {
    icon: "card-outline" as const,
    label: "payment_methods",
    screen: "PaymentMethods",
  },
  {
    icon: "help-circle-outline" as const,
    label: "help_support",
    screen: "HelpSupport",
  },
  {
    icon: "information-circle-outline" as const,
    label: "about_app",
    screen: "About",
  },
];

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { currentLocale } = useLanguage();
  const isRTL = i18n.language === "am";

  const handleLogout = () => {
    Alert.alert(t("confirm_logout"), t("are_you_sure_logout"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("logout"),
        style: "destructive",
        onPress: logout,
      },
    ]);
  };

  const getLanguageName = (locale: string) => {
    return locale === "en" ? t("english") : t("amharic");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#667eea" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || t("guest_user")}</Text>
            <Text style={styles.userEmail}>
              {user?.email || user?.phone || t("not_logged_in")}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("account_settings")}</Text>
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
              ]}
              onPress={() => {
                // Handle navigation to different screens
                Alert.alert(t("coming_soon"), t("feature_coming_soon"));
              }}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#4a5568" />
                <Text style={styles.menuItemText}>{t(item.label)}</Text>
              </View>
              {item.label === "language" && (
                <Text style={styles.languageText}>
                  {getLanguageName(currentLocale)}
                </Text>
              )}
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color="#cbd5e0"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t("preferences")}</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              Alert.alert(t("coming_soon"), t("feature_coming_soon"))
            }
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="moon-outline" size={24} color="#4a5568" />
              <Text style={styles.menuItemText}>{t("dark_mode")}</Text>
            </View>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={20}
              color="#cbd5e0"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.lastMenuItem]}
            onPress={() =>
              Alert.alert(t("coming_soon"), t("feature_coming_soon"))
            }
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="location-outline" size={24} color="#4a5568" />
              <Text style={styles.menuItemText}>{t("location_services")}</Text>
            </View>
            <Ionicons
              name={isRTL ? "chevron-back" : "chevron-forward"}
              size={20}
              color="#cbd5e0"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#e53e3e" />
          <Text style={styles.logoutText}>{t("logout")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>TravelEase v1.0.0</Text>
        <Text style={styles.copyrightText}>{t("all_rights_reserved")}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#edf2f7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#667eea",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1a202c",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#718096",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: 16,
    marginHorizontal: 24,
  },
  menuContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginHorizontal: 24,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f7fafc",
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: "#2d3748",
    marginLeft: 16,
  },
  languageText: {
    fontSize: 14,
    color: "#718096",
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#e53e3e",
    marginLeft: 12,
  },
  footer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: "#a0aec0",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#cbd5e0",
  },
});
