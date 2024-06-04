import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Icon } from "./Icon/Icon.js";

type Props = {
  center?: boolean;
  size?: number;
  ml?: number;
};

const defaultProps = {
  size: 60,
  center: true,
  ml: 0,
};

export function Loading({
  center = defaultProps.center,
  size = defaultProps.size,
  ml = defaultProps.ml,
}: Props) {
  const theme = useTheme();
  return (
    <LoadingWrapper center={center} ml={ml}>
      <Rotate>
        <Icon name={theme.loading} width={size} />
      </Rotate>
    </LoadingWrapper>
  );
}

Loading.defaultProps = defaultProps;

export const LoadingWrapper = styled.div<{
  center: boolean;
  ml: number;
}>`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  margin-left: ${({ ml }) => ml}px;

  ${({ center }) =>
    center &&
    `
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: 0 !important;
  `}
`;

const Rotate = styled.div`
  display: inline-flex;
  animation: rotate 0.5s linear infinite;

  @keyframes rotate {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
