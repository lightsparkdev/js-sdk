import { isIOS } from "react-device-detect";

/*
 * It's no longer possible to prevent zoom with viewport completely on ios but
 * this will prevent auto input zoom
 * when font-size is less than 16, while providing a similar zoom enabled
 * experience on android. See this and other answers here:
 * https://stackoverflow.com/a/57527009/9808766
 */
export function useMaxScaleIOS() {
  function addMaximumScaleToMetaViewport() {
    const el = document.querySelector("meta[name=viewport]");
    if (el !== null) {
      let content = el.getAttribute("content");
      const re = /maximum-scale=[0-9.]+/g;
      if (content) {
        if (re.test(content)) {
          content = content.replace(re, "maximum-scale=1.0");
        } else {
          content = [content, "maximum-scale=1.0"].join(", ");
        }
        el.setAttribute("content", content);
      }
    }
  }
  const disableIosTextFieldZoom = addMaximumScaleToMetaViewport;

  if (isIOS) {
    disableIosTextFieldZoom();
  }
}
