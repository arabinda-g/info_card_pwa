import { useMemo, useState } from "react";
import { Modal } from "../components/Modal";
import { getBoolean, getString, storageKeys } from "../utils/storage";

type LockScreenProps = {
  onUnlock: () => void;
};

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const showFingerprint = useMemo(
    () => getBoolean(storageKeys.useFingerprint, true),
    []
  );
  const showFaceId = useMemo(
    () => getBoolean(storageKeys.useFaceId, false),
    []
  );
  const savedPin = useMemo(() => getString(storageKeys.userPin), []);
  const [error, setError] = useState<string | null>(null);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");

  const handleUnlock = () => {
    if (!savedPin || pin === savedPin) {
      setError(null);
      setShowPinDialog(false);
      setPin("");
      onUnlock();
      return;
    }
    setError("Incorrect PIN");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-purple-900 text-white">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {(showFingerprint || showFaceId) && (
          <div className="mb-6">
            {showFaceId ? (
              <p className="text-lg font-medium">Looking for Face ID...</p>
            ) : null}
          </div>
        )}

        <button
          className="rounded-full bg-white px-8 py-3 font-semibold text-purple-700 shadow-lg shadow-black/20"
          onClick={() => {
            setError(null);
            setShowPinDialog(true);
          }}
        >
          Use PIN
        </button>

        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        <div className="absolute bottom-10 left-0 right-0 text-center text-xl font-bold tracking-[0.4em]">
          ID
        </div>
      </div>

      <Modal isOpen={showPinDialog} onClose={() => setShowPinDialog(false)}>
        <div className="space-y-4 text-left text-black">
          <h2 className="text-xl font-semibold">Enter PIN</h2>
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            className="w-full rounded-xl border border-black/10 px-4 py-3 text-center text-lg tracking-[0.4em]"
            placeholder="••••"
          />
          <div className="flex justify-end gap-2">
            <button
              className="rounded-full px-4 py-2 text-sm font-semibold text-black"
              onClick={() => setShowPinDialog(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-full bg-purple-700 px-6 py-2 text-sm font-semibold text-white"
              onClick={handleUnlock}
            >
              Unlock
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
