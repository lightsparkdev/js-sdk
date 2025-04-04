import type { Theme } from "@emotion/react";
import { css, useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import type { ComponentProps, FormEvent, ReactNode } from "react";
import { useCallback } from "react";
import { Link } from "../../router.js";
import { bp } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import {
  mcBold,
  standardBorderRadius,
  standardCardShadow,
  standardCardShadowHard,
  standardContentInset,
} from "../../styles/common.js";
import {
  formButtonTopMarginStyle,
  inputSpacingPx,
} from "../../styles/fields.js";
import {
  type CardFormBackgroundColor,
  type CardFormBorderColor,
  type CardFormBorderRadius,
  type CardFormBorderWidth,
  type CardFormKind,
  type CardFormPaddingBottom,
  type CardFormPaddingTop,
  type CardFormPaddingX,
  type CardFormShadow,
  type CardFormTextAlign,
  type CardFormThemeKey,
} from "../../styles/themeDefaults/cardForm.js";
import { getColor } from "../../styles/themes.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { type TokenSizeKey } from "../../styles/tokens/typography.js";
import { pxToRems } from "../../styles/utils.js";
import { type NewRoutesType } from "../../types/index.js";
import { select } from "../../utils/emotion.js";
import { icon } from "../../utils/toReactNodes/nodes.js";
import { toReactNodesWithTypographyMap } from "../../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { ButtonSelector } from "../Button.js";
import { StyledButtonRowButton } from "../ButtonRow.js";
import { Checkbox, type CheckboxProps } from "../Checkbox.js";
import { ClipboardTextField } from "../ClipboardTextField.js";
import { StyledFileInput } from "../FileInput.js";
import { LoadingWrapper } from "../Loading.js";
import { StyledSelect } from "../Select.js";
import { type TextIconAligner } from "../TextIconAligner.js";
import { TextInputHalfRow } from "../TextInput.js";
import { ToggleContainer } from "../Toggle.js";
import { Headline } from "../typography/Headline.js";

type BelowCardFormContentGap = 0 | 16;

type CardFormProps = {
  children?: ReactNode;
  disabled?: boolean;
  topContent?: ReactNode;
  title?: string;
  titleSize?: TokenSizeKey;
  titleRightIcon?:
    | ComponentProps<typeof TextIconAligner>["rightIcon"]
    | undefined;
  afterTitleMargin?: 24 | 40 | undefined;
  description?: ToReactNodesArgs | undefined;
  full?: boolean;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  hasChildForm?: boolean;
  wide?: boolean;
  kind?: CardFormKind;
  textAlign?: CardFormTextAlign;
  shadow?: CardFormShadow;
  paddingTop?: CardFormPaddingTop | undefined;
  paddingBottom?: CardFormPaddingBottom | undefined;
  belowFormContent?: ToReactNodesArgs | undefined;
  belowFormContentGap?: BelowCardFormContentGap | undefined;
  forceMarginAfterSubtitle?: boolean;
};

type ResolvePropsArgs = {
  kind: CardFormKind;
  shadow?: CardFormShadow | undefined;
  textAlign?: CardFormTextAlign | undefined;
  paddingTop?: CardFormPaddingTop | undefined;
  paddingBottom?: CardFormPaddingBottom | undefined;
};

function resolveProps(args: ResolvePropsArgs, theme: Theme) {
  const paddingTop = resolveCardFormProp(
    args.paddingTop,
    args.kind,
    "paddingTop",
    theme,
  );
  const paddingBottom = resolveCardFormProp(
    args.paddingBottom,
    args.kind,
    "paddingBottom",
    theme,
  );
  const paddingX = resolveCardFormProp(undefined, args.kind, "paddingX", theme);
  const textAlign = resolveCardFormProp(
    args.textAlign,
    args.kind,
    "textAlign",
    theme,
  );
  const shadow = resolveCardFormProp(args.shadow, args.kind, "shadow", theme);
  const borderRadius = resolveCardFormProp(
    undefined,
    args.kind,
    "borderRadius",
    theme,
  );
  const borderWidth = resolveCardFormProp(
    undefined,
    args.kind,
    "borderWidth",
    theme,
  );
  const borderColor = resolveCardFormProp(
    undefined,
    args.kind,
    "borderColor",
    theme,
  );
  const backgroundColor = resolveCardFormProp(
    undefined,
    args.kind,
    "backgroundColor",
    theme,
  );
  const smBackgroundColor = resolveCardFormProp(
    undefined,
    args.kind,
    "smBackgroundColor",
    theme,
  );
  const smBorderWidth = resolveCardFormProp(
    undefined,
    args.kind,
    "smBorderWidth",
    theme,
  );
  const defaultDescriptionTypographyMap = resolveCardFormProp(
    undefined,
    args.kind,
    "defaultDescriptionTypographyMap",
    theme,
  );

  const props = {
    paddingTop,
    paddingBottom,
    paddingX,
    shadow,
    borderRadius,
    borderColor,
    borderWidth,
    textAlign,
    backgroundColor,
    smBackgroundColor,
    smBorderWidth,
    defaultDescriptionTypographyMap,
  };

  return props;
}

export function CardForm({
  children,
  disabled,
  topContent = null,
  title,
  titleSize = "Large",
  description,
  full = false,
  onSubmit,
  titleRightIcon,
  /* In some cases eg third party libs we can't avoid the need for child forms, so the
     top level element must be a div. Avoid using this prop generally except when necessary: */
  hasChildForm,
  wide = false,
  kind = "primary",
  shadow: shadowProp,
  textAlign: textAlignProp,
  paddingTop: paddingTopProp,
  paddingBottom: paddingBottomProp,
  belowFormContent,
  belowFormContentGap = 0,
  forceMarginAfterSubtitle = true,
  afterTitleMargin = 40,
}: CardFormProps) {
  const theme = useTheme();
  const {
    paddingTop,
    paddingBottom,
    paddingX,
    shadow,
    borderRadius,
    borderWidth,
    borderColor,
    textAlign,
    backgroundColor,
    smBackgroundColor,
    smBorderWidth,
    defaultDescriptionTypographyMap,
  } = resolveProps(
    {
      kind,
      textAlign: textAlignProp,
      shadow: shadowProp,
      paddingTop: paddingTopProp,
      paddingBottom: paddingBottomProp,
    },
    theme,
  );

  const onSubmitForm = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (disabled) {
        return;
      }
      if (onSubmit) {
        onSubmit(e);
      }
    },
    [onSubmit, disabled],
  );

  const formattedDescription = description
    ? toReactNodesWithTypographyMap(
        description,
        defaultDescriptionTypographyMap,
        false,
      )
    : null;

  const belowFormContentNodes = belowFormContent
    ? toReactNodes(belowFormContent)
    : null;

  const CardFormContentTarget = full ? CardFormContentFull : CardFormContent;

  const content = (
    <CardFormContentTarget>
      {topContent}
      {title && (
        <CardHeadline
          hasTopContent={Boolean(topContent)}
          afterTitleMargin={afterTitleMargin}
        >
          <Headline
            content={[
              title,
              ...(titleRightIcon
                ? [icon({ name: titleRightIcon.name, ml: 4 })]
                : []),
            ]}
            display="inline-flex"
            size={titleSize}
          />
        </CardHeadline>
      )}
      {formattedDescription && (
        <CardFormSubtitle>{formattedDescription}</CardFormSubtitle>
      )}
      {children}
    </CardFormContentTarget>
  );

  const commonProps = {
    wide,
    shadow,
    borderRadius,
    borderWidth,
    borderColor,
    textAlign,
    paddingX,
    paddingTop,
    paddingBottom,
    backgroundColor,
    smBackgroundColor,
    smBorderWidth,
    forceMarginAfterSubtitle,
  };

  const Container = full ? CardFormContentFull : CardFormContainer;

  return (
    <Container>
      {hasChildForm ? (
        <StyledCardFormDiv {...commonProps}>{content}</StyledCardFormDiv>
      ) : (
        <StyledCardForm
          onSubmit={onSubmitForm}
          noValidate
          {...commonProps}
          forceMarginAfterSubtitle={forceMarginAfterSubtitle}
        >
          {content}
        </StyledCardForm>
      )}
      <BelowCardFormContent gap={belowFormContentGap}>
        {belowFormContentNodes}
      </BelowCardFormContent>
    </Container>
  );
}

const CardFormContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardFormContent = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
`;

const CardFormContentFull = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
  height: 100%;
`;

type BelowCardFormContentProps = {
  gap: BelowCardFormContentGap;
};

const BelowCardFormContent = styled.div<BelowCardFormContentProps>`
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ gap }) => gap}px;
  margin-top: ${Spacing.px.xl};
  margin-bottom: ${Spacing.px.xl};
`;

const CardFormSubtitle = styled.div`
  padding: 0 ${Spacing.px.xs};
`;

export const CardFormButtonRow = styled.div<{
  justify?: "left" | "center" | undefined;
}>`
  display: flex;
  justify-content: ${({ justify }) =>
    /* Default left */
    justify === "center" ? "center" : "left"};
  margin-top: 32px;
  ${ButtonSelector("* + ")} {
    margin-left: 10px;
  }

  &:not(:last-child) {
    margin-bottom: 32px;
  }
`;

const fieldLabelMarginPx = 12;
export const CardFormFieldLabel = styled.label`
  display: block;
  margin-top: ${inputSpacingPx}px;
  color: ${({ theme }) => theme.text};
  font-size: ${pxToRems(14)};
  font-weight: 700;
  & + * {
    margin-top: ${fieldLabelMarginPx}px;
  }
`;

export const CardFormNearButtonColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: ${Spacing.px.sm};
`;

type CardFormDataFieldValueProps = Omit<
  ComponentProps<typeof ClipboardTextField>,
  "value"
> & {
  text: string;
};

export function CardFormDataFieldValue({ text }: CardFormDataFieldValueProps) {
  return (
    <StyledCardFormDataFieldValue>
      <ClipboardTextField value={text} icon iconSide="right" />
    </StyledCardFormDataFieldValue>
  );
}

const StyledCardFormDataFieldValue = styled.div`
  margin-top: 4px;
  color: ${({ theme }) => theme.mcNeutral};
