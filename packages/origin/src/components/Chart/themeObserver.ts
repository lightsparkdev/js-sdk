export function observeThemeChanges(
  element: HTMLElement,
  onThemeChange: () => void,
): () => void {
  const observer = new MutationObserver(onThemeChange);
  let target: HTMLElement | null = element;

  while (target) {
    observer.observe(target, {
      attributes: true,
      attributeFilter: ["data-theme", "class"],
    });
    target = target.parentElement;
  }

  const media =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  media?.addEventListener("change", onThemeChange);

  return () => {
    observer.disconnect();
    media?.removeEventListener("change", onThemeChange);
  };
}
