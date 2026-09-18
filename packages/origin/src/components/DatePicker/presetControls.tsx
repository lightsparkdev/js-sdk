"use client";

import * as React from "react";
import clsx from "clsx";
import { Field } from "../Field";
import { Select } from "../Select";
import styles from "./DatePicker.module.scss";
import { useDatePickerContext } from "./datePickerContext";

const CUSTOM_PRESET_VALUE_PREFIX = "__origin-date-picker-custom__";

export interface DatePickerPresetSelectProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {}

export const PresetSelect = React.forwardRef<
  HTMLDivElement,
  DatePickerPresetSelectProps
>(function DatePickerPresetSelect({ className, ...props }, forwardedRef) {
  const ctx = useDatePickerContext();
  const { registerPresetControl } = ctx;
  const triggerRef = React.useCallback(
    (element: HTMLButtonElement | null) => {
      registerPresetControl(element);
    },
    [registerPresetControl],
  );
  const customPresetValue = React.useMemo(() => {
    const presetIds = new Set(ctx.presets.map((preset) => preset.id));
    let suffix = "";
    while (presetIds.has(`${CUSTOM_PRESET_VALUE_PREFIX}${suffix}`)) {
      suffix += "_";
    }
    return `${CUSTOM_PRESET_VALUE_PREFIX}${suffix}`;
  }, [ctx.presets]);

  return (
    <Field.Root
      ref={forwardedRef}
      className={clsx(styles.presetSelect, className)}
      invalid={ctx.presetError !== null}
      {...props}
    >
      <Select.Root<string>
        items={[
          { value: customPresetValue, label: ctx.labels.custom },
          ...ctx.presets.map((preset) => ({
            value: preset.id,
            label: preset.label,
          })),
        ]}
        value={ctx.presetId ?? customPresetValue}
        onValueChange={(value) => {
          ctx.selectPreset(
            value === customPresetValue || value === null ? null : value,
          );
        }}
      >
        <Select.Trigger ref={triggerRef} aria-label={ctx.labels.preset}>
          <Select.Value className={styles.presetValue} />
          <Select.Icon />
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup className={styles.presetPopup}>
              <Select.List>
                <Select.Item
                  className={styles.presetItem}
                  value={customPresetValue}
                  label={ctx.labels.custom}
                >
                  <Select.ItemIndicator />
                  <Select.ItemText className={styles.presetItemText}>
                    {ctx.labels.custom}
                  </Select.ItemText>
                </Select.Item>
                {ctx.presets.map((preset) => (
                  <Select.Item
                    key={preset.id}
                    className={styles.presetItem}
                    value={preset.id}
                    disabled={preset.disabled}
                    label={preset.textValue}
                  >
                    <Select.ItemIndicator />
                    <Select.ItemText className={styles.presetItemText}>
                      {preset.disabled && preset.disabledReason ? (
                        <>
                          {preset.label}
                          {" — "}
                          {preset.disabledReason}
                        </>
                      ) : (
                        preset.label
                      )}
                    </Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
      {ctx.presetError ? <Field.Error>{ctx.presetError}</Field.Error> : null}
    </Field.Root>
  );
});

if (process.env.NODE_ENV !== "production") {
  PresetSelect.displayName = "DatePicker.PresetSelect";
}
