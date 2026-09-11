"use client";

import * as React from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import clsx from "clsx";
import { Field } from "../Field";
import { Fieldset } from "../Fieldset";
import { Input } from "../Input";
import { InputGroup } from "../InputGroup";
import styles from "./DatePicker.module.scss";
import {
  useDatePickerContext,
  useDatePickerInteractionContext,
  type DateRangeEndpoint,
} from "./datePickerContext";
import {
  createCalendarDate,
  getCalendarDate,
  getCalendarMonth,
  getCalendarYear,
  type DatePickerTimeZone,
} from "./dateTimeZone";

interface DateFormatInfo {
  order: ("day" | "month" | "year")[];
  separator: string;
  placeholder: string;
}

const dateFormatCache = new Map<string, DateFormatInfo>();

function getDateFormat(locale: string): DateFormatInfo {
  const cached = dateFormatCache.get(locale);
  if (cached) return cached;

  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date(2024, 11, 25));

  const order = parts
    .filter(
      (
        part,
      ): part is Intl.DateTimeFormatPart & {
        type: "day" | "month" | "year";
      } => part.type === "day" || part.type === "month" || part.type === "year",
    )
    .map((part) => part.type);

  const literal = parts.find((part) => part.type === "literal");
  const separator = literal?.value ?? "/";
  const labels: Record<string, string> = {
    day: "DD",
    month: "MM",
    year: "YYYY",
  };
  const placeholder = order.map((part) => labels[part]).join(separator);

  const result: DateFormatInfo = { order, separator, placeholder };
  dateFormatCache.set(locale, result);
  return result;
}

function getTimePlaceholder(locale: string): string {
  const resolved = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
  }).resolvedOptions();
  return resolved.hourCycle === "h12" || resolved.hourCycle === "h11"
    ? "12:00 PM"
    : "00:00";
}

function formatDateValue(
  date: Date | null,
  locale: string,
  timeZone: DatePickerTimeZone,
): string {
  if (!date) {
    return "";
  }
  return date.toLocaleDateString(locale, {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: timeZone === "UTC" ? "UTC" : undefined,
  });
}

function parseDateString(
  input: string,
  locale: string,
  timeZone: DatePickerTimeZone,
): Date | null {
  const value = input.trim().replace(/\.$/, "");
  if (!value) return null;

  const match = value.match(/^(\d{1,4})[/\-.\s]+(\d{1,4})[/\-.\s]+(\d{1,4})$/);
  if (!match) return null;

  const { order } = getDateFormat(locale);
  const raw = [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
  ];

  const values: Record<string, number> = {};
  for (let index = 0; index < 3; index++) {
    values[order[index]] = raw[index];
  }

  const month = values.month;
  const day = values.day;
  const year = values.year;

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 100) {
    return null;
  }

  const date = createCalendarDate(year, month - 1, day, timeZone);
  if (
    getCalendarYear(date, timeZone) !== year ||
    getCalendarMonth(date, timeZone) !== month - 1 ||
    getCalendarDate(date, timeZone) !== day
  ) {
    return null;
  }

  return date;
}

function formatTimeValue(
  date: Date | null,
  locale: string,
  timeZone: DatePickerTimeZone,
): string {
  const value = date ?? new Date();
  return value.toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone === "UTC" ? "UTC" : undefined,
  });
}

