import { type CSSInterpolation } from "@emotion/css";
import styled from "@emotion/styled";
import { ensureArray } from "@lightsparkdev/core";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { capitalize } from "lodash-es";
import { useState } from "react";
import { colors } from "../../styles/colors.js";
import { getColor, type LightsparkTheme } from "../../styles/themes.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { Button } from "../Button.js";
import { Dropdown } from "../Dropdown.js";
import { Flex } from "../Flex.js";
import { Icon } from "../Icon/Icon.js";
import { TextInput } from "../TextInput.js";
import { Body } from "../typography/Body.js";
import { Label } from "../typography/Label.js";
import { isBooleanFilterState } from "./BooleanFilter.js";
import { DateRangeOperation } from "./date_utils.js";
import { DatePreset, isDateFilterState } from "./DateFilter.js";
import { type Dates } from "./DateWidget.js";
import { isEnumFilterState } from "./EnumFilter.js";
import { type FilterState } from "./Filter.js";
import { FilterType, type Filter } from "./filters.js";
import { isIdFilterState } from "./IdFilter.js";
import { isStringFilterState } from "./StringFilter.js";
import {
  isBooleanFilterAndState,
  isDateFilterAndState,
  isEnumFilterAndState,
  isIdFilterAndState,
  isStringFilterAndState,
} from "./utils.js";

dayjs.extend(utc);

export interface PillFilterCustomComponents {
  customDropdown?:
    | React.ComponentType<React.ComponentProps<typeof Dropdown>>
    | undefined;
  customTextInput?:
    | React.ComponentType<React.ComponentProps<typeof TextInput>>
    | undefined;
  customCalendarCss?: CSSInterpolation | undefined;
}

export function PillFilter<T extends Record<string, unknown>>({
  filter,
  state,
  onUpdateFilter,
  onDelete,
  customComponents,
}: {
  filter: Filter<T>;
  state: FilterState;
  onUpdateFilter: (state: FilterState) => void;
  onDelete: () => void;
  customComponents?: PillFilterCustomComponents;
}) {
  return (
    <FilterContainer>
      <Property>
        <Label size="Small" content={filter.label} />
      </Property>
      <Operator>
        <Body
          size="Small"
          color="secondary"
          content={getOperatorLabel(filter)}
        />
      </Operator>
      <FilterDropdown
        filterAndState={{ filter, state }}
        onUpdateFilter={onUpdateFilter}
        customComponents={customComponents}
      />
      <DeleteButton onClick={onDelete}>
        <Icon
          name="CentralCrossSmall"
          color="secondary"
          width={16}
          iconProps={{
            strokeWidth: "3px",
          }}
        />
      </DeleteButton>
    </FilterContainer>
  );
}

function getOperatorLabel<T extends Record<string, unknown>>(
  filter: Filter<T>,
) {
  switch (filter.type) {
    case FilterType.ENUM:
      return "is";
    case FilterType.DATE:
      return "is";
    case FilterType.STRING:
      // TODO: Add string "contains" operator
      return "is";
    case FilterType.ID:
      return "is";
    case FilterType.BOOLEAN:
      return "is";
    // TODO: Currency filter state, design tbd
    default:
      return "is";
  }
}

function formatDateValue(date: Date) {
  return dayjs.utc(date).format("MMM DD, HH:mm");
}

function getFilterValue(state: FilterState) {
  if (isEnumFilterState(state)) {
    return state.appliedValues?.join(", ") || "";
  } else if (isStringFilterState(state)) {
    return state.appliedValues?.join(", ") || "";
  } else if (isIdFilterState(state)) {
    return state.appliedValues?.join(", ") || "";
  } else if (isDateFilterState(state)) {
    return state.start && state.end
      ? `${formatDateValue(state.start)} - ${formatDateValue(state.end)}`
      : "Empty";
  } else if (isBooleanFilterState(state)) {
    return state.value ? "True" : "False";
  }
  // TODO: Currency filter state, design tbd

  throw new Error("Invalid filter state");
}

