import type { Theme } from "@emotion/react";

const neutral = {
  black: "#000000",
  gray5: "#0D0D0D",
  gray10: "#1A1A1A",
  gray15: "#262626",
  gray20: "#333333",
  gray25: "#404040",
  gray30: "#4D4D4D",
  gray35: "#5A616F",
  gray40: "#666666",
  gray50: "#808080",
  gray60: "#999999",
  gray70: "#B3B3B3",
  gray75: "#BFBFBF",
  gray80: "#CCCCCC",
  gray85: "#D9D9D9",
  gray90: "#E6E6E6",
  gray91: "#171717",
  gray95: "#F2F2F2",
  gray97: "#F8F8F7",
  gray98: "#F9F9F9",
  gray99: "#EDEEF1",
  white: "#FFFFFF",
  white21: "#FFFFFF21",
};

export const darkGradient =
  "#1d1d1d linear-gradient(180deg, #090909 63.08%, #1d1d1d 100.52%)";

const primary = "#FFF14E";

/**
 * In general human readable colors are represented as
 * [colorName][colorLightness 1-100][alpha 1-100]. For example:
 * red with 42 lightness and 10 alpha is red4210.
 */
const baseColors = {
  ...neutral,
  // alpha variants
  "white-90": "#ffffffe5",
  "white-80": "#ffffffcc",
  "white-70": "#ffffffb2",
  "white-60": "#ffffff99",
  "white-50": "#ffffff80",
  "white-40": "#ffffff66",
  "white-30": "#ffffff4d",
  "white-20": "#ffffff33",
  "white-10": "#ffffff1a",
  "white-04": "#ffffff0a",
  "black-90": "#000000e5",
  "black-80": "#000000cc",
  "black-70": "#000000b2",
  "black-60": "#00000099",
  "black-50": "#00000080",
  "black-40": "#00000066",
  "black-30": "#0000004d",
  "black-20": "#00000033",
  "black-10": "#0000001a",
  "black-04": "#0000000a",
  // gray scale
  "gray-050": "#f8f8f7",
  "gray-100": "#f0f0ee",
  "gray-200": "#deded9",
  "gray-300": "#c1c0b8",
  "gray-400": "#989898",
  "gray-500": "#7c7c7c",
  "gray-600": "#656565",
  "gray-700": "#464646",
  "gray-800": "#3d3d3d",
  "gray-900": "#282828",
  "gray-950": "#1a1a1a",
  // green scale
  "green-50": "#f0fdf7",
  "green-100": "#dbfdee",
  "green-200": "#b9f9dc",
  "green-300": "#82f3c1",
  "green-400": "#45e39e",
  "green-500": "#1ccb7e",
  "green-600": "#11a967",
  "green-700": "#118453",
  "green-800": "#136844",
  "green-900": "#12553a",
  "green-950": "#042f1e",
  // pink scale
  "pink-050": "#fff2fb",
  "pink-100": "#ffe3f9",
  "pink-200": "#ffc6f3",
  "pink-300": "#ff99e5",
  "pink-400": "#ff5dd4",
  "pink-500": "#ff21cc",
  "pink-600": "#ff00d4",
  "pink-700": "#cf00a7",
  "pink-800": "#a90087",
  "pink-900": "#89066c",
  "pink-950": "#5e004a",
  // green
  success: "#17C27C",
  green: "#46ac4a",
  green10: "#e6f4e6",
  green33: "#179257",
  green35: "#19981E",
  green37: "#179A1C",
  // blue
  blue10: "#E4EFFB",
  blue43: "#145BC6",
  blue22: "#0E2E60",
  blue39: "#0068C9",
  blue37: "#21529c",
  blue50: "#2483D1",
  blue58: "#28BFFF",
  blue32: "#0052A4",
  blue90: "#0C3C6F",
  // less than 50% saturated blue
  grayBlue5: "#0c0d0f",
  grayBlue9: "#16171A",
  grayBlue10: "#14161D",
  grayBlue12: "#2D2E34",
  grayBlue14: "#3A3B41",
  grayBlue18: "#21283a",
  grayBlue32: "#4F5156",
  grayBlue43: "#686A72",
  grayBlue45: "#676F80",
  grayBlue57: "#8B8E98",
  grayBlue67: "#9BA7B9",
  grayBlue69: "#A6A9BA",
  grayBlue78: "#C0C6CE",
  grayBlue80: "#C0C9D6",
  grayBlue88: "#DEDFE4",
  grayBlue92: "#E1EBF5",
  grayBlue93: "#E6EEF6",
  grayBlue94: "#EBEEF2",
  grayBlue95: "#F2F3F5",
  grayBlue96: "#F2F5F7",
  // purple
  purple10: "#e6e8f8",
  purple43: "#820AD1",
  purple55: "#8B38DE",
  purple60: "#7366c5",
  // red
  red50: "#E31A1A",
  red42a10: "#D800271A",
  red42a20: "#D800272D",
  red42a30: "#D800273F",
  errorText: "#E41C1B",
  errorBackground: "#FEE2E1",
  // yellow
  primary,
  warning: primary,
  warningYellow: "#E08A00",
  warningText: "#BB6B01",
  warningBackground: "#FBEECB",
  // orange
  danger: "#FD2C0F",
  // neutral
  secondary: neutral.black,
  gray: "#242526",
  grayhover: "#2D2E30",
  grayactive: "#38393B",
  gray2: "#6D7685",
  gray3: "#D9DBDF",
  gray4: "#B6BAC3",
  gray6: "#8E95A2",
  gray7: "#FFFFFF9C",
  gray70: "#ffffff70",
  gray75: "#4A4E5A",
  gray75hover: "#535762",
  gray75active: "#5C606B",
  // transparent
  transparent: "transparent",
  transparenta02: "#00000005",
  transparenta08: "#00000014",
} as const;

/* We only want `as const` to affect keys, the values should be widened to strings: */
export const colors = baseColors as {
  [K in keyof typeof baseColors]: string;
};

export type ColorKey = keyof typeof colors;

export function isColorKey(key: string): key is ColorKey {
  return key in colors;
}

/* Return white or black based on contrast from provided background */
export function hcNeutralFromBg(
  bgHex: string,
  defaultHex = colors.black,
  altHex = colors.white,
) {
  const bgRGB = hexToRGB(bgHex);
  const hcRGB = hexToRGB(defaultHex);
  if (!bgRGB || !hcRGB) return defaultHex;
  const c = contrast(bgRGB, hcRGB);
  if (c < 4.5) {
    return altHex;
  }
  return defaultHex;
}

/* https://bit.ly/3WUawKh */
export function luminance(r: number, g: number, b: number) {
  const a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

type RGB = [number, number, number];

export function contrast(rgb1: RGB, rgb2: RGB) {
  const lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

export function rgbToHex(r: number, g: number, b: number) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function hexToRGB(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? ([
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ] as RGB)
    : ([0, 0, 0] as RGB);
}

export function hexToRGBAStr(hex: string, alpha: number) {
  const rgb = hexToRGB(hex);
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
}

export type ThemeProp = {
  theme: Theme;
};
export type WithTheme<T extends Record<string, unknown>> = T & ThemeProp;
