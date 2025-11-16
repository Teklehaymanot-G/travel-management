import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/src/context/AuthContext";
import { updateMe } from "@/src/services/userService";

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const avatarUri = useMemo(() => {
    if (image?.base64) return `data:image/jpeg;base64,${image.base64}`;
    return image?.uri || user?.profileImageUrl || undefined;
  }, [image, user]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permission_required") || "Permission required",
          t("allow_media_library") ||
            "Allow media library to select profile image."
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.9,
        base64: true,
      });
      if (!result.canceled) setImage(result.assets[0]);
    } catch (e) {
      Alert.alert(
        t("error") || "Error",
        t("failed_to_pick_image") || "Failed to pick image"
      );
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("permission_required") || "Permission required",
          t("allow_camera") || "Allow camera to take a profile photo."
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.9,
        base64: true,
      });
      if (!result.canceled) setImage(result.assets[0]);
    } catch (e) {
      Alert.alert(
        t("error") || "Error",
        t("failed_to_take_photo") || "Failed to take photo"
      );
    }
  };

  const onSave = async () => {
    try {
      if (newPassword && newPassword !== confirmPassword) {
        Alert.alert(
          t("error") || "Error",
          t("password_mismatch") || "Passwords do not match"
        );
        return;
      }
      setSaving(true);
      const profileImageUrl = avatarUri;
      const payload: any = { name };
      if (currentPassword) payload.currentPassword = currentPassword;
      if (newPassword) payload.newPassword = newPassword;
      if (profileImageUrl) payload.profileImageUrl = profileImageUrl;
      const updated = await updateMe(payload);
      await setUser(updated);
      Alert.alert(
        t("success") || "Success",
        t("profile_updated") || "Profile updated"
      );
      router.back();
    } catch (e: any) {
      Alert.alert(
        t("error") || "Error",
        e?.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("edit_profile") || "Edit Profile"}
        </Text>
        <TouchableOpacity
          onPress={onSave}
          disabled={saving}
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
        >
          <Text style={styles.saveText}>{t("save") || "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}>
            {avatarUri ? (
              <Image
                source={{ uri: avatarUri }}
                style={{ width: 96, height: 96, borderRadius: 48 }}
              />
            ) : (
              <Ionicons name="person" size={44} color="#64748b" />
            )}
          </View>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <TouchableOpacity style={styles.smallBtn} onPress={pickImage}>
              <Ionicons name="image-outline" size={16} color="#4338ca" />
              <Text style={styles.smallBtnText}>
                {t("choose_from_gallery") || "Gallery"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={16} color="#4338ca" />
              <Text style={styles.smallBtnText}>
                {t("take_photo") || "Camera"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t("full_name") || "Full Name"}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("enter_full_name") || "Enter your full name"}
            style={styles.input}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>{t("password") || "Password"}</Text>
          <TextInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder={t("current_password") || "Current password"}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder={t("new_password") || "New password"}
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder={t("confirm_password") || "Confirm password"}
            secureTextEntry
            style={styles.input}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#4f46e5",
    borderRadius: 8,
  },
  saveText: { color: "#fff", fontWeight: "700" },
  avatarWrap: { alignItems: "center", marginTop: 8 },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  label: { fontSize: 13, color: "#6b7280", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
    marginTop: 8,
  },
  smallBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#eef2ff",
    borderWidth: 1,
    borderColor: "#c7d2fe",
    borderRadius: 10,
  },
  smallBtnText: { marginLeft: 6, color: "#4338ca", fontWeight: "600" },
});
