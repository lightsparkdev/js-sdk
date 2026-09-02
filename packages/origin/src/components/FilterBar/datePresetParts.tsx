"use client";

import * as React from "react";
import { Button } from "../Button";
import * as DatePicker from "../DatePicker";
import { Menu } from "../Menu";
import styles from "./FilterBar.module.scss";
import {
  resolveDateFilterPreset,
  resolveDateFilterPresetState,
  type DateFilterDescriptor,
  type DateFilterState,
} from "./filter-model";
import { useDateFilterDraft } from "./useDateFilterDraft";

function createDatePickerPresets(
  descriptor: DateFilterDescriptor<string>,
): DatePicker.DatePickerPreset[] {
  return (
    descriptor.datePicker?.presets?.map((preset) => ({
      ...preset,
      resolve: (now: Date) => {
        const result = resolveDateFilterPreset(descriptor, preset, now);
        if (result === null) {
          throw new Error("FilterBar date preset resolution failed");
        }
        return result;
      },
    })) ?? []
  );
}

export function DatePresetShortcutOptions({
  customLabel,
  descriptor,
  onApply,
  onCustom,
}: {
  customLabel: string;
  descriptor: DateFilterDescriptor<string>;
  onApply: (state: DateFilterState) => void;
  onCustom: () => void;
}) {
  const presets = descriptor.datePicker?.presets ?? [];

  return (
    <>
      {presets.map((preset) => (
        <Menu.Item
          key={preset.id}
          disabled={preset.disabled}
          label={preset.textValue}
          onClick={() => {
            const state = resolveDateFilterPresetState(descriptor, preset);
            if (state) {
              onApply(state);
            }
          }}
        >
          {preset.disabled && preset.disabledReason ? (
            <>
              {preset.label}
              {" — "}
              {preset.disabledReason}
            </>
          ) : (
            preset.label
          )}
        </Menu.Item>
      ))}
      <Menu.Separator />
      <Menu.Item onClick={onCustom}>{customLabel}</Menu.Item>
    </>
  );
}

export function DateValueEditorContent({
  applyLabel,
  descriptor,
  onApply,
  onClose,
  state,
}: {
  applyLabel: string;
  descriptor: DateFilterDescriptor<string>;
  onApply: (state: DateFilterState) => void;
  onClose: () => void;
  state: DateFilterState;
}) {
  const {
    draft,
    initialMonth,
    maxDate,
    editPreset,
    editValue,
    editRange,
    setValidity,
    reset,
    projectApply,
  } = useDateFilterDraft(descriptor, state);
  const datePickerConfig = descriptor.datePicker;
  const datePickerMode = datePickerConfig?.mode ?? "range";
  const datePickerPresets = React.useMemo(
    () => createDatePickerPresets(descriptor),
    [descriptor],
  );
  const datePickerActionsRef = React.useRef<DatePicker.DatePickerActions>(null);

  const applyDraft = () => {
    const datePickerIsValid = datePickerActionsRef.current?.validate() ?? true;
    const nextState = datePickerIsValid ? projectApply() : null;
    if (!nextState) {
      datePickerActionsRef.current?.focusFirstInvalidControl();
      return;
    }
    onApply(nextState);
    reset();
    onClose();
  };

  return (
    <DatePicker.Root
      actionsRef={datePickerActionsRef}
      required
      {...(datePickerConfig
        ? {
            mode: datePickerConfig.mode,
            granularity: datePickerConfig.granularity,
            presets: datePickerPresets,
            presetId: draft.presetId,
            onPresetIdChange: editPreset,
            value:
              datePickerConfig.mode === "single"
                ? draft.start ?? draft.end
                : null,
            ...(datePickerConfig.mode === "single"
              ? { onValueChange: editValue }
              : {}),
          }
        : {
            mode: "range" as const,
            includeTime: true,
          })}
      timeZone="UTC"
      {...(datePickerMode === "range"
        ? { rangeDraft: { start: draft.start, end: draft.end } }
        : {})}
      {...(initialMonth ? { defaultMonth: initialMonth } : {})}
      onRangeDraftChange={editRange}
      onValidityChange={setValidity}
      {...(maxDate ? { max: maxDate } : {})}
    >
      <DatePicker.Navigation />
      <DatePicker.Grid />
      {datePickerConfig?.presets?.length ? <DatePicker.PresetSelect /> : null}
      <DatePicker.Header />
      <DatePicker.Footer>
        <Button
          type="button"
          variant="outline"
          size="compact"
          className={styles.dateApplyButton}
          onClick={applyDraft}
        >
          {applyLabel}
        </Button>
      </DatePicker.Footer>
    </DatePicker.Root>
  );
}
