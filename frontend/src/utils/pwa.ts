export const installPWA = (): void => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
};

export const isPWAInstallable = (): boolean => {
  return window.matchMedia("(display-mode: standalone)").matches;
};

export const showInstallPrompt = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const deferredPrompt = (window as any).deferredPrompt;
    if (!deferredPrompt) {
      reject(new Error("No install prompt available"));
      return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        resolve();
      } else {
        console.log("User dismissed the install prompt");
        reject(new Error("User dismissed install prompt"));
      }
      (window as any).deferredPrompt = null;
    });
  });
};

export const initializePWA = (): void => {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    console.log("PWA install prompt available");
  });

  window.addEventListener("appinstalled", () => {
    console.log("PWA was installed");
    (window as any).deferredPrompt = null;
  });
};
