import { useMemo, useState } from "react";
import { MdArrowBack, MdFace, MdFingerprint, MdPin } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { Modal } from "../components/Modal";
import {
  getBoolean,
  getString,
  getWebAuthnCredentialId,
  getWebAuthnUserId,
  setBoolean,
  setString,
  setWebAuthnCredentialId,
  setWebAuthnUserId,
  storageKeys
} from "../utils/storage";

export default function Security() {
  const navigate = useNavigate();
  const [pin, setPin] = useState(getString(storageKeys.userPin));
  const [useFingerprint, setUseFingerprint] = useState(
    getBoolean(storageKeys.useFingerprint, true)
  );
  const [useFaceId, setUseFaceId] = useState(
    getBoolean(storageKeys.useFaceId, false)
  );
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pinDraft, setPinDraft] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const pinStatus = useMemo(() => (pin ? "PIN is set" : ""), [pin]);

  const isWebAuthnSupported = () =>
    Boolean(window.PublicKeyCredential && window.crypto?.getRandomValues);

  const toBase64Url = (buffer: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

  const fromBase64Url = (value: string) => {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padLength = padded.length % 4 ? 4 - (padded.length % 4) : 0;
    const normalized = padded + "=".repeat(padLength);
    const binary = atob(normalized);
    return Uint8Array.from(binary, (char) => char.charCodeAt(0));
  };

  const ensureWebAuthnCredential = async () => {
    if (!isWebAuthnSupported()) {
      throw new Error("Biometric authentication is not supported here.");
    }

    let credentialId = getWebAuthnCredentialId();
    if (credentialId) return credentialId;

    let userId = getWebAuthnUserId();
    if (!userId) {
      const randomId = crypto.getRandomValues(new Uint8Array(16));
      userId = toBase64Url(randomId.buffer);
      setWebAuthnUserId(userId);
    }

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: "IDSecure" },
        user: {
          id: fromBase64Url(userId),
          name: "local-user",
          displayName: "IDSecure User"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: { userVerification: "required" },
        timeout: 60000
      }
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error("Failed to register biometric credential.");
    }

    credentialId = toBase64Url(credential.rawId);
    setWebAuthnCredentialId(credentialId);
    return credentialId;
  };

  const handleSavePin = () => {
    if (pinDraft.length !== 4 || pinDraft !== pinConfirm) {
      setError("PINs do not match or are not 4 digits.");
      return;
    }
    setString(storageKeys.userPin, pinDraft);
    setPin(pinDraft);
    setPinDraft("");
    setPinConfirm("");
    setError(null);
    setShowPinDialog(false);
    setStatus("PIN saved.");
  };

  const handleEnableBiometrics = async (next: boolean, type: "fingerprint" | "face") => {
    setStatus(null);
    setError(null);
    try {
      if (next) {
        await ensureWebAuthnCredential();
        setStatus("Biometrics enabled.");
      } else {
        setStatus("Biometrics disabled.");
      }
      if (type === "fingerprint") {
        setUseFingerprint(next);
        setBoolean(storageKeys.useFingerprint, next);
      } else {
        setUseFaceId(next);
        setBoolean(storageKeys.useFaceId, next);
      }
    } catch (err) {
      setError((err as Error).message || "Biometric setup failed.");
      if (type === "fingerprint") {
        setUseFingerprint(false);
        setBoolean(storageKeys.useFingerprint, false);
      } else {
        setUseFaceId(false);
        setBoolean(storageKeys.useFaceId, false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="flex items-center gap-3 bg-[#2B2322] px-6 py-4 text-white">
        <button
          className="rounded-full p-1"
          onClick={() => navigate("/")}
          aria-label="Back"
        >
          <MdArrowBack className="text-xl" />
        </button>
        <h1 className="text-xl font-semibold">Security</h1>
      </header>

      <main className="space-y-4 px-6 py-6">
        <h3 className="text-xl font-semibold">Set App Lock</h3>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdPin className="text-2xl text-purple-700" />
              <div>
                <p className="font-medium">Set PIN</p>
                {pinStatus ? (
                  <p className="text-sm text-green-700">{pinStatus}</p>
                ) : null}
              </div>
            </div>
            <button
              className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-black/10"
              onClick={() => setShowPinDialog(true)}
            >
              Set
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdFingerprint className="text-2xl text-purple-700" />
              <div>
                <p className="font-medium">Enable Fingerprint</p>
                <p className="text-sm text-black/50">
                  Current value: {useFingerprint ? "true" : "false"}
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-purple-700"
              checked={useFingerprint}
              onChange={(event) => {
                handleEnableBiometrics(event.target.checked, "fingerprint");
              }}
            />
          </label>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <label className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdFace className="text-2xl text-purple-700" />
              <div>
                <p className="font-medium">Enable Face ID</p>
                <p className="text-sm text-black/50">
                  Available on supported devices
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-purple-700"
              checked={useFaceId}
              onChange={(event) => {
                handleEnableBiometrics(event.target.checked, "face");
              }}
            />
          </label>
        </div>
      </main>
      {(status || error) && (
        <div
          className={`mx-6 mb-6 rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || status}
        </div>
      )}

      <Modal isOpen={showPinDialog} onClose={() => setShowPinDialog(false)}>
        <div className="space-y-4 text-left text-black">
          <h2 className="text-lg font-semibold">Set PIN</h2>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinDraft}
            onChange={(event) => setPinDraft(event.target.value)}
            className="w-full border-b border-black/60 bg-transparent py-2 text-sm"
            placeholder="Enter 4-digit PIN"
          />
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pinConfirm}
            onChange={(event) => setPinConfirm(event.target.value)}
            className="w-full border-b border-black/60 bg-transparent py-2 text-sm"
            placeholder="Confirm PIN"
          />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex justify-end gap-2">
            <button
              className="rounded-full px-4 py-2 text-sm font-semibold text-black"
              onClick={() => setShowPinDialog(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-purple-700 px-6 py-2 text-sm font-semibold text-white"
              onClick={handleSavePin}
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
