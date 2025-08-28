import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import theme from "../../config/theme";
import { useLanguage } from "../../context/LanguageContext";

const LanguageScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const languages = [
    { code: "en", name: t("english") },
    { code: "am", name: t("amharic") },
  ];

  const handleSelect = (lng) => {
    changeLanguage(lng);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("change_language")}</Text>

      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.languageItem,
            language === lang.code && styles.selectedLanguage,
          ]}
          onPress={() => handleSelect(lang.code)}
        >
          <Text style={styles.languageText}>{lang.name}</Text>
          {language === lang.code && <View style={styles.selectedIndicator} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderColor: theme.colors.light,
  },
  selectedLanguage: {
    backgroundColor: theme.colors.light,
  },
  languageText: {
    fontSize: theme.fontSize.large,
    color: theme.colors.dark,
  },
  selectedIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
});

export default LanguageScreen;
