import styled from "@emotion/styled";
import { z } from "../styles/z-index.js";
import {
  StatusIndicator,
  type StatusIndicatorProps,
} from "./StatusIndicator.js";

type GradientCardHeaderProps = {
  children: React.ReactNode;
  status?: StatusIndicatorProps | undefined;
  title?: string;
};

export function GradientCardHeader(props: GradientCardHeaderProps) {
  return (
    <CardHeaderWrapper>
      <Gradients />
      <div>
        {props.status && <StatusIndicator {...props.status} />}
        <CardHeaderTitle>{props.title}</CardHeaderTitle>
      </div>
      {props.children}
    </CardHeaderWrapper>
  );
}

const CardHeaderWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 32px 24px 32px;
  background-color: black;
  color: white;
  height: 264px;
`;

const CardHeaderTitle = styled.h3`
  font-size: 21px;
  font-weight: 800;
  color: white;
  margin: 0;
  z-index: ${z.headerContainer} - 1;
  position: relative;
`;

const Gradients = () => {
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <BackgroundGradients />
      <AccentGradients />
    </div>
  );
};

const BackgroundGradients = styled.div`
  &:before,
  &:after {
    content: "";
    position: absolute;
    margin: auto;
    filter: blur(38.5px);
  }
  &:before {
    z-index: ${z.walletActionPreviewTopGradient};
    right: -280px;
    top: -340px;
    width: 704px;
    height: 619px;
    background: radial-gradient(
      31.57% 32.06% at 50.1% 49.9%,
      #0032ff 0%,
      rgb(0 121 255 / 31%) 97%,
      rgba(0, 102, 255, 0.05) 100%
    );
  }
  &:after {
    z-index: ${z.walletActionPreviewTopGradient - 1};
    width: 636px;
    height: 552px;
    top: -400px;
    right: -280px;
    background: radial-gradient(
      31.57% 32.06% at 50.1% 49.9%,
      rgb(255 114 104) 0%,
      rgb(191 9 255 / 14%) 90%,
      rgb(191 9 255 / 5%) 100%
    );
  }
`;

const AccentGradients = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  right: 0;
  bottom: 0;
  z-index: ${z.walletActionPreviewTopGradient - 1};
  &:before,
  &:after {
    content: "";
    position: absolute;
    margin: auto;
    filter: blur(38.5px);
  }
  &:before {
    right: -70px;
    top: -100px;
    width: 169px;
    height: 323px;
    background: radial-gradient(
      31.57% 32.06% at 50.1% 49.9%,
      #ff8c28,
      rgba(191, 9, 255, 0.1) 100%
    );
  }
  &:after {
    right: -22px;
    top: -140px;
    width: 225px;
    height: 190px;
    background: radial-gradient(
      41.57% 62.06% at 53.1% 49.9%,
      rgb(255 119 0),
      rgb(255 106 9 / 55%) 100%
    );
  }
`;
