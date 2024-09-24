export const isMediaDevicesSupported = () => {
  const isMediaDevicesSupported =
    typeof navigator !== "undefined" && !!navigator.mediaDevices;

  if (!isMediaDevicesSupported) {
    console.warn(
      `[ReactQRReader]: MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"`,
    );
  }

  return isMediaDevicesSupported;
};

export const isValidType = (value: unknown, name: string, type: string) => {
  const isValid = typeof value === type;

  if (!isValid) {
    console.warn(
      `[ReactQRReader]: Expected "${name}" to be a of type "${type}".`,
    );
  }

  return isValid;
};
