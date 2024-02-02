import styled from "@emotion/styled";
import { bp } from "../styles/breakpoints.js";
import { standardContentInset } from "../styles/common.js";
import { overflowAutoWithoutScrollbars } from "../styles/utils.js";
import { Button, type ButtonProps } from "./Button.js";

export type ButtonRowProps<RoutesType extends string> = {
  buttons: (ButtonProps<RoutesType> | "divider")[];
  smSticky?: boolean;
  className?: string;
  headerHeight?: number;
};

export function ButtonRow<RoutesType extends string>({
  buttons,
  className,
  smSticky = true,
  headerHeight = 0,
}: ButtonRowProps<RoutesType>) {
  return (
    <ButtonRowContainer smSticky={smSticky} headerHeight={headerHeight}>
      <StyledButtonRow className={className}>
        {buttons.map((button, idx) =>
          button === "divider" ? (
            <ButtonRowDivider key={idx} />
          ) : (
            <Button<RoutesType> key={idx} {...button} />
          ),
        )}
      </StyledButtonRow>
    </ButtonRowContainer>
  );
}

export const ButtonRowContainer = styled.div<{
  smSticky: boolean;
  headerHeight: number;
}>`
  max-width: 100%;
  ${({ theme }) => bp.sm(`background: ${theme.bg}`)}
  ${({ headerHeight, smSticky }) =>
    bp.sm(
      `
        ${
          smSticky
            ? `
            display: block;
            position: sticky;
            top: ${headerHeight}px;
            margin-top: 24px;
            margin-left: -${standardContentInset.smPx}px;
            width: calc(100% + ${standardContentInset.smPx * 2}px);
            max-width: calc(100% + ${standardContentInset.smPx * 2}px);
            z-index: 2;`
            : `position: relative;`
        }
        z-index: 2;
        &:before {
          content: "";
          box-shadow: 0px 0px 9px 3px rgba(0, 0, 0, 0.09);
          height: 1px;
          position: absolute;
          background: black;
          bottom: 1px;
          width: 100%;
          z-index: 0;
        }
      `,
    )}
`;

const ButtonRowDivider = styled.div`
  border-left: 1px #d9d9d9 solid;
  margin-left: 16px;
  padding-left: 16px;
`;

export const StyledButtonRow = styled.div`
  ${overflowAutoWithoutScrollbars}
  background: ${({ theme }) => theme.bg};
  display: flex;
  position: relative;
  z-index: 1;

  & button:not(:first-of-type),
  & a:not(:first-of-type) {
    margin-left: 8px;
  }

  & ${ButtonRowDivider} + button,
  & ${ButtonRowDivider} + a {
    margin-left: 0;
  }

  ${bp.sm(`
    padding: 12px;
  `)}
`;