`;

export const CardFormFullWidth = styled.div``;
export const CardFormFullTopContent = styled.div`
  ${bp.minSm(`
    border-radius: 16px 16px 0 0;
    overflow: hidden;
  `)}
`;

const StyledCardFormCheckboxParagraph = styled.div`
  display: flex;
  color: ${({ theme }) => theme.mcNeutral};
`;

type CardFormInsetProps = {
  wide: boolean;
  paddingX: number;
  paddingTop: number;
  paddingBottom: number;
};

const formInset = ({
  wide,
  paddingX,
  paddingTop,
  paddingBottom,
}: CardFormInsetProps) => css`
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  padding-right: ${paddingX}px;
  padding-left: ${paddingX}px;
  padding-top: ${paddingTop}px;
  padding-bottom: ${paddingBottom}px;

  ${bp.minSm(`
    width: ${wide ? 700 : 408}px;
  `)}

  ${bp.sm(`
    padding: 0;
  `)}

  ${standardContentInset.smCSS}

  & ${CardFormFullWidth}, & ${CardFormFullTopContent} {
    ${bp.sm(`
      width: calc(100% + ${standardContentInset.smPx * 2}px);
      margin-left: -${standardContentInset.smPx}px;
    `)}

    ${bp.minSm(`
      width: calc(100% + ${paddingX * 2}px);
      margin-left: -${paddingX}px;
    `)}
  }

  & ${CardFormFullTopContent} {
    ${bp.minSm(`
      margin-top: -${paddingTop}px;
    `)}
  }
