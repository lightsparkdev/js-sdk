import type { Theme } from "@emotion/react";
import { css } from "@emotion/react";
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
import { pxToRems } from "../../styles/utils.js";
import { type NewRoutesType } from "../../types/index.js";
import { icon } from "../../utils/toReactNodes/nodes.js";
import { toReactNodesWithTypographyMap } from "../../utils/toReactNodes/setReactNodesTypography.js";
import {
  toReactNodes,
  type ToReactNodesArgs,
} from "../../utils/toReactNodes/toReactNodes.js";
import { ButtonSelector } from "../Button.js";
import { StyledButtonRow } from "../ButtonRow.js";
import { Checkbox, type CheckboxProps } from "../Checkbox.js";
import { ClipboardTextField } from "../ClipboardTextField.js";
import { StyledFileInput } from "../FileInput.js";
import { LoadingWrapper } from "../Loading.js";
import { StyledSelect } from "../Select.js";
import { type TextIconAligner } from "../TextIconAligner.js";
import { TextInputHalfRow } from "../TextInput.js";
import { ToggleContainer } from "../Toggle.js";
import { Headline } from "../typography/Headline.js";

type CardFormKind = "primary" | "secondary" | "tertiary";
type CardFormBorderRadius = 8 | 24;
type CardFormShadow = "soft" | "hard" | "none";
type CardFormTextAlign = "center" | "left";

const descriptionTypography = {
  primary: {
    text: {
      type: "Body Strong",
      size: "Small",
      color: "mcNeutral",
    },
    link: {
      type: "Body Strong",
      size: "Small",
      color: "text",
    },
  },
  secondary: {
    text: {
      type: "Body Strong",
      size: "Small",
      color: "mcNeutral",
    },
    link: {
      type: "Body Strong",
      size: "Small",
      color: "text",
    },
  },
  tertiary: {
    text: {
      type: "Body",
      size: "Large",
      color: "mcNeutral",
    },
    link: {
      type: "Body",
      size: "Large",
      color: "text",
    },
  },
} as const;

type CardFormProps = {
  children?: ReactNode;
  disabled?: boolean;
  topContent?: ReactNode;
  title?: string;
  titleRightIcon?:
    | ComponentProps<typeof TextIconAligner>["rightIcon"]
    | undefined;
  description?: ToReactNodesArgs | undefined;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  hasChildForm?: boolean;
  wide?: boolean;
  kind?: "primary" | "secondary" | "tertiary";
  textAlign?: CardFormTextAlign;
  belowFormContent?: ToReactNodesArgs | undefined;
};

type ResolvePropsArgs = {
  kind: CardFormKind;
  textAlign?: CardFormTextAlign | undefined;
};

function resolveProps(args: ResolvePropsArgs) {
  const isPrimary = args.kind === "primary";
  const isSecondary = args.kind === "secondary";
  const isTertiary = args.kind === "tertiary";

  const paddingY = isPrimary || isTertiary ? 56 : 40;
  const paddingX = isSecondary || isTertiary ? 40 : 56;
  const textAlign: CardFormTextAlign = args.textAlign || "left";
  const shadow: CardFormShadow = isPrimary
    ? "soft"
    : isTertiary
    ? "hard"
    : "none";
  const borderRadius: CardFormBorderRadius = isSecondary ? 8 : 24;
  const border = isSecondary;

  return {
    paddingY,
    paddingX,
    shadow,
    borderRadius,
    border,
    textAlign,
  };
}

