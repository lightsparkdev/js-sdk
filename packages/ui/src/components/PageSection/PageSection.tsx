// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import React, { Fragment } from "react";
import { bp } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import {
  standardBorderRadius,
  standardLineHeightEms,
} from "../../styles/common.js";
import { standardBorderColor } from "../../styles/fields.js";
import { Heading, headingWithDefaults } from "../../styles/type.js";
import { select } from "../../utils/emotion.js";
import { toReactNodes } from "../../utils/toReactNodes.js";
import { Badge, badgeVPadding } from "../Badge.js";
import { Dropdown } from "../Dropdown.js";
import { Icon } from "../Icon.js";
import { Loading } from "../Loading.js";
import { TextButton } from "../TextButton.js";
import { UnstyledButton } from "../UnstyledButton.js";
import { pageSectionScrollOffset } from "./constants.js";

export type PageSectionProps = {
  children?: React.ReactNode;
  title?: string | undefined;
  sectionId: string;
  headerOffset?: number;
};

export function PageSection({
  children,
  title,
  sectionId,
  headerOffset = 0,
}: PageSectionProps) {
  return (
    <StyledPageSection scrollMarginTop={headerOffset + pageSectionScrollOffset}>
      {title ? (
        <Heading type="h3" id={sectionId} mt={0} mb={40}>
          {title}
        </Heading>
      ) : null}
      {children}
    </StyledPageSection>
  );
}

const StyledPageSection = styled.div<{ scrollMarginTop: number }>`
  &:first-of-type {
    ${bp.minSm(`
      margin-top: 4px;
    `)}
  }

  &:not(:first-of-type) {
    margin-top: 72px;
  }

  h3,
  h4 {
    scroll-margin-top: ${({ scrollMarginTop }) => scrollMarginTop}px !important;
  }
`;

export const PageSectionSubheading = headingWithDefaults({
  type: "h4",
  mb: 32,
});

type PageSectionBoxActionColumnProps = {
  label: string;
  value?: string | null | undefined;
  valueId?: string | undefined;
};

export const PageSectionBoxActionColumn = ({
  label,
  value,
  valueId,
}: PageSectionBoxActionColumnProps) => (
  <StyledPageSectionBoxActionColumn>
    <PageSectionBoxActionColumnLabel>{label}</PageSectionBoxActionColumnLabel>
    {value ? (
      <PageSectionBoxActionColumnValue id={valueId}>
        {value}
      </PageSectionBoxActionColumnValue>
    ) : (
      <PageSectionBoxActionColumnNoValue>
        Unknown
      </PageSectionBoxActionColumnNoValue>
    )}
  </StyledPageSectionBoxActionColumn>
);

const StyledPageSectionBoxActionColumn = styled.div``;

const PageSectionBoxActionColumnLabel = styled.div`
  color: ${colors.gray40};
  font-weight: 500;
  margin: 0;
`;

const PageSectionBoxActionColumnValue = styled.div`
  font-weight: 700;
  margin-bottom: 0;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PageSectionBoxActionColumnNoValue = styled(
  PageSectionBoxActionColumnValue,
)`
  color: ${colors.gray80};
  font-style: italic;
`;

type PageSectionBoxActionProps<RoutesType extends string> = {
  label?: string | undefined;
  to?: RoutesType | undefined;
  toParams?: Record<string, string> | undefined;
  onClick?: (() => void) | undefined;
  isDelete?: boolean;
  loading?: boolean;
  dropdownItems?:
    | {
        label: string;
        to?: RoutesType;
        onClick?: () => void;
      }[]
    | undefined;
  icon?:
    | {
        name: string;
        onClick: () => void;
      }
    | undefined
    | null;
};

function PageSectionBoxAction<RoutesType extends string>({
  dropdownItems,
  icon,
  isDelete = false,
  label,
  loading = false,
  onClick,
  to,
  toParams,
}: PageSectionBoxActionProps<RoutesType>) {
  const theme = useTheme();
  return loading ? (
    <div>
      <Loading size={12} center={false} />
    </div>
  ) : icon ? (
    <div>
      <UnstyledButton onClick={icon.onClick}>
        <Icon name={icon.name} width={12} color={theme.mcNeutral} />
      </UnstyledButton>
    </div>
  ) : dropdownItems ? (
    <Dropdown
      button={{
        getContent: () => <Icon name="DotGrid1x3Horizontal" width={16} />,
      }}
      dropdownItems={dropdownItems}
    />
  ) : isDelete ? (
    <UnstyledButton css={{ color: theme.mcNeutral }} onClick={onClick}>
      Delete
    </UnstyledButton>
  ) : label ? (
    /* Extra div for proper default alignment inside flex contexts */
    <div>
      <TextButton<RoutesType>
        /* actionIcon may be null to explicitly hide or undefined for default TextButton icon: */
        leftIcon={icon}
        text={label}
        to={to}
        toParams={toParams}
        onClick={onClick}
      />
    </div>
  ) : null;
}

type PageSectionBoxActionRowProps<RoutesType extends string> = {
  action?: PageSectionBoxActionProps<RoutesType> | undefined;
  title?: string;
  titleBadge?: string | undefined;
  description?: string;
  separator?: boolean;
  children?: React.ReactNode;
  smFlexColumn?: boolean;
};

export const PageSectionBoxActionRow = <RoutesType extends string>({
  title,
  titleBadge,
  description,
  separator,
  children,
  action,
  smFlexColumn = true,
}: PageSectionBoxActionRowProps<RoutesType>) => {
  return (
    <Fragment>
      <SPageSectionBoxActionRow
        separator={Boolean(separator)}
        smFlexColumn={Boolean(smFlexColumn)}
      >
        {title ? (
          <div>
            <PageSectionBoxTitle>
              {title}
              {titleBadge ? <Badge text={titleBadge} ml={4} /> : null}
            </PageSectionBoxTitle>
            {description ? (
              <PageSectionBoxDescription>
                {description}
              </PageSectionBoxDescription>
            ) : null}
          </div>
        ) : null}
        {children}
        <PageSectionBoxAction {...action} />
      </SPageSectionBoxActionRow>
    </Fragment>
  );
};

const SPageSectionBoxActionRow = styled.div<{
  separator: boolean;
  smFlexColumn: boolean;
}>`
  display: flex;
  gap: 12px;
  align-items: top;
  flex-direction: row;
  justify-content: space-between;

  & + & {
    margin-top: 32px;
  }

  ${({ smFlexColumn }) =>
    smFlexColumn ? bp.sm(`flex-direction: column;`) : ""}

  &:has(> ${StyledPageSectionBoxActionColumn}) {
    ${select(StyledPageSectionBoxActionColumn)} {
      width: 150px;
    }
    ${bp.maxMd(`
      ${select(StyledPageSectionBoxActionColumn)} {
        width: auto;
      }
    `)}
  }

  ${({ separator, theme }) =>
    separator &&
    `
      border-top: 1px solid;
      ${standardBorderColor({ theme }).styles};
      padding-top: 32px;
    `}
