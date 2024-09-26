import styled from "@emotion/styled";
import { isError } from "@lightsparkdev/core";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { colors } from "../styles/colors.js";
import { standardBorderRadius } from "../styles/common.js";
import {
  FieldError,
  aboveFieldError,
  standardBorderColor,
} from "../styles/fields.js";
import { pxToRems } from "../styles/utils.js";
import { z } from "../styles/z-index.js";
import { Button } from "./Button.js";
import { Icon } from "./Icon/Icon.js";
import { QRReader } from "./QRReader/QRReader.js";
import type { OnResultFunction } from "./QRReader/types.js";
import { UnstyledButton } from "./UnstyledButton.js";

type QRReaderProps = {
  onResult: OnResultFunction;
  onUserDenyAccess: () => void;
  captureModeTitle?: string;
};

const containerStyle = {};

const videoContainerStyle = {
  position: "static",
  width: "auto",
  height: "auto",
  overflow: "initial",
} as const;

const videoStyle = {};

type QRReaderOverlayProps = {
  captureModeTitle?: string;
  onClickBack: () => void;
};

function QRReaderOverlay({
  captureModeTitle,
  onClickBack,
}: QRReaderOverlayProps) {
  return (
    <StyledQRReaderOverlay>
      <ScreenContext>
        <OverlayHeader>
          <BackButton onClick={onClickBack}>
            <Icon name="ArrowLeft" width={25} />
          </BackButton>
          {captureModeTitle ? <div>{captureModeTitle}</div> : null}
        </OverlayHeader>
        <div
          css={{
            position: "absolute",
            width: "146px",
            top: "13%",
            left: "0px",
            right: "0px",
            margin: "auto",
          }}
        >
          Scan a BTC or Lightning QR code
        </div>
        <OverlayFooter>
          <div>or</div>
          <Button text="Enter an address" onClick={onClickBack} mt={12} />
        </OverlayFooter>
      </ScreenContext>
      <svg
        height="100%"
        viewBox="0 0 1784 623"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1784 0H0V623H1784V0ZM774.107 136C756.375 136 742 150.327 742 168V404C742 421.673 756.375 436 774.107 436H1009.89C1027.63 436 1042 421.673 1042 404V168C1042 150.327 1027.63 136 1009.89 136H774.107Z"
          fill="black"
          fillOpacity="0.5"
        />
        <rect
          x="742"
          y="136"
          width="300"
          height="300"
          rx="32"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 6"
        />
      </svg>
    </StyledQRReaderOverlay>
  );
}

export function QRReaderButton({
  onResult,
  onUserDenyAccess,
  captureModeTitle,
}: QRReaderProps) {
  const [capturing, setCapturing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const nodeRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (!nodeRef.current) {
      nodeRef.current = document.createElement("div");
      document.body.appendChild(nodeRef.current);
    }
    return () => {
      if (nodeRef.current) {
        document.body.removeChild(nodeRef.current);
        nodeRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (capturing) {
      document.body.style.overflow = "hidden";
      document.body.style.overscrollBehavior = "none";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.overscrollBehavior = "";
      document.body.style.touchAction = "";
    }
  }, [capturing]);

  return (
    <QRReaderButtonContainer>
      {capturing && nodeRef.current
        ? // portal needed to break outside card stacking context and stay above header
          ReactDOM.createPortal(
            <QRContainer>
              <QRReaderOverlay
                captureModeTitle={captureModeTitle || "Scan QR Code"}
                onClickBack={() => setCapturing(false)}
              />
              <QRReader
                constraints={{
                  facingMode: "environment",
                }}
                onResult={(result, error) => {
                  if (result) {
                    setCapturing(false);
                    onResult(result, error);
                  }
                  if (error) {
                    // onResult fires very often with unimportant errors that
                    // we should ignore
                    if (isError(error)) {
                      if (error.message.match(/Permission denied/)) {
                        setErrorMsg(
                          "You must allow access to your camera to scan QR codes.",
                        );
                        onUserDenyAccess();
                      }
                    }
                  }
                }}
                containerStyle={containerStyle}
                videoContainerStyle={videoContainerStyle}
                videoStyle={videoStyle}
              />
            </QRContainer>,
            nodeRef.current,
          )
        : null}
      <ScanQRButton
        onClick={() => setCapturing(true)}
        hasError={Boolean(errorMsg)}
      >
        <Icon name="CameraCapture" width={64} />
        <div css={{ marginTop: "21px" }}>Scan QR Code</div>
      </ScanQRButton>
      {errorMsg ? <FieldError>{errorMsg}</FieldError> : null}
    </QRReaderButtonContainer>
  );
}

const StyledQRReaderOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  z-index: ${z.qrReaderOverlay};
  left: 50%;
  transform: translateX(-50%);
`;

const QRContainer = styled.div`
  // some of these styles aren't applied properly via the provided props, override:
  video {
    z-index: ${z.qrReaderVideo} !important;
    padding: 0 !important;
    position: fixed !important;
    width: 100vw !important;
    height: 100vh !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    object-fit: cover !important;
  }
`;

const QRReaderButtonContainer = styled.div``;

const ScanQRButton = styled(UnstyledButton)<{ hasError: boolean }>`
  ${standardBorderColor}
  ${aboveFieldError}
  margin-top: 16px;
  border-style: solid;
  border-width: 1px;
  ${standardBorderRadius(8)}
  width: 100%;
  padding: 24px 16px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${({ theme }) => theme.lcNeutral};
  div:last-of-type {
    color: ${({ theme }) => theme.c4Neutral};
    font-weight: 600;
  }
`;

// create a new screen sized element to position the other content
const ScreenContext = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 50%;
  transform: translateX(-50%);
  color: ${colors.white};
  text-align: center;
`;

const qrOverlayHeaderHeightPx = 80;
const BackButton = styled(UnstyledButton)`
  height: ${qrOverlayHeaderHeightPx}px;
  width: ${qrOverlayHeaderHeightPx}px;
  color: ${colors.white};
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
`;

const OverlayHeader = styled.div`
  position: absolute;
  top: 0;
  font-size: ${pxToRems(16)};
  text-align: center;
  width: 100%;
  height: ${qrOverlayHeaderHeightPx}px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OverlayFooter = styled.div`
  padding: 16px 0;
  position: absolute;
  height: 32%;
  max-height: 250px;
  background: ${colors.black};
  bottom: 0;
  left: 0;
  width: 100%;
  font-size: ${pxToRems(16)};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;
