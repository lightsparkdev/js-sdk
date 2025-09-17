import styled from "@emotion/styled";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker";
import { useEffect, useState } from "react";
import DatePicker from "react-date-picker";
import DateTimePicker from "react-datetime-picker";
import { textInputStyle } from "../../styles/fields.js";
import { Spacing } from "../../styles/tokens/spacing.js";
import { getTypographyString } from "../../styles/tokens/typography.js";
import { z } from "../../styles/z-index.js";
import { Icon } from "../Icon/Icon.js";
import { LabelModerate } from "../typography/LabelModerate.js";
import {
  DateRangeOperation,
  MIN_DATE,
  type CustomDateRangeData,
} from "./date_utils.js";

export type DateOrNull = Date | null;

export type Dates = DateOrNull | [DateOrNull, DateOrNull];

function getInitialDateState(dateRangeOperation: DateRangeOperation) {
  switch (dateRangeOperation) {
    case DateRangeOperation.IsBetween:
      return [new Date(), new Date()] as Dates;
    case DateRangeOperation.IsEqualTo:
    case DateRangeOperation.IsAfter:
    case DateRangeOperation.IsBefore:
      return new Date();
    default:
      throw new Error(`Unsupported DateRangeOperation: ${dateRangeOperation}`);
  }
}

