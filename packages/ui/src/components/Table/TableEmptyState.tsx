// Copyright  ©, 2022, Lightspark Group, Inc. - All Rights Reserved

import styled from "@emotion/styled";
import {
  standardBorderRadius,
  standardCardShadow,
  standardContentInset,
} from "../../styles/common.js";
import { isDark, themeOr } from "../../styles/themes.js";

type Props = {
  cardTitle?: string;
  cardText?: string;
};

export const TableEmptyState = (props: Props) => {
  const lines = [];
  for (let i = 0; i < 10; i++) {
    const percentage = randomIntFromInterval(70, 100);
    lines.push(<TableEmptyStateLine key={i} percentage={percentage} />);
  }
  return (
    <StyledTableEmptyState>
      {lines}
      {props.cardTitle || props.cardText ? (
        <TableEmptyStateCardContainer>
          <TableEmptyStateCard>
            {props.cardTitle ? (
              <TableEmptyStateCardTitle>
                {props.cardTitle}
              </TableEmptyStateCardTitle>
            ) : null}
            {props.cardText ? (
              <TableEmptyStateCardText>
                {props.cardText}
              </TableEmptyStateCardText>
            ) : null}
          </TableEmptyStateCard>
        </TableEmptyStateCardContainer>
      ) : null}
    </StyledTableEmptyState>
  );
};

const StyledTableEmptyState = styled.div`
  position: relative;
  ${standardContentInset.css}
`;

interface TableEmptyStateLineProps {
  percentage: number;
}

const TableEmptyStateLine = styled.div<TableEmptyStateLineProps>`
  background: linear-gradient(
    90deg,
    ${({ theme }) => (isDark(theme) ? theme.c1Neutral : theme.c05Neutral)} 0%,
    rgba(242, 242, 242, 0) 100%
  );
  height: 16px;
  margin: 15px 0;
  width: ${(props) => props.percentage}%;
`;

function randomIntFromInterval(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const TableEmptyStateCardContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 0;
  height: 100%;
  width: 100%;
`;

const TableEmptyStateCard = styled.div`
  ${standardCardShadow}
  ${standardBorderRadius(16)}
  padding: 32px;
  width: 320px;
  max-width: 100%;
  ${({ theme }) =>
    themeOr(`background-color: ${theme.bg}`, "transparent")({ theme })};
`;

const TableEmptyStateCardTitle = styled.p`
  font-weight: bold;
  margin: 0;
`;

const TableEmptyStateCardText = styled.p`
  color: ${({ theme }) => theme.c6Neutral};
  margin-top: 6px;
  margin-bottom: 0;
`;
