"use client";

import { useEffect } from "react";

/**
 * Find the closest scrollable ancestor element
 */
function getScrollableAncestor(
  element: HTMLElement | null,
): HTMLElement | null {
  while (element && element !== document.body) {
    const style = window.getComputedStyle(element);
    const overflowY = style.overflowY;
    const isScrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      element.scrollHeight > element.clientHeight;
    if (isScrollable) {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

/**
 * iOS scroll lock hook - prevents body scrolling when a modal/drawer is open.
 * This is necessary because iOS Safari doesn't respect overflow:hidden on body.
 *
 * Uses data-drawer-scrollable attribute to identify scrollable containers.
 */
export function useIOSScrollLock() {
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    const originalBodyStyles = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      overflow: body.style.overflow,
      width: body.style.width,
      height: body.style.height,
    };
    const originalHtmlStyles = {
      overflow: html.style.overflow,
      height: html.style.height,
    };

    // Lock the body
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    body.style.width = "100%";
    body.style.height = "100%";

    // Also lock html element for iOS
    html.style.overflow = "hidden";
    html.style.height = "100%";

    // Track touch start for direction detection
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const target = e.target as HTMLElement;

      // Check if inside the drawer
      if (!target.closest("[data-drawer-scrollable]")) {
        e.preventDefault();
        return;
      }

      // Find actual scrollable element
      const scrollable = getScrollableAncestor(target);
      if (!scrollable) {
        // No scrollable content, prevent to avoid bleed
        e.preventDefault();
        return;
      }

      // Check scroll boundaries
      const { scrollTop, scrollHeight, clientHeight } = scrollable;
      const touchY = e.touches[0].clientY;
      const isScrollingUp = touchY > touchStartY;
      const isScrollingDown = touchY < touchStartY;
      const isAtTop = scrollTop <= 0;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

      // Prevent if at boundary and trying to scroll past it
      if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
        e.preventDefault();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      // Restore original styles
      body.style.position = originalBodyStyles.position;
      body.style.top = originalBodyStyles.top;
      body.style.left = originalBodyStyles.left;
      body.style.right = originalBodyStyles.right;
      body.style.overflow = originalBodyStyles.overflow;
      body.style.width = originalBodyStyles.width;
      body.style.height = originalBodyStyles.height;

      html.style.overflow = originalHtmlStyles.overflow;
      html.style.height = originalHtmlStyles.height;

      // Restore scroll position
      window.scrollTo(0, scrollY);

      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
}