export const DateWidget = ({
  onChange,
  dateRangeOperation,
  isDateOnly = false,
}: {
  onChange: (customDateRangeData: CustomDateRangeData) => void;
  dateRangeOperation: DateRangeOperation;
  isDateOnly?: boolean;
}) => {
  const [dates, setDates] = useState<Dates>(
    getInitialDateState(dateRangeOperation),
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    setDates(getInitialDateState(dateRangeOperation));
  }, [dateRangeOperation]);

  const handleOnChange = (dates: Dates) => {
    setDates(dates);

    switch (dateRangeOperation) {
      case DateRangeOperation.IsBetween:
        if (dates instanceof Array && dates[0] && dates[1]) {
          onChange({
            type: dateRangeOperation,
            start: dates[0],
            end: dates[1],
          });
        } else {
          throw new Error("Invalid array of dates");
        }
        break;
      case DateRangeOperation.IsEqualTo:
      case DateRangeOperation.IsAfter:
      case DateRangeOperation.IsBefore:
        onChange({
          type: dateRangeOperation,
          date: dates as Date,
        });
        break;
      default:
        throw new Error(
          `Unsupported DateRangeOperation: ${dateRangeOperation}`,
        );
    }
  };

  const handleCalendarOpen = () => {
    setActive(true);
  };

  const handleCalendarClose = () => {
    setActive(false);
  };

  let calendarComponent = null;
  switch (dateRangeOperation) {
    case DateRangeOperation.IsBetween:
      if (isDateOnly) {
        calendarComponent = (
          <DateRangePicker
            onChange={handleOnChange}
            onCalendarOpen={handleCalendarOpen}
            onCalendarClose={handleCalendarClose}
            value={dates}
            minDate={MIN_DATE}
          />
        );
      } else {
        calendarComponent = (
          <DateTimeRangePicker
            onChange={handleOnChange}
            onCalendarOpen={handleCalendarOpen}
            onCalendarClose={handleCalendarClose}
            value={dates}
            disableClock
            minDate={MIN_DATE}
          />
        );
      }
      break;
    case DateRangeOperation.IsEqualTo:
      calendarComponent = (
        <DatePicker
          onChange={handleOnChange}
          onCalendarOpen={handleCalendarOpen}
          onCalendarClose={handleCalendarClose}
          value={dates as Date}
          minDate={MIN_DATE}
        />
      );
      break;
    case DateRangeOperation.IsAfter:
    case DateRangeOperation.IsBefore:
      if (isDateOnly) {
        calendarComponent = (
          <DatePicker
            onChange={handleOnChange}
            onCalendarOpen={handleCalendarOpen}
            onCalendarClose={handleCalendarClose}
            value={dates as Date}
            minDate={MIN_DATE}
          />
        );
      } else {
        calendarComponent = (
          <DateTimePicker
            onChange={handleOnChange}
            onCalendarOpen={handleCalendarOpen}
            onCalendarClose={handleCalendarClose}
            value={dates as Date}
            disableClock
            minDate={MIN_DATE}
          />
        );
      }
      break;
    default:
      throw new Error(`Unsupported DateRangeOperation: ${dateRangeOperation}`);
  }

  return (
    <Container>
      {dateRangeOperation === DateRangeOperation.IsBetween && (
        <Indicators>
          <Icon name="ArrowCornerDownRight" width={16} color="c6Neutral" />
          <LabelModerate color="c6Neutral">and</LabelModerate>
        </Indicators>
      )}

      <CalendarContents active={active}>{calendarComponent}</CalendarContents>
    </Container>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  gap: ${Spacing.px.sm};
`;

const Indicators = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${Spacing.px.xs};
  width: 24px;
  justify-content: space-around;
`;

const CalendarContents = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${Spacing.px.md};
  width: 100%;

  // Date text input date
  .react-date-picker,
  .react-datetime-picker,
  .react-daterange-picker,
  .react-datetimerange-picker {
    display: inline-flex;
    position: relative;
  }

  .react-date-picker,
  .react-datetime-picker,
  .react-datetimerange-picker,
  .react-daterange-picker,
  .react-date-picker *,
  .react-datetime-picker *,
  .react-datetimerange-picker *,
  .react-daterange-picker *,
  .react-date-picker *:before,
  .react-datetime-picker *:before,
  .react-datetimerange-picker *:before,
  .react-daterange-picker *:before,
  .react-date-picker *:after,
  .react-datetime-picker *:after,
  .react-daterange-picker *:after,
  .react-datetimerange-picker *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .react-date-picker--disabled,
  .react-datetime-picker--disabled,
  .react-daterange-picker--disabled,
  .react-datetimerange-picker--disabled {
    background-color: #f0f0f0;
    color: #6d6d6d;
  }

  .react-date-picker__wrapper,
  .react-datetime-picker__wrapper,
  .react-daterange-picker__wrapper,
  .react-datetimerange-picker__wrapper {
    display: flex;
    flex-grow: 1;
    flex-shrink: 0;
    align-items: center;

    flex-direction: column;
    gap: ${Spacing.px.xs};
  }

  .react-date-picker__inputGroup,
  .react-datetime-picker__inputGroup,
  .react-daterange-picker__inputGroup,
  .react-datetimerange-picker__inputGroup {
    min-width: calc(4px + (4px * 3) + 0.54em * 6 + 0.217em * 2);
    height: 100%;
    flex-grow: 1;
    padding: 0 2px;
    ${({ theme, active }) => textInputStyle({ theme, active })};
    input:focus-visible {
      outline: none;
    }
  }

  .react-date-picker__range-divider,
  .react-datetime-picker__range-divider,
  .react-daterange-picker__range-divider,
  .react-datetimerange-picker__range-divider {
    display: none;
  }

  .react-date-picker__inputGroup__divider,
  .react-datetime-picker__inputGroup__divider,
  .react-daterage-picker__inputGroup__divider,
  .react-datetimerange-picker__inputGroup__divider {
    padding: 1px 0;
  }

  .react-date-picker__inputGroup__divider,
  .react-datetime-picker__inputGroup__divider,
  .react-daterange-picker__inputGroup__divider,
  .react-datetimerange-picker__inputGroup__divider,
  .react-date-picker__inputGroup__leadingZero,
  .react-datetime-picker__inputGroup__leadingZero,
  .react-daterange-picker__inputGroup__leadingZero,
  .react-datetimerange-picker__inputGroup__leadingZero {
    display: inline-block;
  }

  .react-date-picker__inputGroup__input,
  .react-datetime-picker__inputGroup__input,
  .react-daterange-picker__inputGroup__input,
  .react-datetimerange-picker__inputGroup__input {
    min-width: 0.54em;
    height: calc(100% - 2px);
    position: relative;
    padding: 1px;
    border: 0;
    background: none;
    color: currentColor;
    font: inherit;
    box-sizing: content-box;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
  }

  .react-date-picker__inputGroup__input::-webkit-outer-spin-button,
  .react-datetime-picker__inputGroup__input::-webkit-outer-spin-button,
  .react-daterange-picker__inputGroup__input::-webkit-outer-spin-button,
  .react-datetimerange-picker__inputGroup__input::-webkit-outer-spin-button,
  .react-date-picker__inputGroup__input::-webkit-inner-spin-button,
  .react-daterange-picker__inputGroup__input::-webkit-inner-spin-button,
  .react-datetime-picker__inputGroup__input::-webkit-inner-spin-button,
  .react-datetimerange-picker__inputGroup__input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    margin: 0;
  }

  .react-date-picker__inputGroup__input:invalid,
  .react-datetime-picker__inputGroup__input:invalid,
  .react-daterange-picker__inputGroup__input:invalid,
  .react-datetimerange-picker__inputGroup__input:invalid {
    background: rgba(255, 0, 0, 0.1);
  }

  .react-date-picker__inputGroup__input--hasLeadingZero,
  .react-datetime-picker__inputGroup__input--hasLeadingZero,
  .react-daterange-picker__inputGroup__input--hasLeadingZero,
  .react-datetimerange-picker__inputGroup__input--hasLeadingZero {
    margin-left: -0.54em;
    padding-left: calc(1px + 0.54em);
  }

  .react-date-picker__inputGroup__amPm,
  .react-datetime-picker__inputGroup__amPm,
  .react-daterange-picker__inputGroup__amPm,
  .react-datetimerange-picker__inputGroup__amPm {
    font: inherit;
    -webkit-appearance: menulist;
    -moz-appearance: menulist;
    appearance: menulist;
  }

  .react-date-picker__button,
  .react-datetime-picker__button,
  .react-daterange-picker__button,
  .react-datetimerange-picker__button {
    border: 0;
    background: transparent;
    padding: 4px 6px;

    display: none;
  }

  .react-date-picker__button:enabled,
  .react-datetime-picker__button:enabled,
  .react-datetimerange-picker__button:enabled,
  .react-datetimerange-picker__button:enabled {
    cursor: pointer;
  }

  .react-date-picker__button:enabled:hover
    .react-datetime-picker__button:enabled:hover
    .react-datetimerange-picker__button:enabled:hover
    .react-daterange-picker__button:enabled:hover
    .react-date-picker__button__icon,
  .react-datetime-picker__button__icon,
  .react-daterange-picker__button__icon,
  .react-datetimerange-picker__button__icon,
  .react-date-picker__button:enabled:focus
    .react-datetime-picker__button:enabled:focus
    .react-daterange-picker__button:enabled:focus
    .react-datetimerange-picker__button:enabled:focus
    .react-date-picker__button__icon,
  .react-datetime-picker__button__icon,
  .react-daterange-picker__button__icon,
  .react-datetimerange-picker__button__icon {
    stroke: #0078d7;
  }

  .react-date-picker__button:disabled
    .react-datetime-picker__button:disabled
    .react-daterange-picker__button:disabled
    .react-datetimerange-picker__button:disabled
    .react-date-picker__button__icon,
  .react-datetime-picker__button__icon,
  .react-daterange-picker__button__icon,
  .react-datetimerange-picker__button__icon {
    stroke: #6d6d6d;
  }

  .react-date-picker__button svg,
  .react-datetime-picker__button svg,
  .react-daterange-picker__button svg,
  .react-datetimerange-picker__button svg {
    display: inherit;
  }

  .react-date-picker__calendar,
  .react-datetime-picker__calendar,
  .react-daterange-picker__calendar,
  .react-datetimerange-picker__calendar {
    z-index: 1;
  }

  .react-date-picker__calendar--closed,
  .react-datetime-picker__calendar--closed,
  .react-daterange-picker__calendar--closed,
  .react-datetimerange-picker__calendar--closed {
    display: none;
  }

  .react-date-picker__calendar,
  .react-datetime-picker__calendar,
  .react-daterange-picker__calendar,
  .react-datetimerange-picker__calendar {
    width: 350px;
    max-width: 100vw;

    z-index: ${z.dropdown};
  }

  .react-date-picker__calendar .react-calendar,
  .react-datetime-picker__calendar .react-calendar,
  .react-daterange-picker__calendar .react-calendar,
  .react-datetimerange-picker__calendar .react-calendar {
    border-width: thin;
  }

  // Calendar styles
  .react-calendar {
    width: 350px;
    max-width: 100%;
    background: white;
    border: 1px solid #a0a096;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.125em;

    background: ${({ theme }) => theme.bg};
    position: absolute;
    border: 0.5px solid ${({ theme }) => theme.c1Neutral};
    box-shadow:
      0px 4px 12px 0px rgba(0, 0, 0, 0.08),
      0px 8px 24px 0px rgba(0, 0, 0, 0.04);
    border-radius: 8px;
    margin-top: ${Spacing.px.xs};
    padding: ${Spacing.px.xl};
  }

  .react-calendar--doubleView {
    width: 700px;
  }

  .react-calendar--doubleView .react-calendar__viewContainer {
    display: flex;
    margin: -0.5em;
  }

  .react-calendar--doubleView .react-calendar__viewContainer > * {
    width: 50%;
    margin: 0.5em;
  }

  .react-calendar,
  .react-calendar *,
  .react-calendar *:before,
  .react-calendar *:after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
  }

  .react-calendar button {
    margin: 0;
    border: 0;
    outline: none;
  }

  .react-calendar button:enabled:hover {
    cursor: pointer;
  }

  .react-calendar__navigation {
    display: flex;
    padding-bottom: ${Spacing.px.xs};
    gap: ${Spacing.px.xs};
  }

  .react-calendar__navigation button {
    width: 16px;
    background: none;
  }

  .react-calendar__navigation button:disabled {
    background-color: #f0f0f0;
  }

  .react-calendar__navigation__label {
    ${({ theme }) => getTypographyString(theme, "Label Moderate", "Medium")}
  }

  .react-calendar__navigation__next-button,
  .react-calendar__navigation__next2-button,
  .react-calendar__navigation__prev-button,
  .react-calendar__navigation__prev2-button {
    ${({ theme }) => getTypographyString(theme, "Label Moderate", "Medium")}
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 4px;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font: inherit;
    font-size: 0.75em;
    font-weight: bold;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: ${Spacing.px.md} ${Spacing.px["3xs"]} ${Spacing.px.xs}
      ${Spacing.px["3xs"]};

    color: ${({ theme }) => theme.c6Neutral};

    abbr {
      text-decoration: none;

      ${({ theme }) => getTypographyString(theme, "Label Moderate", "Small")}
    }
  }

  .react-calendar__month-view__weekNumbers .react-calendar__tile {
    display: flex;
    align-items: center;
    justify-content: center;
    font: inherit;
    font-size: 0.75em;
    font-weight: bold;
  }

  .react-calendar__month-view__days {
    abbr {
      ${({ theme }) => getTypographyString(theme, "Label Moderate", "Medium")}
    }

    display: grid !important;
    gap: 1px;
    grid-template-columns: repeat(7, 39.5px);
    grid-template-rows: repeat(5, 39.5px);
  }

  .react-calendar__tile.react-calendar__month-view__days__day {
    outline: 1px solid ${({ theme }) => theme.c05Neutral};
    padding: 0px;
  }

  .react-calendar__year-view__months {
    ${({ theme }) => getTypographyString(theme, "Label Moderate", "Medium")}

    display: grid !important;
    gap: 1px;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }

  .react-calendar__tile.react-calendar__year-view__months__month {
    outline: 1px solid ${({ theme }) => theme.c05Neutral};
    padding: 0px;
  }

  .react-calendar__decade-view__years {
    ${({ theme }) => getTypographyString(theme, "Label Moderate", "Medium")}

    display: grid !important;
    gap: 1px;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }

  .react-calendar__tile.react-calendar__decade-view__years__year {
    outline: 1px solid ${({ theme }) => theme.c05Neutral};
    padding: 0px;
  }

  .react-calendar__century-view__decades {
    ${({ theme }) => getTypographyString(theme, "Label Moderate", "Medium")}

    display: grid !important;
    gap: 1px;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(4, 1fr);
  }

  .react-calendar__tile.react-calendar__century-view__decades__decade {
    outline: 1px solid ${({ theme }) => theme.c05Neutral};
    padding: 0px;
  }

  .react-calendar__month-view__days__day--neighboringMonth,
  .react-calendar__decade-view__years__year--neighboringDecade,
  .react-calendar__century-view__decades__decade--neighboringCentury {
    visibility: hidden;
  }

  .react-calendar__tile {
    background: none;
    text-align: center;
    line-height: 16px;
    font: inherit;
  }

  .react-calendar__tile:disabled {
    background-color: #f0f0f0;
    color: #ababab;
  }

  .react-calendar__month-view__days__day--neighboringMonth:disabled,
  .react-calendar__decade-view__years__year--neighboringDecade:disabled,
  .react-calendar__century-view__decades__decade--neighboringCentury:disabled {
    color: #cdcdcd;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background: ${({ theme }) => theme.c2Neutral};
  }

  .react-calendar__tile--now {
    border: 1px solid black !important;
  }

  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: ${({ theme }) => theme.c2Neutral};
  }

  .react-calendar__tile--hasActive {
    background: ${({ theme }) => theme.hcNeutral};
    color: ${({ theme }) => theme.bg};
  }

  .react-calendar__tile--hasActive:enabled:hover {
    background: ${({ theme }) => theme.c8Neutral};
  }

  .react-calendar__tile--active {
    background: ${({ theme }) => theme.c05Neutral};
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: ${({ theme }) => theme.hcNeutral};
    color: ${({ theme }) => theme.bg};
  }

  .react-calendar--selectRange .react-calendar__tile--hover {
    background: ${({ theme }) => theme.c05Neutral};
  }

  .react-calendar__tile--rangeBothEnds {
    background: ${({ theme }) => theme.hcNeutral};
    color: ${({ theme }) => theme.bg};
  }
`;
