import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import FrontPage from "./screens/FrontPage";
import Home from "./screens/Home";
import NotFound from "./screens/NotFound";
import { getBoolean, setBoolean, storageKeys } from "./utils/storage";

const PASSKEY_STORAGE_KEY = "my_id_passkey_credential_id";
const PASSKEY_STARTUP_KEY = "my_id_passkey_on_startup";

const base64UrlToBuffer = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenGetStarted, setHasSeenGetStarted] = useState(false);
  const [isPasskeyRequired, setIsPasskeyRequired] = useState(false);
  const [isPasskeyVerified, setIsPasskeyVerified] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [storedPasskeyId, setStoredPasskeyId] = useState<string | null>(null);

  const authenticateWithPasskey = useCallback(async (credentialId: string) => {
    if (!("PublicKeyCredential" in window)) {
      setAuthError("Passkeys are not supported in this browser.");
      return;
    }
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const publicKey: PublicKeyCredentialRequestOptions = {
        challenge: crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials: [
          {
            type: "public-key",
            id: base64UrlToBuffer(credentialId)
          }
        ],
        userVerification: "preferred",
        timeout: 60000
      };
      const assertion = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
      if (!assertion) {
        throw new Error("Passkey verification was cancelled.");
      }
      setIsPasskeyVerified(true);
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Passkey verification failed.";
      setAuthError(message);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  useEffect(() => {
    setHasSeenGetStarted(getBoolean(storageKeys.hasSeenGetStarted, false));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (!hasSeenGetStarted) return;
    const credentialId = localStorage.getItem(PASSKEY_STORAGE_KEY);
    const requireOnStartup = localStorage.getItem(PASSKEY_STARTUP_KEY) === "true";
    if (credentialId && requireOnStartup) {
      setStoredPasskeyId(credentialId);
      setIsPasskeyRequired(true);
      setIsPasskeyVerified(false);
      void authenticateWithPasskey(credentialId);
      return;
    }
    setIsPasskeyRequired(false);
    setIsPasskeyVerified(true);
  }, [authenticateWithPasskey, hasSeenGetStarted, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EFEF]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-700 border-t-transparent" />
      </div>
    );
  }

  if (!hasSeenGetStarted) {
    return (
      <FrontPage
        onGetStarted={() => {
          setBoolean(storageKeys.hasSeenGetStarted, true);
          setHasSeenGetStarted(true);
        }}
      />
    );
  }

  if (isPasskeyRequired && !isPasskeyVerified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3EFEF] px-6">
        <div className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 text-center shadow-lg shadow-black/10">
          <h2 className="text-xl font-semibold text-black/90">Unlock with passkey</h2>
          <p className="mt-2 text-sm text-black/50">
            Confirm your identity to continue.
          </p>
          {authError ? (
            <p className="mt-3 text-xs text-rose-600">{authError}</p>
          ) : null}
          <button
            className="mt-5 w-full rounded-2xl bg-purple-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            onClick={() => {
              if (!storedPasskeyId) return;
              void authenticateWithPasskey(storedPasskeyId);
            }}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? "Waiting for passkey..." : "Unlock"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
