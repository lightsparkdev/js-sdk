// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { bp, useBreakpoints } from "../styles/breakpoints.js";
import {
  cardBorderRadiusPx,
  darkGradientBg,
  headingContentMarginPx,
  standardBorderRadius,
  standardCardShadow,
  standardContentInset,
} from "../styles/common.js";
import { themeOr } from "../styles/themes.js";
import { Heading } from "../styles/type.js";
import {
  flexCenter,
  overflowAutoWithoutScrollbars,
  size,
} from "../styles/utils.js";
import { z } from "../styles/z-index.js";
import { ButtonRowContainer } from "./ButtonRow.js";

type Props = {
  children?: React.ReactNode;
  title?: string | undefined;
  minContentHeight?: number;
  minContentWidth?: number;
  maxContentWidth?: number;
  rightContent?: React.ReactNode;
  preHeaderContent?: React.ReactNode;
  expandRight?: boolean;
  id?: string;
};

export function CardPage(props: Props) {
  const initiallyExpanded = useRef(Boolean(props.expandRight));

  // wait to animate until expandRight is changed at least once
  const [wasExpanded, setWasExpanded] = useState(Boolean(props.expandRight));
  const bp = useBreakpoints();
  const header = props.title ? (
    <CardPageHeader>
      <Heading type="h1" m0>
        {props.title}
      </Heading>
    </CardPageHeader>
  ) : null;

  useEffect(() => {
    if (props.expandRight) {
      setWasExpanded(true);
    }
  }, [props.expandRight]);

  return (
    <Fragment>
      <CardPageContainer
        id={props.id}
        bp={bp}
        hasRightContent={Boolean(props.rightContent)}
        wasExpanded={wasExpanded}
        expandRight={Boolean(props.expandRight)}
        minContentHeight={props.minContentHeight}
        initiallyExpanded={initiallyExpanded.current}
      >
        <div css={props.minContentWidth ? overflowAutoWithoutScrollbars : null}>
          <CardPageContent
            hasPreHeaderContent={Boolean(props.preHeaderContent)}
            minContentHeight={props.minContentHeight}
            maxContentWidth={props.maxContentWidth}
          >
            {props.preHeaderContent}
            {header}
            {props.children}
          </CardPageContent>
        </div>
        {props.rightContent && (
          <CardPageRightContent>
            <CardPageRightContentInner
              hasRightContent={Boolean(props.rightContent)}
            >
              {props.rightContent}
            </CardPageRightContentInner>
          </CardPageRightContent>
        )}
      </CardPageContainer>
    </Fragment>
  );
}

CardPage.defaultProps = {
  minContentHeight: undefined,
  minContentWidth: undefined,
  maxContentWidth: undefined,
};

export const CardPageFullContent = styled.div``;
export const CardPageFullWidth = styled.div``;

export const CardPageRightContentInner = styled.div<{
  hasRightContent: boolean;
}>`
  ${flexCenter}
  height: 100%;
  padding: 150px 25px;
  ${({ hasRightContent }) =>
    hasRightContent && `justify-content: space-evenly;`}
`;

const CardPageRightContent = styled.div`
  display: flex;
  position: relative;
  ${CardPageRightContentInner} {
    ${darkGradientBg};
    position: relative;
    height: calc(100% + 80px);
    margin-top: -40px;
    margin-bottom: -40px;
    margin-right: -40px;
    overflow: hidden;
    width: 100%;

    ${bp.minSm(`
      ${standardBorderRadius([0, cardBorderRadiusPx, cardBorderRadiusPx, 0])};
    `)}
  }
`;

const vCardPaddingPx = 40;
const expandTiming = `0.65s ease-in-out`;

