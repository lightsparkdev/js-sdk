import { css, Theme, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { bp } from "@lightsparkdev/ui/styles/breakpoints";
import { firstChild, pxToRems } from "@lightsparkdev/ui/styles/utils";

const HeadingTypes = ["h1", "h2", "h3", "h4"] as const;
type HeadingType = (typeof HeadingTypes)[number];

const defaultHeadingSizes: {
  [K in HeadingType]: { size: number; sizeSm: number };
} = {
  h1: {
    size: 32,
    sizeSm: 21,
  },
  h2: {
    size: 24,
    sizeSm: 18,
  },
  h3: {
    size: 21,
    sizeSm: 18,
  },
  h4: {
    size: 14,
    sizeSm: 14,
  },
};

/* The goal here is to constrain allowed spacings and avoid one-offs
   to ensure spacings are as consistent as possible throughout the UI. */
const marginPx = [0, 8, 12, 16, 24, 32, 40] as const;
type MarginPx = (typeof marginPx)[number];
const marginKeys = ["mt", "mb", "mtSm", "mbSm"] as const;
type MarginKey = (typeof marginKeys)[number];

const defaultHeadingMargins: {
  [K in HeadingType]: { [K in MarginKey]: MarginPx };
} = {
  h1: {
    mt: 24,
    mb: 24,
    mtSm: 24,
    mbSm: 24,
  },
  h2: {
    mt: 24,
    mb: 24,
    mtSm: 24,
    mbSm: 24,
  },
  h3: {
    mt: 24,
    mb: 24,
    mtSm: 24,
    mbSm: 24,
  },
  h4: {
    mt: 16,
    mb: 16,
    mtSm: 16,
    mbSm: 16,
  },
};

type StyledHeadingBaseProps = {
  mt: MarginPx;
  mb: MarginPx;
  mtSm: MarginPx;
  mbSm: MarginPx;
  light?: boolean;
};
type StyledHeadingProps = StyledHeadingBaseProps & {
  theme: Theme;
};

const baseHeading = ({ mt, mb, mtSm, mbSm, theme }: StyledHeadingProps) => css`
  line-height: 1.214em;

  margin-bottom: ${mb}px;
  margin-top: ${mt}px;

  ${bp.sm(`
    margin-top: ${mtSm}px;
    margin-bottom: ${mbSm}px;
  `)}
`;

type StyledHeadingType = ReturnType<typeof styled.h2<StyledHeadingProps>>;

/* Needs to be string at top of styles to avoid warnings: */
const firstChildStyles = firstChild(`margin-top: 0;`);

export const headings: { [K in HeadingType]: StyledHeadingType } = {
  h1: styled.h1<StyledHeadingProps>`
    ${(props) => baseHeading(props)}
    ${firstChildStyles}

    font-size: ${pxToRems(defaultHeadingSizes.h1.size)};
    font-weight: ${({ light }) => (light ? 400 : 800)}};
    ${bp.sm(`
      font-size: ${pxToRems(defaultHeadingSizes.h1.sizeSm)};
    `)}
  `,
  h2: styled.h2<StyledHeadingProps>`
    ${(props) => baseHeading(props)}
    ${firstChildStyles}

    font-size: ${pxToRems(defaultHeadingSizes.h2.size)};
    font-weight: ${({ light }) => (light ? 400 : 700)}};
    ${bp.sm(`
      font-size: ${pxToRems(defaultHeadingSizes.h2.sizeSm)};
    `)}
  `,
  h3: styled.h3<StyledHeadingProps>`
    ${(props) => baseHeading(props)}
    ${firstChildStyles}

    font-size: ${pxToRems(defaultHeadingSizes.h3.size)};
    font-weight: ${({ light }) => (light ? 400 : 700)}};
    ${bp.sm(`
      font-size: ${pxToRems(defaultHeadingSizes.h3.sizeSm)};
    `)}
  `,
  h4: styled.h4<StyledHeadingProps>`
    ${(props) => baseHeading(props)}
    ${firstChildStyles}

    font-size: ${pxToRems(defaultHeadingSizes.h4.size)};
    font-weight: ${({ light }) => (light ? 400 : 600)}};
    ${bp.sm(`
      font-size: ${pxToRems(defaultHeadingSizes.h4.sizeSm)};
    `)}
  `,
};

export type HeadingProps = Partial<StyledHeadingBaseProps> & {
  children?: React.ReactNode;
  type?: HeadingType;
  id?: string;
  m0?: boolean;
};

export function Heading({
  children,
  type = "h2",
  id,
  mt = defaultHeadingMargins[type].mt,
  mb = defaultHeadingMargins[type].mb,
  mtSm = defaultHeadingMargins[type].mtSm,
  mbSm = defaultHeadingMargins[type].mbSm,
  m0 = false,
  light = false,
}: HeadingProps) {
  const StyledHeading = headings[type];
  const theme = useTheme();
  return (
    <StyledHeading
      id={id}
      mt={m0 ? 0 : mt}
      mb={m0 ? 0 : mb}
      mtSm={m0 ? 0 : mtSm}
      mbSm={m0 ? 0 : mbSm}
      light={light}
      theme={theme}
    >
      {children}
    </StyledHeading>
  );
}

export function headingWithDefaults(defaultProps: HeadingProps) {
  return (props: HeadingProps) => <Heading {...defaultProps} {...props} />;
}
