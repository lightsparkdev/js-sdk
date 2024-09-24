import { useQRReader } from "./hooks.js";
import { styles } from "./styles.js";
import { type QRReaderProps } from "./types.js";

export function QRReader({
  videoContainerStyle = {},
  containerStyle = {},
  videoStyle = {},
  constraints,
  scanDelay,
  className,
  onResult,
  videoId,
}: QRReaderProps) {
  useQRReader({
    constraints,
    scanDelay,
    onResult,
    videoId,
  });

  return (
    <section className={className} style={containerStyle}>
      <div
        style={{
          ...styles.container,
          ...videoContainerStyle,
        }}
      >
        <video
          muted
          id={videoId}
          style={{
            ...styles.video,
            ...videoStyle,
            transform:
              constraints?.facingMode === "user" ? "scaleX(-1)" : undefined,
          }}
        />
      </div>
    </section>
  );
}

QRReader.displayName = "QRReader";
QRReader.defaultProps = {
  constraints: {
    facingMode: "user",
  },
  videoId: "video",
  scanDelay: 500,
};
