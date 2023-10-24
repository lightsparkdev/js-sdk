/** @jsxImportSource @emotion/react */
"use client";

import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import { Icon } from "@lightsparkdev/ui/icons";
import { colors } from "@lightsparkdev/ui/styles/colors";
import { LabelStrong, Title } from "@lightsparkdev/ui/styles/fonts/typography";
import {
  App,
  TokenSize,
} from "@lightsparkdev/ui/styles/fonts/typographyTokens";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface Props {
  title: string;
  actionText: string;
  icon: string;
  href: string;
}

export const SdkCard = ({ title, actionText, icon, href }: Props) => {
  const router = useRouter();
  const theme = useTheme();

  const handleClick = useCallback(() => {
    router.push(`${href}`);
  }, [href, router]);

  const contentColor = theme.content.text ?? colors.black;
  return (
    <Container onClick={handleClick} contentColor={contentColor}>
      <Content>
        <IconWrapper name={icon} color={contentColor} width={0} />
        <Title app={App.UmaDocs} color={contentColor}>
          {title}
        </Title>
        <ActionText>
          <LabelStrong
            app={App.UmaDocs}
            color={contentColor}
            size={TokenSize.Large}
          >
            {actionText}
          </LabelStrong>
          <ArrowWrapper name="RightArrow" color={contentColor} width={0} />
        </ActionText>
      </Content>
    </Container>
  );
};

const ArrowWrapper = styled(Icon)`
  width: 16px;
  opacity: 0;
  transform: translateX(-8px);
  transition:
    opacity 0.1s ease-out,
    transform 0.1s ease-out;
`;

const Container = styled.div<{ contentColor: string }>`
  border: 0.5px solid ${(props) => props.contentColor};
  border-radius: 12px;
  user-select: none;
  transition: background 0.1s ease-out;
  cursor: pointer;

  &:hover {
    background: ${colors.uma.blue95};
  }

  &:hover ${ArrowWrapper} {
    opacity: 1;
    transform: translateX(0px);
  }
`;

const IconWrapper = styled(Icon)`
  width: 40px;
  height: 40px;
  margin-bottom: 40px;
`;

const Content = styled.div`
  padding: 32px;
  display: flex;
  flex-direction: column;
`;

const ActionText = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
`;
