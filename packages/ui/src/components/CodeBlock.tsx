// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import Prism from "prismjs";
import "prismjs/components/prism-dart.min.js";
import "prismjs/components/prism-go.min.js";
import "prismjs/components/prism-graphql.min.js";
import "prismjs/components/prism-java.min.js";
import "prismjs/components/prism-json.min.js";
import "prismjs/components/prism-jsx.min.js";
import "prismjs/components/prism-kotlin.min.js";
import "prismjs/components/prism-python.min.js";
import "prismjs/components/prism-rust.min.js";
import "prismjs/components/prism-swift.min.js";
import "prismjs/themes/prism-tomorrow.css";
import { useLayoutEffect } from "react";
import type { StylesConfig } from "react-select";
import Select from "react-select";
import { colors } from "../styles/colors.js";
import { standardBorderRadius } from "../styles/common.js";
import { themeOr } from "../styles/themes.js";
import { overflowAutoWithoutScrollbars } from "../styles/utils.js";
import { CopyToClipboardButton } from "./CopyToClipboardButton.js";

/* ProgrammingLanguageOptions keys are the available langauge option labels in the CodeBlock
 * language switcher. Language switching is off by default but you can enable it by passing in
 * languageOptions and onSelectLanguage to the CodeBlock component. The languageOptions prop
 * ProgrammingLanguageOptions values are the prismjs language that the option is mapped to.
 * See https://prismjs.com/#supported-languages for full list of supported languages: */
export const ProgrammingLanguageOptions = {
  Bash: "bash",
  Flutter: "dart",
  Go: "go",
  GraphQL: "graphql",
  Java: "java",
  JavaScript: "js",
  JSON: "json",
  Kotlin: "kotlin",
  Python: "python",
  React: "react",
  ReactNative: "tsx",
  Rust: "rust",
  Swift: "swift",
  Text: "txt",
} as const;
export type ProgrammingOptionNames = keyof typeof ProgrammingLanguageOptions;
export type ProgrammingLanguages =
  (typeof ProgrammingLanguageOptions)[keyof typeof ProgrammingLanguageOptions];

/* match prism-tomorrow theme: */
const backgroundColor = "#2d2d2d";
export const InlineCode = styled.span`
  font-family: "Roboto Mono", monospace;
  background-color: #2d2d2d;
  border: 1px solid ${themeOr(colors.gray90, colors.gray20)};
  border-radius: 3px;
  line-height: 24px;
  padding: 0 4px;
`;

type OptionType = {
  label: ProgrammingOptionNames | undefined;
  value: ProgrammingOptionNames | undefined;
};

const codeSelectStyles: StylesConfig<OptionType> = {
  container: (styles) => ({
    ...styles,
    display: "flex",
  }),
  control: (styles) => ({
    ...styles,
    backgroundColor: backgroundColor,
    border: "none",
    cursor: "pointer",
    "&:hover": {
      border: "#none",
    },
    boxShadow: "none",
    minHeight: 0,
  }),
  dropdownIndicator: (styles) => ({
    ...styles,
    color: "#ffffff",
    padding: "0 0 0 4px",
    "&:hover": {
      color: "#ffffff",
    },
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  input: (styles) => ({
    ...styles,
    fontSize: "1rem",
    margin: 0,
    color: "transparent",
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: backgroundColor,
    width: "auto",
  }),
  menuList: (styles) => ({
    ...styles,
    borderRadius: "4px",
    padding: 0,
  }),
  option: (styles, state) => ({
    ...styles,
    cursor: "pointer",
    backgroundColor: state.isSelected ? colors.gray25 : backgroundColor,
    "&:hover": {
      backgroundColor: colors.gray25,
    },
  }),
  singleValue: (styles) => ({
    ...styles,
    color: "#ffffff",
    margin: 0,
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: 0,
  }),
};

type CodeBlockProps = {
  title?: string;
  children: string;
  className?: string;
  language?: ProgrammingOptionNames;
  languageOptions?: Array<ProgrammingOptionNames>;
  onSelectLanguage?: (language: ProgrammingOptionNames) => void;
  withCopyButton?: boolean;
};

export const CodeBlock = ({
  title,
  children,
  className,
  language = "Text",
  languageOptions,
  onSelectLanguage,
  withCopyButton,
}: CodeBlockProps) => {
  useLayoutEffect(() => {
    Prism.highlightAll();
  }, [children, language]);

  const header =
    withCopyButton || (languageOptions && onSelectLanguage) ? (
      <CodeBlockHeader>
        {title && <CodeBlockHeaderTitle>{title}</CodeBlockHeaderTitle>}
        <div
          css={{
            display: "flex",
            alignItems: "center",
            justifyContent: title ? "flex-end" : "space-between",
            width: "100%",
          }}
        >
          {languageOptions && onSelectLanguage ? (
            <div css={{ margin: title ? "0 16px 0 auto" : "0" }}>
              <Select<OptionType>
                value={{ value: language, label: language }}
                options={languageOptions.map((lang) => ({
                  value: lang,
                  label: lang,
                }))}
                onChange={(selected) => {
                  if (selected?.value) {
                    onSelectLanguage(selected.value);
                  }
                }}
                styles={codeSelectStyles}
              />
            </div>
          ) : null}
          {withCopyButton ? <CopyToClipboardButton value={children} /> : null}
        </div>
      </CodeBlockHeader>
    ) : null;

  return (
    <StyledCodeBlock className={className}>
      {header}
      <CodeBlockContainer hasHeader={header !== null}>
        <code className={`language-${ProgrammingLanguageOptions[language]}`}>
          {children}
        </code>
      </CodeBlockContainer>
    </StyledCodeBlock>
  );
};

export const StyledCodeBlock = styled.div``;

const CodeBlockHeader = styled.div`
  align-items: center;
  background-color: #2d2d2d;
  border-bottom: 1px solid ${colors.gray25};
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  color: #ffffff;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 16px 20px;
`;

interface BlockContainerProps {
  hasHeader: boolean;
}

const CodeBlockContainer = styled.pre<BlockContainerProps>`
  ${overflowAutoWithoutScrollbars}
  &[class*="language-"] {
    padding: 20px;
    font-weight: 500;
    ${standardBorderRadius(8)}
    ${(props) =>
      props.hasHeader
        ? `border-top-left-radius: 0;
            border-top-right-radius: 0;
            margin-top: 0;`
        : ""}
  }
`;

const CodeBlockHeaderTitle = styled.div`
  width: 100%;
  font-weight: 500;
  color: ${({ theme }) => theme.hcNeutralFromBg(backgroundColor)};
`;
