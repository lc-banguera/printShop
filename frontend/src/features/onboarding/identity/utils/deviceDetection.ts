import { useState, useEffect } from "react";

export type DeviceType = "desktop" | "mobile" | "tablet";

/**
 * Utility to reliably detect if the user is on a Desktop PC or Mobile device.
 * Evaluates navigator.userAgent, touch capabilities, and pointer characteristics.
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "desktop";
  }

  // 1. Check URL override if testing (e.g. ?device=mobile or ?device=desktop)
  const urlParams = new URLSearchParams(window.location.search);
  const deviceParam = urlParams.get("device");
  if (deviceParam === "mobile" || deviceParam === "desktop" || deviceParam === "tablet") {
    return deviceParam;
  }

  // 2. User Agent detection
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  if (isTablet) {
    return "tablet";
  }

  const isMobileUA = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua);
  if (isMobileUA) {
    return "mobile";
  }

  // 3. Hardware touch & coarse pointer capabilities
  const hasTouchScreen =
    navigator.maxTouchPoints > 0 ||
    ("ontouchstart" in window) ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  // If coarse pointer and small-to-medium screen, classify as mobile
  if (hasTouchScreen && window.innerWidth <= 768) {
    return "mobile";
  }

  return "desktop";
}

/**
 * React hook to listen to device type changes (e.g. screen resize or manual switch)
 */
export function useDeviceDetection() {
  const [deviceType, setDeviceType] = useState<DeviceType>(() => detectDeviceType());

  useEffect(() => {
    const handleResize = () => {
      setDeviceType(detectDeviceType());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDesktop = deviceType === "desktop";
  const isMobile = deviceType === "mobile" || deviceType === "tablet";

  return {
    deviceType,
    isDesktop,
    isMobile,
    setDeviceType,
  };
}
