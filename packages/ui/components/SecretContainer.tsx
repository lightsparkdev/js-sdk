// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved
import styled from "@emotion/styled";
import { CopyToClipboardButton } from "@lightsparkdev/ui/components";
import type { Maybe } from "@lightsparkdev/ui/types/utils";

type SecretContainerProps = {
  secret: Maybe<string>;
  success?: boolean;
};

export function SecretContainer(props: SecretContainerProps) {
  return props.secret ? (
    <StyledSecretContainer hasSecret={true} success={props.success}>
      <span
        style={{
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          overflow: "hidden",
          flex: 1,
        }}
      >
        {props.secret}
      </span>
      <CopyToClipboardButton value={props.secret} isSm ml={4} />
    </StyledSecretContainer>
  ) : (
    <StyledSecretContainer hasSecret={false}>
      There are no tokens associated with this account
    </StyledSecretContainer>
  );
}

type StyledSecretContainerProps = {
  hasSecret: boolean;
  success?: boolean | undefined;
};

const StyledSecretContainer = styled.div<StyledSecretContainerProps>`
  background-color: ${({ theme, hasSecret, success }) =>
    hasSecret ? (success ? theme.success : theme.c05Neutral) : theme.bg};
  border-radius: 8px;
  padding: 18px 20px;
  color: ${({ theme, success }) => (success ? theme.hcNeutral : theme.text)};
  border: solid 1px
    ${({ theme, hasSecret }) =>
      hasSecret ? theme.c05Neutral : theme.c1Neutral};
  display: flex;
  gap: 4px;
`;