export function CardForm({
  children,
  disabled,
  topContent = null,
  title,
  description,
  onSubmit,
  titleRightIcon,
  /* In some cases eg third party libs we can't avoid the need for child forms, so the
     top level element must be a div. Avoid using this prop generally except when necessary: */
  hasChildForm,
  wide = false,
  kind = "primary",
  textAlign: textAlignProp,
  belowFormContent,
}: CardFormProps) {
  const { paddingY, paddingX, shadow, borderRadius, border, textAlign } =
    resolveProps({ kind, textAlign: textAlignProp });

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
    ? toReactNodesWithTypographyMap(description, descriptionTypography[kind])
    : null;

  const belowFormContentNodes = belowFormContent
    ? toReactNodes(belowFormContent)
    : null;

  const content = (
    <CardFormContent>
      {topContent}
      {title && (
        <CardHeadline hasTopContent={Boolean(topContent)}>
          <Headline
            content={[
              title,
              ...(titleRightIcon
                ? [icon({ name: titleRightIcon.name, ml: 4 })]
                : []),
            ]}
            display="inline-flex"
          />
        </CardHeadline>
      )}
      {formattedDescription && (
        <CardFormSubtitle>{formattedDescription}</CardFormSubtitle>
      )}
      {children}
    </CardFormContent>
  );

  return (
    <CardFormContainer>
      {hasChildForm ? (
        <StyledCardFormDiv
          wide={wide}
          shadow={shadow}
          borderRadius={borderRadius}
          border={border}
          textAlign={textAlign}
          paddingY={paddingY}
          paddingX={paddingX}
        >
          {content}
        </StyledCardFormDiv>
      ) : (
        <StyledCardForm
          wide={wide}
          onSubmit={onSubmitForm}
          shadow={shadow}
          borderRadius={borderRadius}
          border={border}
          textAlign={textAlign}
          paddingY={paddingY}
          paddingX={paddingX}
          noValidate
        >
          {content}
        </StyledCardForm>
      )}
      <BelowCardFormContent>{belowFormContentNodes}</BelowCardFormContent>
    </CardFormContainer>
  );
}

const CardFormContainer = styled.div`
  display: flex;
  flex-direction: column;

  ${bp.sm(`
    height: 100%;
  `)}
`;

const CardFormContent = styled.div`
  display: flex;
  flex-direction: column;
  align-self: center;
`;

const BelowCardFormContent = styled.div`
  text-align: center;
  margin-top: 32px;

  ${bp.sm(`
    margin-bottom: 32px;
  `)}
`;

const CardFormSubtitle = styled.div``;

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
  paddingY: number;
};

const formInset = ({ wide, paddingX, paddingY }: CardFormInsetProps) => css`
  margin-left: auto;
  margin-right: auto;
  max-width: 100%;
  padding-right: ${paddingX}px;
  padding-left: ${paddingX}px;
  padding-top: ${paddingY}px;
  padding-bottom: ${paddingY}px;

  ${bp.minSm(`
    width: ${wide ? 700 : 505}px;
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
      margin-top: -${paddingY}px;
    `)}
  }
`;

type StyledCardFormStyleProps = {
  wide: boolean;
  shadow: CardFormShadow;
  borderRadius: CardFormBorderRadius;
  border: boolean;
  textAlign: CardFormTextAlign;
  paddingX: number;
  paddingY: number;
};

const StyledCardFormStyle = ({
  theme,
  wide,
  shadow,
  borderRadius,
  border,
  textAlign,
  paddingX,
  paddingY,
}: StyledCardFormStyleProps & { theme: Theme }) => {
  return css`
    ${formInset({ wide, paddingX, paddingY })}
    ${shadow === "soft"
      ? standardCardShadow
      : shadow === "hard"
      ? standardCardShadowHard
      : ""}

    background-color: ${theme.bg};
    position: relative;
    height: 100%;
    ${border ? `border: 1px solid ${theme.vlcNeutral};` : ""}

    ${bp.sm(`
      box-shadow: none;
    `)}

    ${bp.minSm(`
      border-radius: ${borderRadius}px;
    `)}

    ${CardHeadline}, ${CardFormSubtitle} {
      text-align: ${textAlign};
    }

    ${CardFormSubtitle} + * {
      margin-top: 40px !important;
    }

    ${CardFormButtonRow}, ${StyledButtonRow} {
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

      & > ${ButtonSelector()} {
        ${formButtonTopMarginStyle}
      }
    }
  `;
};

const StyledCardForm =
  styled.form<StyledCardFormStyleProps>(StyledCardFormStyle);
const StyledCardFormDiv =
  styled.div<StyledCardFormStyleProps>(StyledCardFormStyle);

const CardHeadline = styled.div<{ hasTopContent: boolean }>`
  ${({ hasTopContent }) => (hasTopContent ? "margin-top: 32px;" : "")}

  & + *:not(${CardFormSubtitle}) {
    margin-top: 40px;
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
