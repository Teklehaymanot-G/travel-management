import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { scanTicket } from "@/src/services/ticketService";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/src/context/AuthContext";

export default function ScanTicketScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [showCamera, setShowCamera] = useState(true);
  const { user, isLoading } = useAuth();

  // ensure camera permission requested proactively
  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission?.granted]);

  const onBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanning || !showCamera) return;
    setScanning(true);
    try {
      const res = await scanTicket(data);
      setResult(res);
      // Hide camera only on first successful verification (not already scanned)
      if (!res.alreadyScanned) {
        setShowCamera(false);
      } else {
        // brief lockout to avoid rapid duplicate alerts
        setTimeout(() => setScanning(false), 600);
        return;
      }
    } catch (e: any) {
      Alert.alert(t("scan_failed") || "Scan failed", e.message || "Error");
    } finally {
      setScanning(false);
    }
  };

  const startNewScan = () => {
    setResult(null);
    setShowCamera(true);
    setScanning(false);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          {t("camera_permission_denied") || "Camera permission denied."}
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>
            {t("grant_permission") || "Grant Permission"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // wait for auth context to hydrate to avoid false no_access
  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const role = user?.role;
  if (!(role && ["MANAGER", "SUPERVISOR"].includes(role))) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>
          {t("no_access") || "No access to scan tickets."}
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>{t("go_back") || "Go Back"}</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a202c" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("scan_ticket") || "Scan Ticket"}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      {showCamera && (
        <View style={styles.cameraWrapper}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={({ data }: any) => onBarCodeScanned({ data })}
          />
          <View style={styles.overlayCenter}>
            <Text style={styles.overlayText}>
              {t("align_qr") || "Align QR inside box"}
            </Text>
          </View>
        </View>
      )}
      <View style={styles.detailPanel}>
        <View style={styles.detailHeader}>
          <Text style={styles.detailTitle}>{t("traveler") || "Traveler"}</Text>
          <Text style={styles.detailRole}>{user?.role}</Text>
        </View>
        <Text style={styles.detailLine}>{user?.name || user?.phone}</Text>
        {!showCamera && (
          <TouchableOpacity
            style={styles.newScanButton}
            onPress={startNewScan}
            activeOpacity={0.85}
          >
            <Ionicons name="scan-outline" size={16} color="#fff" />
            <Text style={styles.newScanButtonText}>
              {t("new_scan") || "New Scan"}
            </Text>
          </TouchableOpacity>
        )}
        {scanning && (
          <ActivityIndicator color="#667eea" style={{ marginTop: 8 }} />
        )}
        {result && (
          <View
            style={[
              styles.ticketBox,
              !result.alreadyScanned ? styles.successBox : styles.warningBox,
            ]}
          >
            <Text style={styles.ticketStatus}>
              {result.alreadyScanned
                ? t("already_scanned") || "Already scanned"
                : t("ticket_valid") || "Ticket valid"}
            </Text>
            <Text style={styles.ticketLine}>
              {(t("ticket") || "Ticket") +
                ": " +
                (result.ticket?.name || "—") +
                "  #" +
                (result.ticket?.badgeNumber || result.ticket?.id || "")}
            </Text>
            {result.checkedInAt && (
              <Text style={styles.ticketLine}>
                {(t("checked_in_at") || "Checked in") +
                  ": " +
                  new Date(result.checkedInAt).toLocaleString()}
              </Text>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  muted: { color: "#718096" },
  button: {
    marginTop: 16,
    backgroundColor: "#667eea",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f7fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1a202c" },
  cameraWrapper: {
    height: "50%",
    position: "relative",
    backgroundColor: "#000",
  },
  camera: { flex: 1 },
  overlayCenter: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  overlayText: {
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "500",
  },
  detailPanel: { flex: 1, padding: 20, backgroundColor: "#ffffff" },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailTitle: { fontSize: 16, fontWeight: "600", color: "#1a202c" },
  detailRole: {
    fontSize: 12,
    fontWeight: "600",
    color: "#667eea",
    backgroundColor: "#eef2ff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  detailLine: { fontSize: 14, color: "#4a5568" },
  ticketBox: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#f8fafc",
  },
  successBox: {
    borderColor: "#38a169",
    backgroundColor: "#f0fff4",
  },
  warningBox: {
    borderColor: "#dd6b20",
    backgroundColor: "#fffaf0",
  },
  ticketStatus: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2d3748",
    marginBottom: 4,
  },
  ticketLine: { fontSize: 12, color: "#4a5568", marginTop: 2 },
  newScanButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginTop: 12,
    backgroundColor: "#667eea",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newScanButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
});
