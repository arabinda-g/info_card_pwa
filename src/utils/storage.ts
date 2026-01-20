export const storageKeys = {
  hasSeenGetStarted: "has_seen_get_started",
  userPin: "user_pin",
  useFingerprint: "use_fingerprint",
  useFaceId: "use_faceid",
  webAuthnCredentialId: "webauthn_credential_id",
  webAuthnUserId: "webauthn_user_id",
  userData: "user_data",
  profileImage: "profile_image"
};

export function getBoolean(key: string, fallback = false) {
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === "true";
}

export function setBoolean(key: string, value: boolean) {
  localStorage.setItem(key, value ? "true" : "false");
}

export function getString(key: string) {
  return localStorage.getItem(key) ?? "";
}

export function setString(key: string, value: string) {
  localStorage.setItem(key, value);
}

export function getUserData(): Record<string, string> {
  const raw = localStorage.getItem(storageKeys.userData);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function setUserData(data: Record<string, string>) {
  localStorage.setItem(storageKeys.userData, JSON.stringify(data));
}

export function clearUserData() {
  localStorage.removeItem(storageKeys.userData);
}

export function getProfileImage() {
  return localStorage.getItem(storageKeys.profileImage) ?? "";
}

export function setProfileImage(base64: string) {
  if (base64) {
    localStorage.setItem(storageKeys.profileImage, base64);
  } else {
    localStorage.removeItem(storageKeys.profileImage);
  }
}

export function getWebAuthnCredentialId() {
  return localStorage.getItem(storageKeys.webAuthnCredentialId) ?? "";
}

export function setWebAuthnCredentialId(value: string) {
  if (value) {
    localStorage.setItem(storageKeys.webAuthnCredentialId, value);
  } else {
    localStorage.removeItem(storageKeys.webAuthnCredentialId);
  }
}

export function getWebAuthnUserId() {
  return localStorage.getItem(storageKeys.webAuthnUserId) ?? "";
}

export function setWebAuthnUserId(value: string) {
  if (value) {
    localStorage.setItem(storageKeys.webAuthnUserId, value);
  } else {
    localStorage.removeItem(storageKeys.webAuthnUserId);
  }
}
