"use client";
import styled from "@emotion/styled";
import { StyledBody } from "./Body";
import { displaySelector } from "./Display";
import { headlineSelector } from "./Headline";

export const Article = styled.article`
  ${displaySelector("h1")} {
    margin: 0;
  }

  ${headlineSelector("h1")} {
    margin: 0;
    padding-bottom: 8px;
  }

  ${headlineSelector("h2")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h3")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h4")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h5")} {
    padding-top: 32px;
    padding-bottom: 8px;
    margin: 0;
  }

  ${headlineSelector("h6")} {
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
