import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import FrontPage from "./screens/FrontPage";
import Home from "./screens/Home";
import LockScreen from "./screens/LockScreen";
import NotFound from "./screens/NotFound";
import QRDisplay from "./screens/QRDisplay";
import QRScanner from "./screens/QRScanner";
import Security from "./screens/Security";
import { getBoolean, getString, setBoolean, storageKeys } from "./utils/storage";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenGetStarted, setHasSeenGetStarted] = useState(false);
  const [pinExists, setPinExists] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    const pin = getString(storageKeys.userPin);
    setPinExists(Boolean(pin));
    setHasSeenGetStarted(getBoolean(storageKeys.hasSeenGetStarted, false));
    setIsLoading(false);
  }, []);

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

  if (pinExists && !unlocked) {
    return <LockScreen onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/security" element={<Security />} />
      <Route path="/qr" element={<QRDisplay />} />
      <Route path="/scan" element={<QRScanner />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