const commonDropdownGetCSS = ({
  isOpen,
  theme,
}: {
  isOpen: boolean;
  theme: LightsparkTheme;
}) => {
  return {
    borderRight: `0.5px solid ${getColor(theme, ["controls", "border"])}`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
};

const commonDropdownProps = {
  getCSS: commonDropdownGetCSS,
  align: "left",
} as const;

function FilterDropdown<T extends Record<string, unknown>>({
  filterAndState,
  onUpdateFilter,
  customComponents,
}: {
  filterAndState: { filter: Filter<T>; state: FilterState };
  onUpdateFilter: (state: FilterState) => void;
  customComponents?: PillFilterCustomComponents | undefined;
}) {
  const [stringFilterValue, setStringFilterValue] = useState("");
  const [dates, setDates] = useState<Dates>(null);
  const [isOpen, setIsOpen] = useState(false);
  const DropdownComponent = customComponents?.customDropdown || Dropdown;

  if (isEnumFilterAndState(filterAndState)) {
    const { filter, state } = filterAndState;
    return (
      <DropdownComponent
        {...commonDropdownProps}
        button={{
          getContent: ({ isOpen, theme }) => {
            return (
              <Value>
                <Label
                  size="Small"
                  content={capitalize(getFilterValue(state))}
                />
              </Value>
            );
          },
        }}
        dropdownItems={filter.enumValues.map((option) => ({
          label: option.label,
          onClick: () => {
            const optionValues = ensureArray(option.value);
            let updatedAppliedValues: string[] = [];
            if (filter.isMulti) {
              updatedAppliedValues = state.appliedValues
                ? [
                    ...state.appliedValues.filter(
                      (appliedValue) => appliedValue !== option.value,
                    ),
                    ...optionValues,
                  ]
                : [...optionValues];
            } else {
              updatedAppliedValues = [...optionValues];
            }

            onUpdateFilter({
              ...state,
              value: option.label,
              isApplied: true,
              appliedValues: updatedAppliedValues,
            } as FilterState);
          },
        }))}
      />
    );
  } else if (
    isStringFilterAndState(filterAndState) ||
    isIdFilterAndState(filterAndState)
  ) {
    const TextInputComponent = customComponents?.customTextInput || TextInput;

    const { state } = filterAndState;
    const handleApplyFilter = () => {
      onUpdateFilter({
        ...state,
        appliedValues: state.appliedValues,
        isApplied: true,
      } as unknown as FilterState);
      setIsOpen(false);
    };

    return (
      <DropdownComponent
        {...commonDropdownProps}
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        button={{
          getContent: ({ isOpen, theme }) => {
            const filterValue = getFilterValue(state);
            return (
              <Value>
                <Label
                  size="Small"
                  content={filterValue.length > 0 ? filterValue : "Empty"}
                  color={filterValue.length > 0 ? "text" : "secondary"}
                />
              </Value>
            );
          },
        }}
        dropdownContent={
          <Flex column gap={8} pt={8} pr={8} pb={8} pl={8} width={240}>
            <TextInputComponent
              placeholder="Enter value"
              value={stringFilterValue}
              onChange={(value) => {
                setStringFilterValue(value);
              }}
              onKeyDown={(keyValue, event) => {
                if (keyValue === "Enter") {
                  handleApplyFilter();
                }
              }}
            />
            <Button
              kind="primary"
              text="Apply filter"
              typography={{
                type: "Btn",
              }}
              fullWidth
              onClick={handleApplyFilter}
            />
          </Flex>
        }
      />
    );
  } else if (isBooleanFilterAndState(filterAndState)) {
    const { state } = filterAndState;
    return (
      <DropdownComponent
        {...commonDropdownProps}
        button={{
          getContent: ({ isOpen, theme }) => {
            return (
              <Value>
                <Label
                  size="Small"
                  content={capitalize(getFilterValue(state))}
                />
              </Value>
            );
          },
        }}
        dropdownItems={["True", "False"].map((option) => ({
          label: option,
          onClick: () => {
            onUpdateFilter({
              ...state,
              value: option,
              isApplied: true,
            } as FilterState);
          },
        }))}
      />
    );
  } else if (isDateFilterAndState(filterAndState)) {
    const { state } = filterAndState;

    const updateStateWithCustomRange = (dates: Dates) => {
      if (
        !(dates instanceof Array && dates.length === 2) ||
        dates[0] === null ||
        dates[1] === null
      ) {
        throw new Error("Invalid date range");
      }

      setDates(dates);
      const start = dayjs
        .utc(dates[0])
        .add(dayjs().utcOffset(), "minutes")
        .toDate();
      const end = dayjs
        .utc(dates[1])
        .add(dayjs().utcOffset(), "minutes")
        .toDate();

      onUpdateFilter({
        ...state,
        preset: DatePreset.Custom,
        isApplied: true,
        customRangeOperation: DateRangeOperation.IsBetween,
        start,
        end,
      } as FilterState);
      setIsOpen(false);
    };

    return (
      <DropdownComponent
        {...commonDropdownProps}
        isOpen={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
        button={{
          getContent: ({ isOpen, theme }) => {
            return (
              <Value>
                <Label size="Small" content={getFilterValue(state)} />
              </Value>
            );
          },
        }}
        dropdownContent={
          <>
            {isOpen && (
              <DateTimeRangePicker
                onChange={updateStateWithCustomRange}
                isCalendarOpen={isOpen}
                value={dates}
                locale="en-US"
                shouldOpenWidgets={() => true}
                autoFocus
                formatShortWeekday={(locale, date) => {
                  return capitalize(
                    date.toLocaleDateString(locale, { weekday: "short" }),
                  ).slice(0, 1);
                }}
                css={customComponents?.customCalendarCss}
                nextLabel={
                  <NextPrevCalendarButtons>
                    <Icon name="CentralChevronRight" width={10} />
                  </NextPrevCalendarButtons>
                }
                prevLabel={
                  <NextPrevCalendarButtons>
                    <Icon name="CentralChevronLeft" width={10} />
                  </NextPrevCalendarButtons>
                }
              />
            )}
          </>
        }
      />
    );
  }

  return null;
}

const FilterContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 30px;
  background: ${({ theme }) => theme.bg};
  border-radius: 4px;
  border: 0.5px solid ${({ theme }) => getColor(theme, ["controls", "border"])};
`;

const Property = styled.div`
  border-right: 0.5px solid
    ${({ theme }) => getColor(theme, ["controls", "border"])};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px ${Spacing.px.xs};
`;

const Operator = styled.div`
  border-right: 0.5px solid
    ${({ theme }) => getColor(theme, ["controls", "border"])};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px ${Spacing.px.xs};
`;

const Value = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0px ${Spacing.px.xs};
`;

const DeleteButton = styled.div`
  padding: 0px ${Spacing.px["2xs"]};
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease-in-out;
  &:hover {
    background-color: ${colors["black-04"]};
  }
  &:active {
    background-color: ${colors["black-10"]};
  }
`;

const NextPrevCalendarButtons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  min-width: 28px;
  min-height: 28px;
`;
