import { css } from "@emotion/react";
import styled from "@emotion/styled";
import { Fragment } from "react";
import FramedLogoOnCircle from "../static/images/FramedLogoOnCircle.svg?url";
// eslint-disable-next-line no-restricted-imports
import { QRCodeSVG } from "qrcode.react";
import { colors } from "../styles/colors.js";
import { absoluteCenter } from "../styles/utils.js";
import { Icon } from "./Icon/Icon.js";

type Props = {
  value?: string | undefined;
  children: React.ReactNode;
  heading?: string;
  border?: boolean;
  isCentered?: boolean;
  size?: number;
  showLogo?: boolean;
  animated?: boolean;
};

const defaultProps = {
  children: null,
  border: true,
  isCentered: true,
  size: 256,
  showLogo: true,
  animated: false,
};

export function QRCode({
  value,
  children,
  heading,
  border = defaultProps.border,
  isCentered = defaultProps.isCentered,
  size = defaultProps.size,
  showLogo = defaultProps.showLogo,
  animated = defaultProps.animated,
}: Props) {
  const logoSize = Math.round(size * 0.2);
  const imageSettingsProp = showLogo
    ? {
        imageSettings: {
          excavate: true,
          height: logoSize,
          src: FramedLogoOnCircle,
          width: logoSize,
        },
      }
    : {};
  return (
    <Fragment>
      {heading && <QRCodeLabel>{heading}</QRCodeLabel>}
      <QRCodeContainer isCentered={isCentered}>
        {value ? (
          <QRCodeImage isCentered={isCentered} border={border}>
            <QRCodeSVG
              value={value}
              size={size}
              level="L"
              {...imageSettingsProp}
            />
          </QRCodeImage>
        ) : (
          <EmptyQRCodeSizer size={size}>
            <EmptyQRCode
              isCentered={isCentered}
              border={border}
              animated={animated}
            >
              <Icon name="LogoOnCircle" width={30} />
            </EmptyQRCode>
          </EmptyQRCodeSizer>
        )}
      </QRCodeContainer>
      {children}
    </Fragment>
  );
}

QRCode.defaultProps = defaultProps;

const borderWidth = 10;

type QRCodeProps = {
  border: boolean;
  isCentered: boolean;
};

export const qr = ({ isCentered, border }: QRCodeProps) => css`
  display: inline-block;
  ${border && `border: ${borderWidth}px solid #ffffff;`}
  ${border && `border-radius: 8px;`}
  ${border && "box-sizing: content-box;"}
`;

const QRCodeContainer = styled.div<{ isCentered: boolean }>`
  display: flex;
  ${({ isCentered }) =>
    isCentered &&
    `
      justify-content: center;
      align-items: center;
    `}
  font-size: 12px;
  svg {
    max-width: 100%;
    height: auto;
    display: block;
  }
`;

const QRCodeImage = styled.div`
  ${qr}
`;

const shadowOffsetA = 2;
const tailRadiusA = 1.1;
const tailRadiusB = 0.5;
const shadowColor = colors.white;
const initialBoxShadow = `
  box-shadow: -${shadowOffsetA}px 0px ${tailRadiusA}px 1.5px ${shadowColor},
  0 0 4px ${tailRadiusB}px ${shadowColor};
`;
const opacityMax = 1;
const opacityMin = 0.05;
const scaleMin = 4;
const scaleMax = 33;
const startingLeftPer = 55;

type EmptyQRCodeSizerProps = {
  size: number;
};

const EmptyQRCodeSizer = styled.div<EmptyQRCodeSizerProps>`
  width: ${({ size }) => size}px;
  max-width: 100%;
  position: relative;
  padding-top: 100%;
`;

type EmptyQRCodeProps = {
  border: boolean;
  isCentered: boolean;
  animated: boolean;
};

const EmptyQRCode = styled.div<EmptyQRCodeProps>`
  ${qr}
  border-color: ${({ theme }) => theme.c2Neutral};
  border-width: 1px;
  width: calc(100% - 2px);
  height: calc(100% - 2px);
  position: absolute;
  top: 0;
  left: 0;

  @keyframes circle {
    0% {
      top: 0%;
      left: ${startingLeftPer}%;
      box-shadow:
        0px -${shadowOffsetA}px 0px ${tailRadiusA / 2}px ${shadowColor},
        0 0 4px ${tailRadiusB}px ${shadowColor};
    }
    2% {
      top: 0%;
      left: 100%;
      box-shadow:
        0px -${shadowOffsetA}px 0px ${tailRadiusA / 2}px ${shadowColor},
        0 0 4px ${tailRadiusB}px ${shadowColor};
    }
    4% {
      top: 100%;
      left: 100%;
      box-shadow:
        0px -${shadowOffsetA}px 0px ${tailRadiusA / 2}px ${shadowColor},
        0 0 4px ${tailRadiusB}px ${shadowColor};
    }
    6% {
      top: 100%;
      left: 0%;
    }
    8% {
      top: 0%;
      left: 0%;
      box-shadow:
        0px ${shadowOffsetA}px 0px ${tailRadiusA / 2}px ${shadowColor},
        0 0 4px ${tailRadiusB}px ${shadowColor};
    }
    10% {
      top: 0;
      left: ${startingLeftPer - 0.001}%;
      ${initialBoxShadow};
    }
    100% {
      top: 0;
      left: ${startingLeftPer}%;
      ${initialBoxShadow};
    }
  }

  @keyframes pulse {
    0% {
      opacity: ${opacityMax};
      transform: scaleX(1);
    }
    10% {
      opacity: ${opacityMax * 0.3};
      transform: scaleX(1);
    }
    25% {
      opacity: ${opacityMin};
      transform: scaleX(${(scaleMax / 3) * 1});
    }
    45% {
      opacity: ${opacityMin};
      transform: scaleX(${scaleMin});
    }
    72% {
      opacity: ${(opacityMax / 3) * 1.3};
      transform: scaleX(${(scaleMax / 4) * 2});
    }
    93% {
      opacity: ${opacityMin};
      transform: scaleX(${scaleMin});
    }
    100% {
      opacity: ${opacityMax};
      transform: scaleX(${scaleMax});
    }
  }

  ${({ animated }) =>
    animated &&
    `
    &:before {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: ${startingLeftPer}%;
      transform: scaleX(1);
      transform-origin: 50% 0%;
      animation: circle 7s ease-out infinite,
        pulse 7s cubic-bezier(0.36, 0.11, 0.84, 0.52) infinite;
      ${initialBoxShadow}
    }
  `}

  & > * {
    ${absoluteCenter}
  }
`;

export const QRCodeLabel = styled.p`
  color: ${({ theme }) => theme.text};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
`;
