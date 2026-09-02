import { type CSSInterpolation } from "@emotion/serialize";
import styled from "@emotion/styled";
import { ensureArray } from "@lightsparkdev/core";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { capitalize, startCase } from "lodash-es";
import { useState } from "react";
import { colors } from "../../styles/colors.js";
import { getColor, type LightsparkTheme } from "../../styles/themes.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { Button } from "../Button.js";
import { Dropdown } from "../Dropdown.js";
import { Flex } from "../Flex.js";
import { Icon } from "../Icon/Icon.js";
import NumberInput from "../NumberInput.js";
import { TextInput } from "../TextInput.js";
import { Body } from "../typography/Body.js";
import { Label } from "../typography/Label.js";
import { isBooleanFilterState } from "./BooleanFilter.js";
import {
  CurrencyFilter,
  getDefaultCurrencyFilterState,
  isCurrencyFilterState,
  type CurrencyFilterState,
} from "./CurrencyFilter.js";
import {
  DateRangeOperation,
  toLocalDateTimeFromUTC,
  toUTCDateTimeFromLocal,
} from "./date_utils.js";
import { DatePreset, isDateFilterState } from "./DateFilter.js";
import { type Dates } from "./DateWidget.js";
import { isEnumFilterState } from "./EnumFilter.js";
import { type FilterState } from "./Filter.js";
import { FilterType, type Filter } from "./filters.js";
import { isIdFilterState } from "./IdFilter.js";
import {
  getDefaultInputObjectFilterState,
  InputObjectFilter,
  isInputObjectFilterState,
  type InputObjectFilterState,
} from "./InputObjectFilter.js";
import { isNumberFilterState } from "./NumberFilter.js";
import { isStringFilterState } from "./StringFilter.js";
import {
  isBooleanFilterAndState,
  isCurrencyFilterAndState,
  isDateFilterAndState,
  isEnumFilterAndState,
  isIdFilterAndState,
  isInputObjectFilterAndState,
  isNumberFilterAndState,
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
          content={getOperatorLabel(filter, state)}
        />
      </Operator>
      <FilterDropdown
        filterAndState={{ filter, state }}
        onUpdateFilter={onUpdateFilter}
        customComponents={customComponents}
      />
      <DeleteButton
        type="button"
        aria-label={`Remove ${filter.label} filter`}
        onClick={onDelete}
      >
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
  state: FilterState,
) {
  switch (filter.type) {
    case FilterType.ENUM:
      return "is";
    case FilterType.DATE:
      return "between";
    case FilterType.STRING:
      // TODO: Add string "contains" operator
      return "is";
    case FilterType.ID:
      return "is";
    case FilterType.BOOLEAN:
      return "is";
    case FilterType.CURRENCY:
      if (isCurrencyFilterState(state)) {
        if (state.min_amount && state.max_amount) return "between";
        if (state.min_amount) return "at least";
        if (state.max_amount) return "at most";
      }
      return "is";
    case FilterType.NUMBER:
      return "is";
    case FilterType.INPUT_OBJECT:
      return "includes";
    default:
      return "is";
  }
}

function formatDateValue(date: Date) {
  return dayjs.utc(date).format("MMM DD, HH:mm");
}