`;

export const PageSectionBoxColumn = styled.div``;
export const PageSectionBoxRow = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(215px, 1fr)
  ); /* This creates as many columns as can fit, each at least 150px wide */
`;

type PageSectionBoxProps<RoutesType extends string> = {
  action?: PageSectionBoxActionProps<RoutesType> | undefined;
  description?: string;
  children?: React.ReactNode;
};

export function PageSectionBox<RoutesType extends string>({
  action,
  description,
  children,
}: PageSectionBoxProps<RoutesType>) {
  return (
    <StyledPageSectionBox>
      {description && (
        <PageSectionBoxDescription>
          {toReactNodes(description)}
        </PageSectionBoxDescription>
      )}
      {children}
      {action?.label ? (
        <div css={{ marginTop: "12px" }}>
          <PageSectionBoxAction {...action} />
        </div>
      ) : null}
    </StyledPageSectionBox>
  );
}

export const StyledPageSectionBox = styled.div`
  & + & {
    margin-top: 32px;
  }

  & > ${PageSectionBoxRow}, & {
    border: 1px solid;
    ${standardBorderColor}
  }

  ${standardBorderRadius(8)}
  padding: 16px;

  /* PageSectionBoxRow and PageSectionBoxColumn manage their own borders: */
  &:has(> ${PageSectionBoxRow}) {
    border: none;
    padding: 0;
    ${standardBorderRadius(0)}
  }

  & > ${PageSectionBoxRow} {
    &:first-of-type {
      ${standardBorderRadius([12, 12, 0, 0])}
    }

    &:last-of-type {
      ${standardBorderRadius([0, 0, 12, 12])}
    }

    &:only-of-type {
      ${standardBorderRadius(12)}
    }

    &:not(:last-of-type) {
      border-bottom: 0;
    }

    ${PageSectionBoxColumn} {
      padding: 32px;
      ${bp.sm(`padding: 16px;`)}
      &:not(:first-of-type) {
        border-left: solid 1px;
        ${standardBorderColor}
      }
    }

    ${({ theme }) =>
      bp.maxMd(`
        grid-template-columns: none;
        ${select(PageSectionBoxColumn)} {
          &:not(:first-of-type) {
            border-left: 0 !important;
            border-top: solid 1px;
            ${standardBorderColor({ theme }).styles};
          }
        }
      `)}
  }
`;

export const PageSectionBoxTitle = styled.div<{ lg?: boolean }>`
  display: flex;
  align-items: center;
  font-size: ${({ lg }) => (lg ? 14 : 12)}px;
  font-weight: 600;
  line-height: ${({ lg }) =>
    standardLineHeightEms * (lg ? 14 : 12) + badgeVPadding * 2}px;
`;

export const PageSectionBoxDescription = styled.div`
  color: ${({ theme }) => theme.mcNeutral};
  ${PageSectionBoxTitle} + & {
    margin-top: 6px;
  }
`;

const gapPx = 24;
export const PageSectionRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${gapPx}px;

  ${bp.minSm(`
    flex-direction: row;
  `)}

  margin-top: 40px;
  &:first-of-type {
    margin-top: 0;
  }
`;

export const PageSectionRowSubSection = styled.div`
  box-sizing: border-box;
  width: 100%;

  &:first-of-type {
    margin-right: 0px;
  }

  &:last-of-type {
    margin-left: 0px;
    margin-top: ${gapPx}px;
  }

  ${StyledPageSectionBox} + ${StyledPageSectionBox} {
    /* Less margin for boxes within a single SubSection: */
    margin-top: 16px;
  }

  ${bp.minSm(`
    width: calc(50% - ${gapPx / 2}px);

    &:last-of-type {
      margin-top: 0;
    }
  `)}
`;
