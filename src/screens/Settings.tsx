import { useRef, useState } from "react";
import { exportData, importData, clearQueue, clearUsers } from "../data/db";
import type { User } from "../data/types";
import { useTheme } from "../hooks/useTheme";

const PASSKEY_STORAGE_KEY = "my_id_passkey_credential_id";
const PASSKEY_STARTUP_KEY = "my_id_passkey_on_startup";

function isValidUser(user: User) {
  return (
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.title === "string" &&
    typeof user.email === "string" &&
    typeof user.phone === "string" &&
    typeof user.notes === "string" &&
    typeof user.updatedAt === "number"
  );
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPasskeyRegistered, setIsPasskeyRegistered] = useState(() =>
    Boolean(localStorage.getItem(PASSKEY_STORAGE_KEY))
  );
  const [passkeyStatus, setPasskeyStatus] = useState<string | null>(() =>
    localStorage.getItem(PASSKEY_STORAGE_KEY) ? "Passkey registered on this device." : null
  );
  const [isPasskeyRequiredOnStartup, setIsPasskeyRequiredOnStartup] = useState(() =>
    localStorage.getItem(PASSKEY_STARTUP_KEY) === "true"
  );

  const toBase64Url = (buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  };

  const getExportFilename = () => {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, "0");
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    return `myid-export-${timestamp}.json`;
  };

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = getExportFilename();
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Exported JSON file.");
    setError(null);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as { users?: User[] };
      if (!data.users || !Array.isArray(data.users)) {
        throw new Error("Missing users array.");
      }
      if (!data.users.every(isValidUser)) {
        throw new Error("Invalid user data.");
      }
      await importData({ users: data.users });
      setMessage("Import completed.");
      setError(null);
    } catch (err) {
      setError((err as Error).message || "Import failed.");
      setMessage(null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleReset = async () => {
    await clearUsers();
    await clearQueue();
    setMessage("Local data cleared.");
    setError(null);
  };

  const registerPasskey = async () => {
    if (!("PublicKeyCredential" in window)) {
      setPasskeyStatus("Passkeys are not supported in this browser.");
      return;
    }
    try {
      const hasPlatformAuth =
        typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function"
          ? await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          : true;
      if (!hasPlatformAuth) {
        setPasskeyStatus("No built-in authenticator available on this device.");
        return;
      }
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const rpId = window.location.hostname;
      const publicKey: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: rpId ? { name: "My ID", id: rpId } : { name: "My ID" },
        user: {
          id: userId,
          name: "my-id-user",
          displayName: "My ID User"
        },
        pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred",
          residentKey: "preferred"
        },
        attestation: "none",
        timeout: 60000
      };
      const credential = (await navigator.credentials.create({
        publicKey
      })) as PublicKeyCredential | null;
      if (!credential) {
        setPasskeyStatus("Passkey registration was cancelled.");
        return;
      }
      localStorage.setItem(PASSKEY_STORAGE_KEY, toBase64Url(credential.rawId));
      setIsPasskeyRegistered(true);
      setPasskeyStatus("Passkey registered on this device.");
    } catch (err) {
      const messageText =
        err instanceof Error && err.message ? err.message : "Passkey registration failed.";
      setPasskeyStatus(messageText);
    }
  };

  const unregisterPasskey = () => {
    localStorage.removeItem(PASSKEY_STORAGE_KEY);
    localStorage.removeItem(PASSKEY_STARTUP_KEY);
    setIsPasskeyRegistered(false);
    setIsPasskeyRequiredOnStartup(false);
    setPasskeyStatus("Passkey removed from this device.");
  };

  const togglePasskeyOnStartup = () => {
    setIsPasskeyRequiredOnStartup((prev) => {
      const next = !prev;
      localStorage.setItem(PASSKEY_STARTUP_KEY, String(next));
      return next;
    });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-black/90">Settings</h2>
        <p className="text-sm text-black/50">Manage theme, data, and passkeys.</p>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-black/80">Theme</p>
        <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
          {(["system", "light", "dark"] as const).map((option) => (
            <button
              key={option}
              className={`rounded-xl border px-3 py-2 font-semibold transition ${
                theme === option
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-black/10 text-black/60 hover:border-black/20 hover:bg-black/[0.02]"
              }`}
              onClick={() => setTheme(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/60 shadow-sm">
        <p className="font-semibold text-black/80">Data</p>
        <div className="mt-3 flex flex-col gap-2">
          <button
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-left text-sm font-semibold text-black/70 hover:bg-black/[0.02]"
            onClick={handleExport}
          >
            Export as JSON
          </button>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleImport}
              className="hidden"
              aria-label="Import JSON data"
            />
            <button
              className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-left text-sm font-semibold text-black/70 hover:bg-black/[0.02]"
              onClick={() => fileInputRef.current?.click()}
            >
              Import JSON data
            </button>
          </div>
          <button
            className="rounded-xl border border-rose-500/40 bg-rose-50 px-3 py-2 text-left text-sm font-semibold text-rose-700 hover:bg-rose-100"
            onClick={handleReset}
          >
            Reset local data
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/60 shadow-sm">
        <p className="font-semibold text-black/80">Passkeys (Face ID, Touch ID)</p>
        <p className="mt-1 text-xs text-black/40">
          Register a passkey to use device biometrics for sign-in.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            className="flex-1 rounded-xl border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-black/70 hover:bg-black/[0.02]"
            onClick={registerPasskey}
          >
            Register passkey
          </button>
          {isPasskeyRegistered ? (
            <button
              className="flex-1 rounded-xl border border-rose-500/40 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
              onClick={unregisterPasskey}
            >
              Remove passkey
            </button>
          ) : null}
        </div>
        {isPasskeyRegistered ? (
          <label className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-black/70">
            <span>Require passkey on app startup</span>
            <button
              type="button"
              onClick={togglePasskeyOnStartup}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                isPasskeyRequiredOnStartup ? "bg-purple-600" : "bg-black/20"
              }`}
              aria-pressed={isPasskeyRequiredOnStartup}
              aria-label="Toggle passkey on startup"
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition ${
                  isPasskeyRequiredOnStartup ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </button>
          </label>
        ) : null}
        {passkeyStatus ? (
          <p className="mt-2 text-xs text-black/50">{passkeyStatus}</p>
        ) : null}
      </div>

      {(message || error) && (
        <div
          className={`rounded-2xl border p-3 text-xs ${
            error
              ? "border-rose-500/30 bg-rose-50 text-rose-700"
              : "border-emerald-500/30 bg-emerald-50 text-emerald-700"
          }`}
          role="status"
        >
          {error || message}
        </div>
      )}
    </section>
  );
}
