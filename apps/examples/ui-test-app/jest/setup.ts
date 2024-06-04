/* Import node libs to polyfill browser objects */
import crypto from "crypto";
import ResizeObserver from "resize-observer-polyfill";

import { TextDecoder, TextEncoder } from "util";

Object.defineProperties(global.self, {
  crypto: {
    value: {
      getRandomValues: (arr: NodeJS.ArrayBufferView) =>
        crypto.randomFillSync(arr),
      subtle: crypto.webcrypto.subtle,
    },
  },
  TextEncoder: {
    value: TextEncoder,
  },
  TextDecoder: {
    value: TextDecoder,
  },
});

global.ResizeObserver = ResizeObserver;