function parseTimeString(
  input: string,
): { hours: number; minutes: number } | null {
  const value = input.trim();
  if (!value) return null;

  const match = value.match(/^(\d{1,2})[:.](\d{2})\s*(am|pm|a|p)?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toLowerCase();

  if (minutes < 0 || minutes > 59) return null;

  if (meridiem) {
    if (hours < 1 || hours > 12) return null;
    if (meridiem.startsWith("p") && hours !== 12) hours += 12;
    if (meridiem.startsWith("a") && hours === 12) hours = 0;
  } else if (hours < 0 || hours > 23) {
    return null;
  }

  return { hours, minutes };
}

interface EditableInputOptions<ParsedValue> {
  active?: boolean;
  formattedValue: string;
  valueIdentity: number | null;
  invalidMessage: string;
  parseDraft: (draft: string) => ParsedValue | null;
  onCommit: (value: ParsedValue) => void;
  deferInvalidCommit?: (commit: () => void) => boolean;
  onInteract?: () => void;
}

function useEditableInput<ParsedValue>({
  active = true,
  formattedValue,
  valueIdentity,
  invalidMessage,
  parseDraft,
  onCommit,
  deferInvalidCommit,
  onInteract,
}: EditableInputOptions<ParsedValue>) {
  const {
    clearRequiredError,
    inputDraftResetRevision,
    registerInvalidControl,
    setInputValidity,
  } = useDatePickerContext();
  const [draft, setDraft] = React.useState(formattedValue);
  const [hasFocus, setHasFocus] = React.useState(false);
  const [showError, setShowError] = React.useState(false);
  const inputId = React.useId();
  const previousValueIdentity = React.useRef(valueIdentity);
  const previousInputDraftResetRevision = React.useRef(inputDraftResetRevision);
  const enterCommitDraft = React.useRef<string | null>(null);
  const hasDeferredInvalidCommit = React.useRef(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = React.useCallback(
    (element: HTMLInputElement | null) => {
      inputRef.current = element;
      registerInvalidControl(inputId, active ? element : null);
    },
    [active, inputId, registerInvalidControl],
  );

  React.useEffect(() => {
    const valueChanged = valueIdentity !== previousValueIdentity.current;
    const selectionChanged =
      inputDraftResetRevision !== previousInputDraftResetRevision.current;
    previousValueIdentity.current = valueIdentity;
    previousInputDraftResetRevision.current = inputDraftResetRevision;
    if (valueChanged || selectionChanged) {
      hasDeferredInvalidCommit.current = false;
      setDraft(formattedValue);
      enterCommitDraft.current = null;
      setShowError(false);
      setInputValidity(inputId, true);
    } else if (!hasFocus && !showError && !hasDeferredInvalidCommit.current) {
      setDraft(formattedValue);
    }
  }, [
    formattedValue,
    hasFocus,
    inputId,
    inputDraftResetRevision,
    setInputValidity,
    showError,
    valueIdentity,
  ]);

  React.useEffect(
    () => () => {
      setInputValidity(inputId, true);
      registerInvalidControl(inputId, null);
    },
    [inputId, registerInvalidControl, setInputValidity],
  );

  React.useEffect(() => {
    inputRef.current?.setCustomValidity(showError ? invalidMessage : "");
  }, [invalidMessage, showError]);

  React.useEffect(() => {
    if (active) {
      registerInvalidControl(inputId, inputRef.current);
      return;
    }
    inputRef.current?.setCustomValidity("");
    setShowError(false);
    setInputValidity(inputId, true);
    registerInvalidControl(inputId, null);
  }, [active, inputId, registerInvalidControl, setInputValidity]);

  function commit() {
    if (draft === formattedValue) {
      hasDeferredInvalidCommit.current = false;
      setShowError(false);
      setInputValidity(inputId, true);
      return;
    }

    const parsed = parseDraft(draft);
    if (parsed !== null) {
      hasDeferredInvalidCommit.current = false;
      setShowError(false);
      setInputValidity(inputId, true);
      onCommit(parsed);
    } else {
      const commitInvalid = () => {
        hasDeferredInvalidCommit.current = false;
        setShowError(true);
        setInputValidity(inputId, false);
      };
      if (deferInvalidCommit?.(commitInvalid)) {
        hasDeferredInvalidCommit.current = true;
      } else {
        commitInvalid();
      }
    }
  }

  return {
    inputId,
    setInputRef,
    showError,
    inputProps: {
      value: draft,
      onChange(event: React.ChangeEvent<HTMLInputElement>) {
        onInteract?.();
        clearRequiredError();
        setDraft(event.target.value);
        enterCommitDraft.current = null;
        setShowError(false);
        setInputValidity(inputId, false);
      },
      onFocus() {
        enterCommitDraft.current = null;
        setHasFocus(true);
        onInteract?.();
      },
      onBlur() {
        setHasFocus(false);
        if (enterCommitDraft.current === draft) {
          enterCommitDraft.current = null;
          return;
        }
        commit();
      },
      onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
          event.preventDefault();
          enterCommitDraft.current = draft;
          commit();
        }
      },
    },
  };
}

function DateInput({
  active = true,
  className,
  date,
  label,
  which,
}: {
  active?: boolean;
  className?: string;
  date: Date | null;
  label: string;
  which: "start" | "end";
}) {
  const context = useDatePickerContext();
  const interaction = useDatePickerInteractionContext();
  const formattedValue = formatDateValue(
    date,
    context.locale,
    context.timeZone,
  );
  const editableInput = useEditableInput({
    active,
    formattedValue,
    valueIdentity: date?.getTime() ?? null,
    invalidMessage: context.labels.invalidDate,
    parseDraft: (draft) => {
      const parsed = parseDateString(draft, context.locale, context.timeZone);
      return parsed && !context.isDateDisabled(parsed) ? parsed : null;
    },
    onCommit: (parsed) => context.setDate(which, parsed),
    deferInvalidCommit: (commit) =>
      interaction.deferRangeEndpointInvalidCommit(which, commit),
    onInteract: () => interaction.setRangeEndpointIntent(which),
  });
  const { placeholder } = getDateFormat(context.locale);
  const showRequiredError = context.requiredError && which === "start";

  return (
    <Field.Root
      className={clsx(styles.inputDraft, className)}
      invalid={editableInput.showError || showRequiredError}
    >
      <Input
        ref={editableInput.setInputRef}
        aria-label={label}
        aria-required={active && context.required ? true : undefined}
        placeholder={placeholder}
        disabled={!active}
        {...editableInput.inputProps}
      />
      {editableInput.showError ? (
        <Field.Error>{context.labels.invalidDate}</Field.Error>
      ) : showRequiredError ? (
        <Field.Error>
          {context.mode === "range"
            ? context.labels.requiredDateRange
            : context.labels.requiredDate}
        </Field.Error>
      ) : null}
    </Field.Root>
  );
}

