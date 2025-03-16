import styled from "@emotion/styled";
import { Spacing } from "../../styles/tokens/spacing.js";
import { LabelModerate } from "../typography/LabelModerate.js";
import { type FilterType } from "./filters.js";

export interface FilterState {
  type: FilterType;
  isApplied: boolean;

  /**
   * Used when applying a filter. Returns the state to filter by in cases where the display value
   * differs from the actual filter value.
   */
  onValidate?: (
    /**
     * The current filter state.
     */
    filterState: FilterState,
    /**
     * Whether the filter is a multi-select filter.
     */
    isMulti?: boolean,
  ) => FilterState | false;
  // Error to show when filter validation fails
  errorMessage?: string | undefined;
}

export const Filter = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => {
  return (
    <FilterContainer>
      <FilterHeader>
        <LabelModerate>{`Filter by ${label}`}</LabelModerate>
      </FilterHeader>
      <FilterBody>{children}</FilterBody>
    </FilterContainer>
  );
};

const FilterContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.px.sm};
`;

const FilterHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const FilterBody = styled.div``;
