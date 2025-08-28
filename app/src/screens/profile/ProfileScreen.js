import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "../../config/theme";
import { useAuth } from "../../context/AuthContext";

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{user?.name || t("profile")}</Text>
        <Text style={styles.phone}>{user?.phone || ""}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate("Language")}
        >
          <Text style={styles.menuText}>{t("language")}</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={logout}>
          <Text style={[styles.menuText, styles.logoutText]}>
            {t("logout")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.gray,
    marginBottom: theme.spacing.m,
  },
  name: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
  },
  phone: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
  },
  menu: {
    backgroundColor: theme.colors.white,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderColor: theme.colors.light,
  },
  menuText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.dark,
  },
  menuArrow: {
    fontSize: theme.fontSize.xxlarge,
    color: theme.colors.gray,
  },
  logoutText: {
    color: theme.colors.danger,
  },
});

export default ProfileScreen;
