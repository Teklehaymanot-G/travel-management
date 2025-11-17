import AsyncStorage from "@react-native-async-storage/async-storage";

// AuthContext uses keys: userToken, userData
// Legacy keys used here previously: authToken, user
// Provide backward compatibility + migration.
export async function getAuthToken(): Promise<string | null> {
  try {
    const userToken = await AsyncStorage.getItem("userToken");
    if (userToken) return userToken;
    const legacy = await AsyncStorage.getItem("authToken");
    if (legacy) {
      // migrate
      await AsyncStorage.setItem("userToken", legacy);
      await AsyncStorage.removeItem("authToken");
    }
    return legacy || null;
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string) {
  await AsyncStorage.setItem("userToken", token);
  // clean legacy
  await AsyncStorage.removeItem("authToken");
}

export async function clearAuthToken() {
  await AsyncStorage.multiRemove(["userToken", "authToken"]);
}

export async function getStoredUser(): Promise<any | null> {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (userData) return JSON.parse(userData);
    const legacy = await AsyncStorage.getItem("user");
    if (legacy) {
      // migrate
      await AsyncStorage.setItem("userData", legacy);
      await AsyncStorage.removeItem("user");
      return JSON.parse(legacy);
    }
    return null;
  } catch {
    return null;
  }
}
