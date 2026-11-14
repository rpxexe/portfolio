/**
 * "Lite" motion mode is decided by an inline script in the root layout before first
 * paint (phones, tablets, touch, low-power or data-saver devices). Components use it
 * to swap heavy effects for cheaper equivalents; CSS reads html[data-lite="true"].
 */
export function isLite(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.dataset.lite === "true";
}
