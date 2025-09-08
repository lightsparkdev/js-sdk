import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { Spacing } from "../../styles/tokens/spacing.js";
import { z } from "../../styles/z-index.js";

import { Button } from "../Button.js";
import Select from "../Select.js";
import { TextInput } from "../TextInput.js";
import { DateWidget } from "./DateWidget.js";
import { Filter, type FilterState } from "./Filter.js";
import {
  DateRangeOperation,
  MAX_DATE,
  MIN_DATE,
  TimeGranularity,
  endOfDay,
  startOfDay,
  subtractTime,
  type CustomDateRangeData,
  type IsAfterData,
  type IsBeforeData,
  type IsBetweenData,
  type IsEqualToData,
  type IsInTheLastData,
} from "./date_utils.js";
import { FilterType } from "./filters.js";

export enum DatePreset {
  LastHour = "Last hour",
  Last12Hours = "Last 12 hours",
  Today = "Today",
  Last7Days = "Last 7 days",
  Last14Days = "Last 14 days",
  Last30Days = "Last 30 days",
  Custom = "Custom",
}

const SIMPLE_PRESETS = Object.values(DatePreset).filter(
  (preset) => preset !== DatePreset.Custom,
);

interface DateRangeOption {
  type: DateRangeOperation;
  defaultData: CustomDateRangeData;
  getRangeData: (data: CustomDateRangeData) => { start: Date; end: Date };
  components: React.ReactNode;
}

export interface DateFilterState extends FilterState {
  type: FilterType.DATE;
  start: Date | null;
  end: Date | null;
  preset?: DatePreset | undefined;
  customRangeOperation?: DateRangeOperation | undefined;
}

export const isDateFilterState = (
  state: FilterState,
): state is DateFilterState => state.type === FilterType.DATE;

export const getDefaultDateFilterState = () => ({
  type: FilterType.DATE,
  start: null,
  end: null,
  isApplied: false,
});