function TimeInput({
  active = true,
  date,
  label,
  locale,
  timeZone,
  disabled,
  invalidMessage,
  onTimeChange,
  which,
}: {
  active?: boolean;
  date: Date | null;
  label: string;
  locale: string;
  timeZone: DatePickerTimeZone;
  disabled: boolean;
  invalidMessage: string;
  onTimeChange: (hours: number, minutes: number) => void;
  which: DateRangeEndpoint;
}) {
  const interaction = useDatePickerInteractionContext();
  const formattedValue = date ? formatTimeValue(date, locale, timeZone) : "";
  const showsUtc = timeZone === "UTC";
  const editableInput = useEditableInput({
    active,
    formattedValue,
    valueIdentity: date?.getTime() ?? null,
    invalidMessage,
    parseDraft: parseTimeString,
    onCommit: (parsed) => onTimeChange(parsed.hours, parsed.minutes),
    deferInvalidCommit: (commit) =>
      interaction.deferRangeEndpointInvalidCommit(which, commit),
    onInteract: () => interaction.setRangeEndpointIntent(which),
  });

  return (
    <Field.Root className={styles.inputDraft} invalid={editableInput.showError}>
      {showsUtc ? (
        <InputGroup.Root
          className={styles.timeInputGroup}
          disabled={disabled || !active}
          invalid={editableInput.showError}
        >
          <InputGroup.Input
            ref={editableInput.setInputRef}
            aria-label={`${label} (UTC)`}
            placeholder={getTimePlaceholder(locale)}
            {...editableInput.inputProps}
          />
          <InputGroup.Addon className={styles.timeZoneSuffix}>
            UTC
          </InputGroup.Addon>
        </InputGroup.Root>
      ) : (
        <Input
          ref={editableInput.setInputRef}
          aria-label={label}
          placeholder={getTimePlaceholder(locale)}
          disabled={disabled || !active}
          {...editableInput.inputProps}
        />
      )}
      {editableInput.showError ? (
        <Field.Error>{invalidMessage}</Field.Error>
      ) : null}
    </Field.Root>
  );
}

function InputSlot({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Collapsible.Root open={active} className={styles.inputSlotRoot}>
      <Collapsible.Panel
        className={styles.inputSlot}
        data-input-slot=""
        aria-hidden={active ? undefined : true}
        inert={active ? undefined : true}
      >
        {children}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}

function HeaderAutoLayout() {
  const context = useDatePickerContext();
  const labels = context.labels;
  const isRange = context.mode === "range";
  const includesTime = context.includeTime;
  const startDate = isRange
    ? context.rangeValue?.start ?? null
    : context.singleValue;
  const legendLabel = isRange
    ? labels.dateRange
    : includesTime
    ? labels.dateAndTime
    : labels.date;

  return (
    <Fieldset.Root
      orientation="horizontal"
      className={styles.inputGrid}
      data-granularity={context.granularity}
    >
      <Fieldset.Legend visuallyHidden>{legendLabel}</Fieldset.Legend>
      <DateInput
        {...(!isRange && !includesTime
          ? { className: styles.singleDateInput }
          : {})}
        date={startDate}
        label={isRange ? labels.startDate : labels.date}
        which="start"
      />
      <InputSlot active={includesTime}>
        <TimeInput
          active={includesTime}
          date={startDate}
          label={isRange ? labels.startTime : labels.time}
          locale={context.locale}
          timeZone={context.timeZone}
          disabled={
            isRange && context.usesRangeDraftApi && !context.rangeValue?.start
          }
          invalidMessage={labels.invalidTime}
          which="start"
          onTimeChange={(hours, minutes) =>
            context.setTime("start", hours, minutes)
          }
        />
      </InputSlot>
      <InputSlot active={isRange}>
        <DateInput
          active={isRange}
          date={context.rangeValue?.end ?? null}
          label={labels.endDate}
          which="end"
        />
      </InputSlot>
      <InputSlot active={isRange && includesTime}>
        <TimeInput
          active={isRange && includesTime}
          date={context.rangeValue?.end ?? null}
          label={labels.endTime}
          locale={context.locale}
          timeZone={context.timeZone}
          disabled={context.usesRangeDraftApi && !context.rangeValue?.end}
          invalidMessage={labels.invalidTime}
          which="end"
          onTimeChange={(hours, minutes) =>
            context.setTime("end", hours, minutes)
          }
        />
      </InputSlot>
    </Fieldset.Root>
  );
}

export interface DatePickerHeaderProps
  extends React.ComponentPropsWithoutRef<"div"> {}

export const Header = React.forwardRef<HTMLDivElement, DatePickerHeaderProps>(
  function DatePickerHeader({ className, children, ...props }, forwardedRef) {
    return (
      <div
        ref={forwardedRef}
        className={clsx(styles.header, className)}
        {...props}
      >
        {children ?? <HeaderAutoLayout />}
      </div>
    );
  },
);

if (process.env.NODE_ENV !== "production") {
  Header.displayName = "DatePicker.Header";
}
