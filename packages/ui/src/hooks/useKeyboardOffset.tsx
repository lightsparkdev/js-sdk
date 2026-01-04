"use client";

import { useEffect, useState } from "react";

/**
 * Hook to handle iOS keyboard viewport changes.
 * Returns the offset needed to keep elements above the keyboard.
 */
export function useKeyboardOffset() {
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const handleResize = () => {
      // Calculate the difference between window height and visual viewport height
      // This difference is the keyboard height
      const offset = window.innerHeight - viewport.height;
      setKeyboardOffset(Math.max(0, offset));
    };

    // Initial check
    handleResize();

    viewport.addEventListener("resize", handleResize);
    viewport.addEventListener("scroll", handleResize);

    return () => {
      viewport.removeEventListener("resize", handleResize);
      viewport.removeEventListener("scroll", handleResize);
    };
  }, []);

  return keyboardOffset;
}