export const DateFilter = ({
  updateFilterState,
  state,
  isDateOnly = false,
  presets = SIMPLE_PRESETS,
}: {
  updateFilterState: (state: DateFilterState) => void;
  state: DateFilterState;
  isDateOnly?: boolean;
  presets?: DatePreset[];
}) => {
  const [showCustomOptions, setShowCustomOptions] = useState(
    state.preset === DatePreset.Custom,
  );
  const [customDateRangeData, setCustomDateRangeData] = useState<
    CustomDateRangeData | undefined
  >();

  useEffect(() => {
    setShowCustomOptions(state.preset === DatePreset.Custom);
  }, [state]);

  const updateStateWithCustomRange = (
    customDateRangeData: CustomDateRangeData,
  ) => {
    setCustomDateRangeData(customDateRangeData);
    updateFilterState({
      type: FilterType.DATE,
      preset: DatePreset.Custom,
      isApplied: true,
      customRangeOperation: customDateRangeData.type,
      ...dateRangeOptions[customDateRangeData.type].getRangeData(
        customDateRangeData,
      ),
    });
  };

  const dateRangeOptions: Record<DateRangeOperation, DateRangeOption> = {
    [DateRangeOperation.IsInTheLast]: {
      type: DateRangeOperation.IsInTheLast,
      defaultData: {
        type: DateRangeOperation.IsInTheLast,
        value: 1,
        granularity: TimeGranularity.Hours,
      },
      getRangeData: (data: CustomDateRangeData) => {
        const { value, granularity } = data as IsInTheLastData;
        return {
          start: subtractTime(new Date(), value, granularity),
          end: new Date(),
        };
      },
      components: (
        <TimeAndGranularity>
          <TextInput
            placeholder="60"
            onChange={(value) => {
              updateStateWithCustomRange({
                type: DateRangeOperation.IsInTheLast,
                value: parseInt(value) || 0,
                granularity: (customDateRangeData as IsInTheLastData)
                  ?.granularity,
              });
            }}
            value={`${(customDateRangeData as IsInTheLastData)?.value}` || ""}
          />
          <Select
            defaultValue={{
              value: (customDateRangeData as IsInTheLastData)?.granularity,
              label: (customDateRangeData as IsInTheLastData)?.granularity,
            }}
            options={Object.values(TimeGranularity).map((timeGranularity) => ({
              value: timeGranularity,
              label: timeGranularity,
            }))}
            onChange={(option) => {
              if (option) {
                updateStateWithCustomRange({
                  ...(customDateRangeData as IsInTheLastData),
                  granularity: option.value as TimeGranularity,
                });
              }
            }}
            zIndex={z.dropdown}
          />
        </TimeAndGranularity>
      ),
    },
    [DateRangeOperation.IsEqualTo]: {
      type: DateRangeOperation.IsEqualTo,
      defaultData: { type: DateRangeOperation.IsEqualTo, date: new Date() },
      getRangeData: (data: CustomDateRangeData) => {
        const { date } = data as IsEqualToData;
        return { start: startOfDay(date), end: endOfDay(date) };
      },
      components: (
        <DateWidget
          dateRangeOperation={DateRangeOperation.IsEqualTo}
          onChange={updateStateWithCustomRange}
          isDateOnly={isDateOnly}
        />
      ),
    },
    [DateRangeOperation.IsBetween]: {
      type: DateRangeOperation.IsBetween,
      defaultData: {
        type: DateRangeOperation.IsBetween,
        start: subtractTime(new Date(), 7, TimeGranularity.Days),
        end: new Date(),
      },
      getRangeData: (data: CustomDateRangeData) => {
        const { start, end } = data as IsBetweenData;
        return { start, end };
      },
      components: (
        <DateWidget
          dateRangeOperation={DateRangeOperation.IsBetween}
          onChange={updateStateWithCustomRange}
          isDateOnly={isDateOnly}
        />
      ),
    },
    [DateRangeOperation.IsAfter]: {
      type: DateRangeOperation.IsAfter,
      defaultData: { type: DateRangeOperation.IsAfter, date: new Date() },
      getRangeData: (data: CustomDateRangeData) => {
        const { date } = data as IsAfterData;
        return { start: date, end: MAX_DATE };
      },
      components: (
        <DateWidget
          dateRangeOperation={DateRangeOperation.IsAfter}
          onChange={updateStateWithCustomRange}
          isDateOnly={isDateOnly}
        />
      ),
    },
    [DateRangeOperation.IsBefore]: {
      type: DateRangeOperation.IsBefore,
      defaultData: { type: DateRangeOperation.IsBefore, date: new Date() },
      getRangeData: (data: CustomDateRangeData) => {
        const { date } = data as IsBeforeData;
        return { start: MIN_DATE, end: date };
      },
      components: (
        <DateWidget
          dateRangeOperation={DateRangeOperation.IsBefore}
          onChange={updateStateWithCustomRange}
          isDateOnly={isDateOnly}
        />
      ),
    },
  };

  const handlePreset = (preset?: DatePreset) => {
    // Apply the preset if it's not already selected.
    let start: Date | undefined = undefined;
    let end: Date | undefined = undefined;
    switch (preset) {
      case DatePreset.LastHour:
        start = subtractTime(new Date(), 1, TimeGranularity.Hours);
        end = new Date();
        break;
      case DatePreset.Last12Hours:
        start = subtractTime(new Date(), 12, TimeGranularity.Hours);
        end = new Date();
        break;
      case DatePreset.Today:
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case DatePreset.Last7Days:
        start = subtractTime(new Date(), 7, TimeGranularity.Days);
        end = new Date();
        break;
      case DatePreset.Last14Days:
        start = subtractTime(new Date(), 14, TimeGranularity.Days);
        end = new Date();
        break;
      case DatePreset.Last30Days:
        start = subtractTime(new Date(), 30, TimeGranularity.Days);
        end = new Date();
        break;
      default:
        break;
    }

    if (start && end) {
      updateFilterState({
        type: FilterType.DATE,
        preset: state.preset === preset ? undefined : preset,
        start,
        end,
        isApplied: state.preset !== preset,
      });
      setShowCustomOptions(false);
    }
  };

  const toggleCustom = () => {
    if (state.preset === DatePreset.Custom) {
      updateFilterState({
        type: FilterType.DATE,
        preset: undefined,
        start: null,
        end: null,
        isApplied: false,
      });
      setShowCustomOptions(false);
      return;
    }

    handleSelectCustomRangeOption(DateRangeOperation.IsInTheLast);
    setShowCustomOptions(true);
  };

  const handleSelectCustomRangeOption = (operation: DateRangeOperation) => {
    updateStateWithCustomRange(dateRangeOptions[operation].defaultData);
  };

  return (
    <Filter label="date">
      <Container>
        <ButtonsContainer>
          {presets.map((preset) => (
            <Button
              key={preset}
              kind={preset === state.preset ? "primary" : undefined}
              text={preset}
              size="ExtraSmall"
              onClick={() => handlePreset(preset)}
            />
          ))}
          <Button
            kind={state.preset === DatePreset.Custom ? "primary" : undefined}
            text="Custom"
            size="ExtraSmall"
            onClick={toggleCustom}
          />
        </ButtonsContainer>
        {showCustomOptions && customDateRangeData && (
          <>
            <Select
              defaultValue={{
                value: customDateRangeData.type,
                label: `${customDateRangeData.type}`,
              }}
              options={Object.values(DateRangeOperation).map((operation) => ({
                value: operation,
                label: `${operation}`,
              }))}
              onChange={(option) => {
                if (option) {
                  handleSelectCustomRangeOption(
                    option.value as DateRangeOperation,
                  );
                }
              }}
              zIndex={z.dropdown}
            />
            {dateRangeOptions[customDateRangeData.type].components}
          </>
        )}
      </Container>
    </Filter>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.px.xs};
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: ${Spacing.px.xs};
  flex-wrap: wrap;
`;

const TimeAndGranularity = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${Spacing.px.xs};
  & > * {
    flex: 1;
  }

  input {
    height: 100%;
  }
`;