const CardPageContainer = styled.div<{
  bp: typeof bp;
  minContentHeight?: number | undefined;
  hasRightContent: boolean;
  wasExpanded: boolean;
  expandRight: boolean;
  initiallyExpanded: boolean;
}>`
  ${standardContentInset.css}
  ${({ theme }) =>
    themeOr(`background-color: ${theme.bg}`, "transparent")({ theme })};
  position: relative;
  z-index: ${z.card};

  ${({ minContentHeight }) => `
    min-height: ${
      minContentHeight !== undefined && minContentHeight !== null
        ? `${minContentHeight}px`
        : "250px"
    };
  `}

  ${bp.sm(`
    width: 100% !important;
  `)}

  & > * {
    ${standardContentInset.css}
  }

  & ${CardPageFullContent}, & ${CardPageFullWidth} {
    ${bp.sm(`
      width: calc(100% + ${standardContentInset.smPx * 2}px);
      margin-left: -${standardContentInset.smPx}px;
    `)}

    ${bp.minSmMaxLg(`
      width: calc(100% + ${standardContentInset.minSmMaxLgPx * 2}px);
      margin-left: -${standardContentInset.minSmMaxLgPx}px;
    `)}

    ${bp.lg(`
      width: calc(100% + ${standardContentInset.lgPx * 2}px);
      margin-left: -${standardContentInset.lgPx}px;
    `)}
  }

  & ${CardPageFullContent} {
    & > * {
      padding-top: ${vCardPaddingPx}px;
      padding-bottom: ${vCardPaddingPx}px;
      ${bp.sm(`
        padding-top: 0;
        padding-bottom: 0;
      `)}
    }

    margin-top: -${vCardPaddingPx}px;
    ${bp.sm(`margin-top: 0;`)}
  }

  ${bp.minSm(`
    ${standardCardShadow.styles};
    padding: ${vCardPaddingPx}px 0;
    ${standardBorderRadius(cardBorderRadiusPx)}
  `)}

  &:not(:last-child) {
    margin-bottom: 30px;
  }

  @keyframes rightSideExpand {
    0% {
      width: 50%;
    }
    100% {
      width: 100%;
    }
  }

  @keyframes rightSideCollapse {
    0% {
      width: 100%;
    }
    100% {
      width: 50%;
    }
  }

  @keyframes leftSideCollapse {
    0% {
      width: 50%;
      height: auto;
      opacity: 1;
    }
    30% {
      opacity: 0;
    }
    100% {
      height: 0px;
      width: 0%;
    }
  }

  @keyframes leftSideExpand {
    0% {
      width: 0%;
      opacity: 0;
    }
    50% {
      opacity: 0;
    }
    100% {
      width: 50%;
      opacity: 1;
    }
  }

  ${({ hasRightContent }) =>
    hasRightContent &&
    `
    display: flex;
    & > * {
      width: 50%;
      ${bp.sm(`width: 100%;`)}

      &:first-of-type > * {
        ${bp.minSmMaxLg(`
          width: calc(100% - ${standardContentInset.minSmMaxLgPx * 2}px);
          margin-left: ${standardContentInset.minSmMaxLgPx}px;
        `)}
        ${bp.lg(`
          width: calc(100% - ${standardContentInset.lgPx * 3}px);
          margin-left: ${standardContentInset.lgPx}px;
        `)}
      }
    }
  `}

  & > :not(${CardPageRightContent}) {
    ${({ expandRight, wasExpanded, initiallyExpanded }) =>
      expandRight && wasExpanded
        ? bp.minSm(`
            width: 0%;
            height: 0px;
            ${
              initiallyExpanded
                ? ""
                : `animation: leftSideCollapse ${expandTiming};`
            }
            overflow: hidden;
            margin: 0%;
            opacity: 0;
          `)
        : wasExpanded
        ? bp.minSm(`
            width: 50%;
            animation: leftSideExpand ${expandTiming};
          `)
        : ""}
  }

  & > ${CardPageRightContent} {
    ${({ expandRight, wasExpanded, initiallyExpanded }) =>
      expandRight && wasExpanded
        ? bp.minSm(`
            width: 100%;
            ${
              initiallyExpanded
                ? ""
                : `animation: rightSideExpand ${expandTiming};`
            }
            margin: 0%;
            & > ${CardPageRightContentInner.toString()} {
              border-radius: ${cardBorderRadiusPx}px !important;
            }
          `)
        : wasExpanded
        ? bp.minSm(`
            width: 50%;
            animation: rightSideCollapse ${expandTiming};
          `)
        : ""}
  }
`;

type CardPageContentProps = {
  minContentHeight?: number | undefined;
  minContentWidth?: number | undefined;
  maxContentWidth?: number | undefined;
  hasPreHeaderContent: boolean;
};

export const CardPageSubtitle = styled.p`
  color: ${({ theme }) => theme.mcNeutral};
  font-size: ${size.px14};
  line-height: ${size.px18};
  font-weight: 600;
  margin: 0;
`;

const CardPageHeader = styled.div<{ headerMarginBottom?: number }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position: relative;

  & + *:not(${CardPageSubtitle}):not(${ButtonRowContainer}) {
    margin-top: ${headingContentMarginPx}px !important;
  }

  & + ${CardPageSubtitle} {
    margin-top: 5px;
  }

  & + ${ButtonRowContainer} {
    margin-top: 16px;
  }
`;

export const CardPageContent = styled.div<CardPageContentProps>`
  ${({
    maxContentWidth,
    minContentHeight,
    minContentWidth,
    hasPreHeaderContent,
  }) => `
    max-width: ${maxContentWidth ? `${maxContentWidth}px` : "initial"};
    min-width: ${minContentWidth ? `${minContentWidth}px` : "initial"};
    ${CardPageHeader.toString()} {
      margin-top: ${hasPreHeaderContent ? "25px" : "0"};
    }
    min-height: ${
      minContentHeight !== undefined && minContentHeight !== null
        ? `${minContentHeight}px`
        : "400px"
    };
  `}
`;