`;

type StyledCardFormStyleProps = {
  wide: boolean;
  shadow: CardFormShadow;
  borderRadius: CardFormBorderRadius;
  borderWidth: CardFormBorderWidth;
  borderColor: CardFormBorderColor;
  textAlign: CardFormTextAlign;
  paddingX: CardFormPaddingX;
  paddingTop: CardFormPaddingTop;
  paddingBottom: CardFormPaddingBottom;
  backgroundColor: CardFormBackgroundColor;
  smBackgroundColor: CardFormBackgroundColor;
  smBorderWidth: CardFormBorderWidth;
  forceMarginAfterSubtitle: boolean | undefined;
};

const StyledCardFormStyle = ({
  theme,
  wide,
  shadow,
  borderRadius,
  borderWidth,
  borderColor,
  textAlign,
  paddingX,
  paddingTop,
  paddingBottom,
  backgroundColor,
  smBackgroundColor,
  smBorderWidth,
  forceMarginAfterSubtitle = true,
}: StyledCardFormStyleProps & { theme: Theme }) => {
  return css`
    ${formInset({ wide, paddingX, paddingTop, paddingBottom })}
    ${shadow === "soft"
      ? standardCardShadow
      : shadow === "hard"
      ? standardCardShadowHard
      : ""}

    position: relative;
    height: 100%;
    border-style: solid;
    border-width: ${borderWidth}px;
    border-color: ${getColor(theme, borderColor)};
    background-color: ${getColor(theme, backgroundColor)};

    ${bp.sm(`
      box-shadow: none;
      background-color: ${getColor(theme, smBackgroundColor)};
      border-width: ${smBorderWidth}px;
    `)}

    ${bp.minSm(`
      border-radius: ${borderRadius}px;
    `)}

    ${CardHeadline}, ${CardFormSubtitle} {
      text-align: ${textAlign};
    }

    ${forceMarginAfterSubtitle
      ? `${CardFormSubtitle.toString()} + * {
      margin-top: 40px !important;
    }`
      : ""}

    ${CardFormButtonRow}, ${StyledButtonRowButton} {
      ${ButtonSelector()} {
        margin-top: 0;
      }
    }

    ${StyledSelect}, ${ToggleContainer} {
      margin-top: ${inputSpacingPx}px;
    }

    ${CardFormFieldLabel} {
      margin-top: ${inputSpacingPx}px;

      & + ${StyledSelect} {
        margin-top: ${fieldLabelMarginPx}px;
      }
    }

    ${TextInputHalfRow} > ${StyledSelect} {
      margin-top: 0;
    }

    ${LoadingWrapper} {
      margin: 32px 0;
      * + * {
        margin-top: 0;
      }
    }

    ${ButtonSelector()} ${LoadingWrapper} {
      margin: 0;
    }

    ${StyledFileInput} {
      margin-top: 16px;
    }

    ${CardFormContent} {
      & > ${StyledCardFormCheckboxParagraph} {
        margin-top: 24px;
      }

      & > ${ButtonSelector()}, & > ${select(CardFormNearButtonColumn)} {
        ${formButtonTopMarginStyle}
      }
    }
  `;
};

const StyledCardForm =
  styled.form<StyledCardFormStyleProps>(StyledCardFormStyle);

const StyledCardFormDiv =
  styled.div<StyledCardFormStyleProps>(StyledCardFormStyle);

const CardHeadline = styled.div<{
  hasTopContent: boolean;
  afterTitleMargin: number;
}>`
  padding: 0 ${Spacing.px.xs};

  ${({ hasTopContent }) => (hasTopContent ? "margin-top: 24px;" : "")}

  & + *:not(${CardFormSubtitle.toString()}) {
    margin-top: ${({ afterTitleMargin }) => afterTitleMargin}px;
  }

  & + ${CardFormSubtitle} {
    margin-top: 12px;
  }
`;

type CardFormTextWithLinkProps = {
  text: string;
  toText: string;
  to: NewRoutesType;
};

export function CardFormTextWithLink({
  text,
  toText,
  to,
}: CardFormTextWithLinkProps) {
  return (
    <div css={{ marginTop: "16px", fontWeight: "600" }}>
      <span css={mcBold}>{text}</span> <Link to={to}>{toText}</Link>
    </div>
  );
}

type CardFormCheckboxParagraphProps = CheckboxProps & {
  children: ReactNode;
};

export function CardFormCheckboxParagraph({
  children,
  onChange,
  checked,
}: CardFormCheckboxParagraphProps) {
  return (
    <StyledCardFormCheckboxParagraph>
      <Checkbox checked={checked} onChange={onChange} alignItems="flex-start" />
      <CardFormCheckboxParagraphText onClick={() => onChange(!checked)}>
        {children}
      </CardFormCheckboxParagraphText>
    </StyledCardFormCheckboxParagraph>
  );
}

const CardFormCheckboxParagraphText = styled.span`
  margin-left: 12px;
  max-width: 350px;
  cursor: pointer;
`;

type CardFormOptionProps = {
  label: string;
  onClick: () => void;
  description?: string;
  selected?: boolean;
};

export const CardFormOption = ({
  label,
  description,
  onClick,
  selected = false,
}: CardFormOptionProps) => (
  <StyledCardFormOption onClick={onClick} selected={selected}>
    <CardFormOptionLabel>{label}</CardFormOptionLabel>
    {description ? (
      <CardFormOptionDescription>{description}</CardFormOptionDescription>
    ) : null}
  </StyledCardFormOption>
);

const StyledCardFormOption = styled.div<{ selected: boolean }>`
  border: ${({ theme, selected }) =>
    `${selected ? `2px solid ${theme.info}` : `1px solid ${theme.c1Neutral}`}`};
  ${standardBorderRadius(8)}
  cursor: pointer;
  margin-top: 10px;
  padding: ${({ selected }) => (selected ? "15px" : "16px")};
`;

const CardFormOptionLabel = styled.div`
  font-weight: bold;
`;

const CardFormOptionDescription = styled.p`
  color: ${colors.gray40};
  margin: 6px 0 0;
`;

function resolveCardFormProp<T, K extends CardFormThemeKey>(
  prop: T,
  kind: CardFormKind,
  defaultKey: K,
  theme: Theme,
) {
  return (
    /** props may be unset for a given kind but theme defaults always exist,
     * so this will always resolve a value: */
    prop ||
    theme.cardForm.kinds[kind]?.[defaultKey] ||
    theme.cardForm[defaultKey]
  );
}
