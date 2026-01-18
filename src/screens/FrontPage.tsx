import { useEffect, useState } from "react";
import { MdVerifiedUser } from "react-icons/md";

type FrontPageProps = {
  onGetStarted: () => void;
};

export default function FrontPage({ onGetStarted }: FrontPageProps) {
  const [show, setShow] = useState({
    icon: false,
    title: false,
    subtitle: false,
    button: false
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow({ icon: true, title: true, subtitle: true, button: true });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#F3EFEF] text-black">
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="flex max-w-md flex-col items-center text-center">
          <div
            className={`transition-all duration-700 ${
              show.icon ? "translate-y-0 opacity-100" : "-translate-y-6 opacity-0"
            }`}
          >
            <MdVerifiedUser className="text-[80px] text-purple-700" />
          </div>
          <div className="h-8" />
          <div
            className={`transition-all duration-700 ${
              show.title ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
            }`}
          >
            <h1 className="text-4xl font-bold text-black/90">IDSecure</h1>
          </div>
          <div className="h-4" />
          <div
            className={`transition-all duration-700 ${
              show.subtitle ? "translate-x-0 opacity-100" : "-translate-x-10 opacity-0"
            }`}
          >
            <p className="text-lg text-black/60">
              Your Digital Identity, Protected and Verified
            </p>
          </div>
          <div className="h-10" />
          <div
            className={`transition-all duration-700 ${
              show.button ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            <button
              className="rounded-full bg-purple-700 px-10 py-4 text-lg font-medium text-white shadow-lg shadow-black/10"
              onClick={onGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
