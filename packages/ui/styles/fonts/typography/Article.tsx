"use client";
import styled from "@emotion/styled";
import { StyledBody } from "./Body";
import { headlineSelector } from "./Headline";

export const Article = styled.article`
  ${headlineSelector("h1")} {
    margin: 0;
    padding-bottom: 8px;
  }

  ${headlineSelector("h2")}, ${headlineSelector("h3")}}, ${headlineSelector(
    "h4",
  )}, ${headlineSelector("h5")}, ${headlineSelector("h6")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${StyledBody} {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  img {
    margin-top: 16px;
    margin-bottom: 16px;
  }
`;