function getFilterValue(state: FilterState) {
  if (isEnumFilterState(state)) {
    return state.appliedValues?.join(", ").replaceAll("_", " ") || "Empty";
  } else if (isStringFilterState(state)) {
    return state.appliedValues?.join(", ") || "Empty";
  } else if (isIdFilterState(state)) {
    return state.appliedValues?.join(", ") || "Empty";
  } else if (isDateFilterState(state)) {
    return state.start && state.end
      ? `${formatDateValue(state.start)} - ${formatDateValue(state.end)}`
      : "Empty";
  } else if (isBooleanFilterState(state)) {
    return state.value === undefined ? "Empty" : state.value ? "True" : "False";
  } else if (isCurrencyFilterState(state)) {
    const min = state.min_amount?.value;
    const max = state.max_amount?.value;
    if (typeof min === "number" && typeof max === "number") {
      return `${min} – ${max} sats`;
    }
    if (typeof min === "number") return `${min} sats`;
    if (typeof max === "number") return `${max} sats`;
    return "Empty";
  } else if (isNumberFilterState(state)) {
    return state.value || "Empty";
  } else if (isInputObjectFilterState(state)) {
    const parts = Object.entries(state.values).flatMap(([field, values]) =>
      values.map(
        (value) => `${startCase(field)}: ${startCase(value.toLowerCase())}`,
      ),
    );
    return parts.join(", ") || "Empty";
  }

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
  const [currencyState, setCurrencyState] = useState<CurrencyFilterState>(
    isCurrencyFilterState(filterAndState.state)
      ? filterAndState.state
      : getDefaultCurrencyFilterState(),
  );
  const [inputObjectState, setInputObjectState] =
    useState<InputObjectFilterState>(
      isInputObjectFilterState(filterAndState.state)
        ? filterAndState.state
        : getDefaultInputObjectFilterState(),
    );
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
                  color={
                    state.appliedValues?.length &&
                    state.appliedValues.length > 0
                      ? "text"
                      : "secondary"
                  }
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

    const { filter, state } = filterAndState;
    const handleApplyFilter = () => {
      const value = stringFilterValue.trim();
      if (!value) return;

      let updatedAppliedValues: string[] = [];
      if (filter.isMulti) {
        updatedAppliedValues = state.appliedValues
          ? [
              ...state.appliedValues.filter(
                (appliedValue) => appliedValue !== value,
              ),
              value,
            ]
          : [value];
      } else {
        updatedAppliedValues = [value];
      }

      onUpdateFilter({
        ...state,
        appliedValues: updatedAppliedValues,
        value,
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
                  content={filterValue}
                  color={
                    state.appliedValues?.length &&
                    state.appliedValues.length > 0
                      ? "text"
                      : "secondary"
                  }
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
              text="Apply"
              typography={{
                type: "Btn",
              }}
              fullWidth
              disabled={!stringFilterValue.trim()}
              onClick={handleApplyFilter}
            />
          </Flex>
        }
      />
    );
  } else if (isNumberFilterAndState(filterAndState)) {
    const { filter, state } = filterAndState;
    const handleApplyFilter = () => {
      const value = stringFilterValue.trim();
      if (!value) return;
      onUpdateFilter({
        ...state,
        value,
        isApplied: true,
      } as unknown as FilterState);
      setIsOpen(false);
    };

    return (
      <DropdownComponent
        {...commonDropdownProps}
        isOpen={isOpen}
        onOpen={() => {
          setStringFilterValue(state.value);
          setIsOpen(true);
        }}
        onClose={() => setIsOpen(false)}
        button={{
          getContent: () => (
            <Value>
              <Label
                size="Small"
                content={getFilterValue(state)}
                color={state.value ? "text" : "secondary"}
              />
            </Value>
          ),
        }}
        dropdownContent={
          <Flex column gap={8} pt={8} pr={8} pb={8} pl={8} width={240}>
            <NumberInput
              value={stringFilterValue}
              onChange={setStringFilterValue}
              allowDecimals={filter.valueType !== "integer"}
              decimalsLimit={filter.valueType === "integer" ? undefined : 100}
              allowNegativeValue
            />
            <Button
              kind="primary"
              text="Apply"
              typography={{ type: "Btn" }}
              fullWidth
              disabled={stringFilterValue === ""}
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
              value: option === "True",
              isApplied: true,
            } as unknown as FilterState);
          },
        }))}
      />
    );
  } else if (isDateFilterAndState(filterAndState)) {
    const { state } = filterAndState;

    const isValidDateRange = (dates: Dates): dates is [Date, Date] => {
      return (
        dates instanceof Array &&
        dates.length === 2 &&
        dates[0] !== null &&
        dates[1] !== null
      );
    };

    const handleCalendarChange = (dates: Dates) => {
      if (!isValidDateRange(dates)) {
        return;
      }

      setDates(dates);
    };

    const updateCalendarState = (dates: Dates) => {
      if (!isValidDateRange(dates)) {
        return;
      }

      const start = toUTCDateTimeFromLocal(dates[0], state.start ?? undefined);
      const end = toUTCDateTimeFromLocal(dates[1], state.end ?? undefined);

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
        onOpen={() => {
          setDates(
            state.start && state.end
              ? [
                  toLocalDateTimeFromUTC(state.start),
                  toLocalDateTimeFromUTC(state.end),
                ]
              : null,
          );
          setIsOpen(true);
        }}
        onClose={() => setIsOpen(false)}
        button={{
          getContent: ({ isOpen, theme }) => {
            return (
              <Value>
                <Label
                  size="Small"
                  content={getFilterValue(state)}
                  color={state.start && state.end ? "text" : "secondary"}
                />
              </Value>
            );
          },
        }}
        dropdownContent={
          <>
            <div>
              <DateTimeRangePicker
                onChange={handleCalendarChange}
                isCalendarOpen={isOpen}
                shouldCloseWidgets={() => isOpen === false}
                shouldOpenWidgets={() => isOpen === true}
                onFocus={() => setIsOpen(true)}
                value={dates}
                locale="en-US"
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
              <Flex
                pt={Spacing["3xs"]}
                pr={Spacing.sm}
                pb={Spacing.sm}
                pl={Spacing.sm}
              >
                <Button
                  kind="primary"
                  typography={{
                    type: "Btn",
                  }}
                  fullWidth
                  text="Apply"
                  disabled={!isValidDateRange(dates)}
                  onClick={() => {
                    updateCalendarState(dates);
                  }}
                />
              </Flex>
            </div>
          </>
        }
      />
    );
  } else if (isCurrencyFilterAndState(filterAndState)) {
    const { filter, state } = filterAndState;
    const minAmount = currencyState.min_amount?.value;
    const maxAmount = currencyState.max_amount?.value;
    const hasMinAmount = typeof minAmount === "number";
    const hasMaxAmount = typeof maxAmount === "number";
    const isValidCurrencyRange =
      (hasMinAmount || hasMaxAmount) &&
      (!hasMinAmount || !hasMaxAmount || minAmount <= maxAmount);
    return (
      <DropdownComponent
        {...commonDropdownProps}
        isOpen={isOpen}
        onOpen={() => {
          setCurrencyState(state);
          setIsOpen(true);
        }}
        onClose={() => setIsOpen(false)}
        button={{
          getContent: () => (
            <Value>
              <Label
                size="Small"
                content={getFilterValue(state)}
                color={state.isApplied ? "text" : "secondary"}
              />
            </Value>
          ),
        }}
        dropdownContent={
          <Flex column gap={8} pt={8} pr={8} pb={8} pl={8} width={320}>
            <CurrencyFilter
              updateFilterState={setCurrencyState}
              state={currencyState}
              label={filter.label}
            />
            <Button
              kind="primary"
              text="Apply"
              typography={{ type: "Btn" }}
              fullWidth
              disabled={!isValidCurrencyRange}
              onClick={() => {
                onUpdateFilter(currencyState);
                setIsOpen(false);
              }}
            />
          </Flex>
        }
      />
    );
  } else if (isInputObjectFilterAndState(filterAndState)) {
    const { filter, state } = filterAndState;
    const hasInputObjectValues = Object.values(inputObjectState.values).some(
      (values) => values.length > 0,
    );
    return (
      <DropdownComponent
        {...commonDropdownProps}
        isOpen={isOpen}
        onOpen={() => {
          setInputObjectState(state);
          setIsOpen(true);
        }}
        onClose={() => setIsOpen(false)}
        button={{
          getContent: () => (
            <Value>
              <Label
                size="Small"
                content={getFilterValue(state)}
                color={state.isApplied ? "text" : "secondary"}
              />
            </Value>
          ),
        }}
        dropdownContent={
          <Flex column gap={16} pt={8} pr={8} pb={8} pl={8} width={320}>
            <InputObjectFilter
              updateFilterState={setInputObjectState}
              state={inputObjectState}
              fields={filter.fields}
            />
            <Button
              kind="primary"
              text="Apply"
              typography={{ type: "Btn" }}
              fullWidth
              disabled={!hasInputObjectValues}
              onClick={() => {
                onUpdateFilter(inputObjectState);
                setIsOpen(false);
              }}
            />
          </Flex>
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
  white-space: nowrap;
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
  white-space: nowrap;
`;

const DeleteButton = styled.button`
  border: 0;
  background: transparent;
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
