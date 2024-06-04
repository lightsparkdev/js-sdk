import styled from "@emotion/styled";
import { notNullUndefined } from "@lightsparkdev/core";
import { bp } from "../../styles/breakpoints.js";
import { colors } from "../../styles/colors.js";
import { IconContainer } from "../Icon/Icon.js";
import { type IconName } from "../Icon/types.js";
import { TextButton } from "../TextButton.js";
import { pageSectionScrollOffset } from "./constants.js";

const StyledPageSectionNav = styled.div`
  display: none;
  flex-direction: column;
  margin-right: 32px;
  position: relative;

  ${bp.minMd(`
    display: flex;
    width: 150px;
  `)}

  ${bp.lg(`
    width: 200px;
  `)}
`;

const PageSectionList = styled.ul<{ top: number }>`
  margin: 0;
  padding: 0;
  position: sticky;
  top: ${({ top }) => top}px;
`;

const StyledPageSectionNavItem = styled.li`
  align-items: center;
  color: ${colors.gray40};
  display: flex;
  list-style: none;

  ${IconContainer}:not(:first-of-type) {
    visibility: hidden;
  }

  &:hover {
    color: ${({ theme }) => theme.hcNeutral};

    ${IconContainer} {
      visibility: visible;
    }
  }
`;

type ListItemProps = {
  leftIcon: IconName;
  label: string;
  sectionId: string | null;
};

const PageSectionListItem = ({ leftIcon, label, sectionId }: ListItemProps) => (
  <StyledPageSectionNavItem>
    <TextButton
      text={label}
      padding="8px 0"
      leftIcon={{ name: leftIcon }}
      onClick={() => {
        if (sectionId) {
          window.location.replace(`#${sectionId}`);
        } else {
          window.location.replace("#");
        }
      }}
    />
  </StyledPageSectionNavItem>
);

type PageSectionNavProps = {
  pageSectionNavItems: ListItemProps[];
  headerOffset?: number;
};

export function PageSectionNav({
  headerOffset = 0,
  pageSectionNavItems,
}: PageSectionNavProps) {
  return (
    <StyledPageSectionNav>
      <PageSectionList top={headerOffset + pageSectionScrollOffset}>
        {pageSectionNavItems.filter(notNullUndefined).map((item) => {
          return (
            <PageSectionListItem
              leftIcon={item.leftIcon}
              label={item.label}
              sectionId={item.sectionId}
              key={item.sectionId}
            />
          );
        })}
      </PageSectionList>
    </StyledPageSectionNav>
  );
}
