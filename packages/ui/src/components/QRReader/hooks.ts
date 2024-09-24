import { useEffect, useRef } from "react";
import type { UseQRReaderHook } from "./types.js";
import { isMediaDevicesSupported, isValidType } from "./utils.js";

// see https://bit.ly/3DY4Eby for more context on this approach
export const useQRReader: UseQRReaderHook = ({
  scanDelay: delayBetweenScanAttempts = 500,
  constraints: video,
  onResult,
  videoId,
}) => {
  const mountedRef = useRef(true);

  useEffect(() => {
    const readQRCode = async () => {
      const { BrowserQRCodeReader } = await import(
        /* webpackChunkName: "zxing" */ "@zxing/browser"
      );
      const codeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts,
      });

      // BrowserCodeReader.releaseAllStreams();

      if (!isMediaDevicesSupported() && onResult) {
        const message =
          'MediaDevices API has no support for your browser. You can fix this by running "npm i webrtc-adapter"';

        onResult(null, new Error(message), codeReader);
      }

      if (video && isValidType(video, "constraints", "object")) {
        codeReader
          .decodeFromConstraints(
            { video },
            videoId,
            (result, error, controls) => {
              if (mountedRef.current === false) {
                controls.stop();
                return;
              }

              if (typeof result !== "undefined" && onResult) {
                controls.stop();
                onResult(result, error, codeReader);
              }
            },
          )
          .catch((error: Error) => {
            if (onResult) {
              onResult(null, error, codeReader);
            }
          });
      }
    };

    mountedRef.current = true;
    void readQRCode();
    return () => {
      mountedRef.current = false;
    };
  }, [delayBetweenScanAttempts, onResult, video, videoId]);
};
