import type { BrowserQRCodeReader } from "@zxing/browser";
import type { Result } from "@zxing/library";

export type QRReaderProps = {
  /**
   * Media track constraints object, to specify which camera and capabilities
   * to use
   */
  constraints?: MediaTrackConstraints;
  /**
   * Called when an error occurs.
   */
  onResult?: OnResultFunction;
  /**
   * Property that represents the scan period
   */
  scanDelay?: number;
  /**
   * Property that represents the ID of the video element
   */
  videoId?: string;
  /**
   * Property that represents an optional className to modify styles
   */
  className?: string;
  /**
   * Property that represents a style for the container
   */
  containerStyle?: React.CSSProperties;
  /**
   * Property that represents a style for the video container
   */
  videoContainerStyle?: React.CSSProperties;
  /**
   * Property that represents a style for the video
   */
  videoStyle?: React.CSSProperties;
};

export type OnResultFunction = (
  /**
   * The QR values extracted by Zxing
   */
  result?: Result | undefined | null,
  /**
   * The name of the exceptions thrown while reading the QR
   */
  error?: Error | undefined | null,
  /**
   * The instance of the QR browser reader
   */
  codeReader?: BrowserQRCodeReader,
) => void;

export type UseQRReaderHookProps = {
  /**
   * Media constraints object, to specify which camera and capabilities to use
   */
  constraints?: MediaTrackConstraints | undefined;
  /**
   * Callback for retrieving the result
   */
  onResult?: OnResultFunction | undefined;
  /**
   * Property that represents the scan period
   */
  scanDelay?: number | undefined;
  /**
   * Property that represents the ID of the video element
   */
  videoId?: string | undefined;
};

export type UseQRReaderHook = (props: UseQRReaderHookProps) => void;
