import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import theme from "../../config/theme";
import { isRTL } from "../../utils/rtl";

const DocumentViewerScreen = ({ route }) => {
  const { t } = useTranslation();
  const { travel } = route.params;
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Mock documents data
  const documents = [
    {
      id: "1",
      title: t("itinerary"),
      type: "PDF",
      size: "2.4 MB",
      url: "https://example.com/itinerary.pdf",
    },
    {
      id: "2",
      title: t("hotel_info"),
      type: "PDF",
      size: "1.8 MB",
      url: "https://example.com/hotel.pdf",
    },
    {
      id: "3",
      title: t("travel_insurance"),
      type: "PDF",
      size: "3.1 MB",
      url: "https://example.com/insurance.pdf",
    },
    {
      id: "4",
      title: t("visa_requirements"),
      type: "PDF",
      size: "1.2 MB",
      url: "https://example.com/visa.pdf",
    },
  ];

  const handleDownload = (doc) => {
    // In a real app, this would download the document
    setSelectedDoc(doc);
    alert(`${t("downloading")} ${doc.title}`);
  };

  const renderDocument = (doc) => (
    <TouchableOpacity
      key={doc.id}
      style={[
        styles.documentCard,
        selectedDoc?.id === doc.id && styles.selectedDocument,
      ]}
      onPress={() => handleDownload(doc)}
    >
      <View style={styles.documentIcon}>
        <Text style={styles.documentIconText}>PDF</Text>
      </View>
      <View style={styles.documentInfo}>
        <Text style={styles.documentTitle}>{doc.title}</Text>
        <Text style={styles.documentSize}>{doc.size}</Text>
      </View>
      <TouchableOpacity
        style={styles.downloadButton}
        onPress={() => handleDownload(doc)}
      >
        <Text style={styles.downloadButtonText}>{t("download")}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{travel.title}</Text>
        <Text style={styles.headerSubtitle}>{t("travel_documents")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.documentsContainer}>
        {documents.map(renderDocument)}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{t("important_info")}</Text>
          <Text style={styles.infoText}>{t("document_info")}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light,
  },
  header: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.m,
    ...(isRTL && { alignItems: "flex-end" }),
  },
  headerTitle: {
    fontSize: theme.fontSize.xlarge,
    fontWeight: "bold",
    color: theme.colors.white,
    ...(isRTL && { textAlign: "right" }),
  },
  headerSubtitle: {
    fontSize: theme.fontSize.large,
    color: theme.colors.white,
    opacity: 0.9,
    ...(isRTL && { textAlign: "right" }),
  },
  documentsContainer: {
    padding: theme.spacing.m,
  },
  documentCard: {
    flexDirection: isRTL ? "row-reverse" : "row",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.s,
    elevation: 1,
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedDocument: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  documentIcon: {
    width: 50,
    height: 50,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadius.small,
    marginRight: isRTL ? 0 : theme.spacing.m,
    marginLeft: isRTL ? theme.spacing.m : 0,
  },
  documentIconText: {
    color: theme.colors.primary,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
  documentInfo: {
    flex: 1,
    ...(isRTL && { alignItems: "flex-end" }),
  },
  documentTitle: {
    fontSize: theme.fontSize.medium,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.xs,
    ...(isRTL && { textAlign: "right" }),
  },
  documentSize: {
    fontSize: theme.fontSize.small,
    color: theme.colors.gray,
    ...(isRTL && { textAlign: "right" }),
  },
  downloadButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.s,
    paddingHorizontal: theme.spacing.m,
    borderRadius: theme.borderRadius.medium,
  },
  downloadButtonText: {
    color: theme.colors.white,
    fontWeight: "bold",
    fontSize: theme.fontSize.medium,
  },
  infoBox: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.m,
    marginTop: theme.spacing.m,
    ...(isRTL && { alignItems: "flex-end" }),
  },
  infoTitle: {
    fontSize: theme.fontSize.large,
    fontWeight: "bold",
    color: theme.colors.dark,
    marginBottom: theme.spacing.s,
    ...(isRTL && { textAlign: "right" }),
  },
  infoText: {
    fontSize: theme.fontSize.medium,
    color: theme.colors.gray,
    lineHeight: 24,
    ...(isRTL && { textAlign: "right" }),
  },
});

export default DocumentViewerScreen;
