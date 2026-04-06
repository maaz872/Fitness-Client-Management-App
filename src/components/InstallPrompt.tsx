"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  const isIos =
    typeof navigator !== "undefined" &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Android / Chrome: capture the install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Detect when app is installed
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (isInstalled) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setIsInstalled(true);
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    }
  };

  // Only show if we have a prompt (Android) or are on iOS
  if (!deferredPrompt && !isIos) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 w-full text-left text-[12px] text-white/40 hover:text-white/70 transition-colors py-1.5 bg-transparent border-none cursor-pointer"
      >
        <svg
          className="w-4 h-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16"
          />
        </svg>
        Install App
      </button>

      {/* iOS Instructions Modal */}
      {showIosModal && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end justify-center"
          onClick={() => setShowIosModal(false)}
        >
          <div
            className="bg-[#1E1E1E] border-t border-[#2A2A2A] rounded-t-2xl w-full max-w-md p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-base">
                Install on iPhone
              </h3>
              <button
                onClick={() => setShowIosModal(false)}
                className="text-white/40 hover:text-white text-xl bg-transparent border-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            <div className="space-y-4 text-sm text-white/70">
              <div className="flex items-start gap-3">
                <span className="text-white/40 font-bold text-base w-6 shrink-0">
                  1
                </span>
                <p>
                  Tap the{" "}
                  <span className="inline-flex items-center">
                    <svg
                      className="w-5 h-5 text-[#007AFF] mx-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                  </span>{" "}
                  <strong className="text-white">Share</strong> button in Safari
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white/40 font-bold text-base w-6 shrink-0">
                  2
                </span>
                <p>
                  Scroll down and tap{" "}
                  <strong className="text-white">Add to Home Screen</strong>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-white/40 font-bold text-base w-6 shrink-0">
                  3
                </span>
                <p>
                  Tap <strong className="text-white">Add</strong> in the top
                  right
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
