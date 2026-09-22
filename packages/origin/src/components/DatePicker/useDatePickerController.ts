import * as React from "react";
import { useTrackedCallback } from "../Analytics/useTrackedCallback";
import {
  useDateRangeSelection,
  type DateRange,
  type DateRangeDraft,
} from "./useDateRangeSelection";
import type { DatePickerTimeZone } from "./dateTimeZone";
import type {
  DatePickerGranularity,
  DatePickerMode,
  DatePickerPreset,
} from "./types";
import { resolveDatePickerPreset } from "./resolvePreset";

type SelectionTransition =
  | {
      source: "manual" | "preset";
      mode: "single";
      value: Date;
      granularity: DatePickerGranularity;
      presetId: string | null;
    }
  | {
      source: "manual" | "preset";
      mode: "range";
      value: DateRangeDraft;
      granularity: DatePickerGranularity;
      presetId: string | null;
      preferredRoleTimes?: DateRange;
    };

type CommittedSelection =
  | { mode: "single"; value: Date }
  | { mode: "range"; value: DateRange };

interface DatePickerMetadata {
  controlledSelectionIdentity: string;
  deferredRequiredValidationIdentity: string | null;
  failedPresetAttempt: {
    controlledSelectionIdentity: string;
    error: string;
  } | null;
  invalidInputIds: Set<string>;
  inputDraftResetRevision: number;
}

interface CurrentPresetResolution {
  presetId: string;
  resolve: DatePickerPreset["resolve"];
  isResolvable: boolean;
  notifyOnInvalid: boolean;
}

type DatePickerMetadataEvent =
  | {
      type: "REQUIRED_VALIDATION_REQUESTED";
      hasRequiredViolation: boolean;
      controlledSelectionIdentity: string;
    }
  | { type: "REQUIRED_VALIDATION_DISMISSED" }
  | {
      type: "PRESET_ATTEMPT_FAILED";
      controlledSelectionIdentity: string;
      error: string;
    }
  | { type: "PRESET_ATTEMPT_CLEARED" }
  | {
      type: "AUTHORITATIVE_SELECTION_CHANGED";
      controlledSelectionIdentity: string;
    }
  | { type: "SELECTION_APPLIED" }
  | { type: "INPUT_VALIDITY_CHANGED"; inputId: string; isValid: boolean };

function createInitialDatePickerMetadata({
  controlledSelectionIdentity,
}: {
  controlledSelectionIdentity: string;
}): DatePickerMetadata {
  return {
    controlledSelectionIdentity,
    deferredRequiredValidationIdentity: null,
    failedPresetAttempt: null,
    invalidInputIds: new Set(),
    inputDraftResetRevision: 0,
  };
}

function datePickerMetadataReducer(
  state: DatePickerMetadata,
  event: DatePickerMetadataEvent,
): DatePickerMetadata {
  switch (event.type) {
    case "REQUIRED_VALIDATION_REQUESTED":
      return {
        ...state,
        deferredRequiredValidationIdentity: event.hasRequiredViolation
          ? event.controlledSelectionIdentity
          : null,
      };
    case "REQUIRED_VALIDATION_DISMISSED":
      return state.deferredRequiredValidationIdentity !== null
        ? { ...state, deferredRequiredValidationIdentity: null }
        : state;
    case "PRESET_ATTEMPT_FAILED":
      return {
        ...state,
        failedPresetAttempt: {
          controlledSelectionIdentity: event.controlledSelectionIdentity,
          error: event.error,
        },
      };
    case "PRESET_ATTEMPT_CLEARED":
      return state.failedPresetAttempt === null
        ? state
        : { ...state, failedPresetAttempt: null };
    case "AUTHORITATIVE_SELECTION_CHANGED":
      return {
        ...state,
        controlledSelectionIdentity: event.controlledSelectionIdentity,
        deferredRequiredValidationIdentity: null,
        failedPresetAttempt: null,
        invalidInputIds: new Set(),
        inputDraftResetRevision: state.inputDraftResetRevision + 1,
      };
    case "SELECTION_APPLIED":
      return {
        ...state,
        deferredRequiredValidationIdentity: null,
        failedPresetAttempt: null,
        invalidInputIds: new Set(),
        inputDraftResetRevision: state.inputDraftResetRevision + 1,
      };
    case "INPUT_VALIDITY_CHANGED": {
      const invalidInputIds = new Set(state.invalidInputIds);
      if (event.isValid) {
        invalidInputIds.delete(event.inputId);
      } else {
        invalidInputIds.add(event.inputId);
      }
      if (
        invalidInputIds.size === state.invalidInputIds.size &&
        invalidInputIds.has(event.inputId) ===
          state.invalidInputIds.has(event.inputId)
      ) {
        return state;
      }
      return { ...state, invalidInputIds };
    }
    default: {
      const exhaustiveCheck: never = event;
      throw new Error(
        `Unhandled DatePicker metadata event: ${String(exhaustiveCheck)}`,
      );
    }
  }
}

function getDateIdentity(value: Date | null): number | null {
  return value?.getTime() ?? null;
}

function normalizePresetId(
  presetId: string | null,
  presets: readonly DatePickerPreset[],
): string | null {
  return presetId !== null &&
    presets.some((preset) => preset.id === presetId && !preset.disabled)
    ? presetId
    : null;
}

function getControlledSelectionIdentity({
  value,
  rangeDraft,
  presetId,
}: Pick<
  UseDatePickerControllerOptions,
  "value" | "rangeDraft" | "presetId"
>): string {
  const valueIdentity =
    value === undefined
      ? "uncontrolled"
      : value instanceof Date
      ? ["single", getDateIdentity(value)]
      : value === null
      ? null
      : ["range", getDateIdentity(value.start), getDateIdentity(value.end)];
  const rangeDraftIdentity =
    rangeDraft === undefined
      ? "uncontrolled"
      : rangeDraft === null
      ? null
      : [getDateIdentity(rangeDraft.start), getDateIdentity(rangeDraft.end)];
  const presetIdentity =
    presetId === undefined ? ["uncontrolled"] : ["controlled", presetId];
  return JSON.stringify([valueIdentity, rangeDraftIdentity, presetIdentity]);
}

function getSelectionMetadata(selection: CommittedSelection) {
  switch (selection.mode) {
    case "single":
      return {
        value: selection.value.toISOString(),
        start: undefined,
        end: undefined,
        mode: selection.mode,
      };
    case "range":
      return {
        value: undefined,
        start: selection.value.start.toISOString(),
        end: selection.value.end.toISOString(),
        mode: selection.mode,
      };
    default: {
      const exhaustiveCheck: never = selection;
      throw new Error(
        `Unhandled DatePicker selection: ${String(exhaustiveCheck)}`,
      );
    }
  }
}

interface UseDatePickerControllerOptions {
  mode: DatePickerMode | undefined;
  defaultMode: DatePickerMode;
  onModeChange: ((mode: DatePickerMode) => void) | undefined;
  includeTime: boolean | undefined;
  granularity: DatePickerGranularity | undefined;
  defaultGranularity: DatePickerGranularity | undefined;
  onGranularityChange:
    | ((granularity: DatePickerGranularity) => void)
    | undefined;
  presets: readonly DatePickerPreset[];
  presetId: string | null | undefined;
  defaultPresetId: string | null;
  onPresetIdChange: ((presetId: string | null) => void) | undefined;
  onValidityChange: ((isValid: boolean) => void) | undefined;
  value: Date | DateRange | null | undefined;
  onValueChange: ((value: Date | DateRange) => void) | undefined;
  rangeDraft: DateRangeDraft | null | undefined;
  onRangeDraftChange: ((value: DateRangeDraft) => void) | undefined;
  required: boolean;
  timeZone: DatePickerTimeZone;
  isDateDisabled: (date: Date) => boolean;
  unavailablePresetLabel: string;
  analyticsName: string | undefined;
}

export function useDatePickerController({
  mode: modeProp,
  defaultMode,
  onModeChange,
  includeTime: includeTimeProp,
  granularity: granularityProp,
  defaultGranularity,
  onGranularityChange,
  presets,
  presetId: presetIdProp,
  defaultPresetId,
  onPresetIdChange,
  onValidityChange,
  value,
  onValueChange,
  rangeDraft,
  onRangeDraftChange,
  required,
  timeZone,
  isDateDisabled,
  unavailablePresetLabel,
  analyticsName,
}: UseDatePickerControllerOptions) {
  const [internalMode, setInternalMode] =
    React.useState<DatePickerMode>(defaultMode);
  const mode = modeProp ?? internalMode;
  const [internalGranularity, setInternalGranularity] =
    React.useState<DatePickerGranularity>(
      () => defaultGranularity ?? (includeTimeProp ? "date-time" : "date"),
    );
  const granularity =
    granularityProp ??
    (includeTimeProp !== undefined
      ? includeTimeProp
        ? "date-time"
        : "date"
      : internalGranularity);
  const [internalPresetId, setInternalPresetId] = React.useState<string | null>(
    () => normalizePresetId(defaultPresetId, presets),
  );
  const selectedPresetId =
    presetIdProp !== undefined ? presetIdProp : internalPresetId;
  const selectedPreset =
    selectedPresetId === null
      ? null
      : presets.find(
          (preset) => preset.id === selectedPresetId && !preset.disabled,
        ) ?? null;
  const [currentPresetResolution, setCurrentPresetResolution] =
    React.useState<CurrentPresetResolution | null>(null);
  const initialDefaultPresetIdRef = React.useRef(
    presetIdProp === undefined ? internalPresetId : null,
  );
  const currentPresetResolutionMatches =
    selectedPreset !== null &&
    currentPresetResolution?.presetId === selectedPresetId &&
    currentPresetResolution.resolve === selectedPreset.resolve;
  const presetIdentityIsPending =
    selectedPreset !== null && !currentPresetResolutionMatches;
  const presetIdentityIsInvalid =
    selectedPresetId !== null &&
    (selectedPreset === null ||
      (currentPresetResolutionMatches &&
        !currentPresetResolution.isResolvable));
  const presetId =
    selectedPresetId === null ||
    (currentPresetResolutionMatches && currentPresetResolution.isResolvable)
      ? selectedPresetId
      : null;
  const controlledSelectionIdentity = getControlledSelectionIdentity({
    value,
    rangeDraft,
    presetId: presetIdProp,
  });
  const [metadata, dispatchMetadata] = React.useReducer(
    datePickerMetadataReducer,
    {
      controlledSelectionIdentity,
    },
    createInitialDatePickerMetadata,
  );
  if (metadata.controlledSelectionIdentity !== controlledSelectionIdentity) {
    dispatchMetadata({
      type: "AUTHORITATIVE_SELECTION_CHANGED",
      controlledSelectionIdentity,
    });
  } else if (
    !required &&
    metadata.deferredRequiredValidationIdentity !== null
  ) {
    dispatchMetadata({ type: "REQUIRED_VALIDATION_DISMISSED" });
  }
  const controlRefs = React.useRef(new Map<string, HTMLElement>());
  const presetControlRef = React.useRef<HTMLElement | null>(null);
  const onValidityChangeRef = React.useRef(onValidityChange);

  const emitSelection = React.useCallback(
    (selection: CommittedSelection) => onValueChange?.(selection.value),
    [onValueChange],
  );
  const trackedSelection = useTrackedCallback(
    analyticsName,
    "DatePicker",
    "change",
    emitSelection,
    getSelectionMetadata,
  );
  const commitRange = React.useCallback(
    (nextRange: DateRange) =>
      trackedSelection({ mode: "range", value: nextRange }),
    [trackedSelection],
  );
  const { rangeValue, emitRange, usesRangeDraftApi } = useDateRangeSelection({
    mode,
    value,
    rangeDraft,
    onRangeDraftChange,
    onCommit: commitRange,
    timeZone,
  });
  const singleValue = mode === "single" && value instanceof Date ? value : null;

  const updatePresetId = React.useCallback(
    (nextPresetId: string | null) => {
      onPresetIdChange?.(nextPresetId);
      if (presetIdProp === undefined) {
        setInternalPresetId(nextPresetId);
      }
    },
    [onPresetIdChange, presetIdProp],
  );

  React.useLayoutEffect(() => {
    if (selectedPresetId === null || selectedPreset === null) {
      if (currentPresetResolution !== null) {
        setCurrentPresetResolution(null);
      }
      return;
    }
    if (currentPresetResolutionMatches) {
      return;
    }

    const isInitialDefault =
      initialDefaultPresetIdRef.current === selectedPresetId;
    initialDefaultPresetIdRef.current = null;
    setCurrentPresetResolution({
      presetId: selectedPresetId,
      resolve: selectedPreset.resolve,
      isResolvable:
        resolveDatePickerPreset(selectedPreset, new Date()) !== null,
      notifyOnInvalid: !isInitialDefault,
    });
  }, [
    currentPresetResolution,
    currentPresetResolutionMatches,
    selectedPreset,
    selectedPresetId,
  ]);

  React.useEffect(() => {
    if (
      presetIdProp === undefined &&
      internalPresetId !== null &&
      !presetIdentityIsPending &&
      presetIdentityIsInvalid
    ) {
      if (
        currentPresetResolutionMatches &&
        !currentPresetResolution.notifyOnInvalid
      ) {
        setInternalPresetId(null);
      } else {
        updatePresetId(null);
      }
    }
  }, [
    currentPresetResolution,
    currentPresetResolutionMatches,
    internalPresetId,
    presetIdentityIsInvalid,
    presetIdentityIsPending,
    presetIdProp,
    updatePresetId,
  ]);

  const clearPresetIdentity = React.useCallback(() => {
    dispatchMetadata({ type: "PRESET_ATTEMPT_CLEARED" });
    if (selectedPresetId !== null) {
      updatePresetId(null);
    }
  }, [dispatchMetadata, selectedPresetId, updatePresetId]);

  const clearRequiredError = React.useCallback(() => {
    dispatchMetadata({ type: "REQUIRED_VALIDATION_DISMISSED" });
  }, [dispatchMetadata]);

  const updateMode = React.useCallback(
    (nextMode: DatePickerMode) => {
      clearPresetIdentity();
      onModeChange?.(nextMode);
      if (modeProp === undefined) {
        setInternalMode(nextMode);
      }
    },
    [clearPresetIdentity, modeProp, onModeChange],
  );

  const updateGranularity = React.useCallback(
    (nextGranularity: DatePickerGranularity) => {
      clearPresetIdentity();
      onGranularityChange?.(nextGranularity);
      if (granularityProp === undefined && includeTimeProp === undefined) {
        setInternalGranularity(nextGranularity);
      }
    },
    [
      clearPresetIdentity,
      granularityProp,
      includeTimeProp,
      onGranularityChange,
    ],
  );

  const applyTransition = React.useCallback(
    (transition: SelectionTransition) => {
      dispatchMetadata({ type: "SELECTION_APPLIED" });
      if (transition.source === "preset") {
        onModeChange?.(transition.mode);
        onGranularityChange?.(transition.granularity);
      }
      if (modeProp === undefined) {
        setInternalMode(transition.mode);
      }
      if (granularityProp === undefined && includeTimeProp === undefined) {
        setInternalGranularity(transition.granularity);
      }
      if (transition.presetId !== selectedPresetId) {
        updatePresetId(transition.presetId);
      }

      switch (transition.mode) {
        case "single":
          trackedSelection({
            mode: transition.mode,
            value: new Date(transition.value),
          });
          break;
        case "range":
          emitRange(
            {
              start: transition.value.start
                ? new Date(transition.value.start)
                : null,
              end: transition.value.end ? new Date(transition.value.end) : null,
            },
            transition.preferredRoleTimes,
          );
          break;
        default: {
          const exhaustiveCheck: never = transition;
          throw new Error(
            `Unhandled DatePicker transition: ${String(exhaustiveCheck)}`,
          );
        }
      }
    },
    [
      emitRange,
      dispatchMetadata,
      granularityProp,
      includeTimeProp,
      modeProp,
      onGranularityChange,
      onModeChange,
      selectedPresetId,
      trackedSelection,
      updatePresetId,
    ],
  );

  const selectPreset = React.useCallback(
    (nextPresetId: string | null): Date | null => {
      if (nextPresetId === null) {
        clearPresetIdentity();
        return null;
      }
      const preset = presets.find((candidate) => candidate.id === nextPresetId);
      if (!preset || preset.disabled) {
        return null;
      }

      const result = resolveDatePickerPreset(preset, new Date());
      if (result === null) {
        dispatchMetadata({
          type: "PRESET_ATTEMPT_FAILED",
          controlledSelectionIdentity,
          error: unavailablePresetLabel,
        });
        return null;
      }
      const dates =
        result.mode === "single"
          ? [result.value]
          : [result.value.start, result.value.end];
      if (dates.some((date) => isDateDisabled(date))) {
        dispatchMetadata({
          type: "PRESET_ATTEMPT_FAILED",
          controlledSelectionIdentity,
          error: unavailablePresetLabel,
        });
        return null;
      }

      setCurrentPresetResolution({
        presetId: preset.id,
        resolve: preset.resolve,
        isResolvable: true,
        notifyOnInvalid: true,
      });
      switch (result.mode) {
        case "single":
          applyTransition({
            source: "preset",
            mode: result.mode,
            value: result.value,
            granularity: result.granularity,
            presetId: preset.id,
          });
          return result.value;
        case "range":
          applyTransition({
            source: "preset",
            mode: result.mode,
            value: result.value,
            granularity: result.granularity,
            presetId: preset.id,
          });
          return result.value.start;
        default: {
          const exhaustiveCheck: never = result;
          throw new Error(
            `Unhandled DatePicker preset: ${String(exhaustiveCheck)}`,
          );
        }
      }
    },
    [
      applyTransition,
      clearPresetIdentity,
      controlledSelectionIdentity,
      dispatchMetadata,
      isDateDisabled,
      presets,
      unavailablePresetLabel,
    ],
  );

  const setInputValidity = React.useCallback(
    (inputId: string, isValid: boolean) => {
      dispatchMetadata({
        type: "INPUT_VALIDITY_CHANGED",
        inputId,
        isValid,
      });
    },
    [dispatchMetadata],
  );

  const registerInvalidControl = React.useCallback(
    (inputId: string, element: HTMLElement | null) => {
      if (element) {
        controlRefs.current.set(inputId, element);
      } else {
        controlRefs.current.delete(inputId);
      }
    },
    [],
  );
  const registerPresetControl = React.useCallback(
    (element: HTMLElement | null) => {
      presetControlRef.current = element;
    },
    [],
  );
  const selectionIsEmpty =
    mode === "single"
      ? singleValue === null
      : !rangeValue?.start && !rangeValue?.end;
  const requiredError =
    metadata.deferredRequiredValidationIdentity ===
      controlledSelectionIdentity &&
    required &&
    selectionIsEmpty;
  const presetError =
    metadata.failedPresetAttempt?.controlledSelectionIdentity ===
    controlledSelectionIdentity
      ? metadata.failedPresetAttempt.error
      : null;
  const getActiveInvalidInputIds = React.useCallback(
    () =>
      Array.from(metadata.invalidInputIds).filter((inputId) =>
        controlRefs.current.has(inputId),
      ),
    [metadata.invalidInputIds],
  );
  const validate = React.useCallback(() => {
    const hasRequiredError = required && selectionIsEmpty;
    dispatchMetadata({
      type: "REQUIRED_VALIDATION_REQUESTED",
      hasRequiredViolation: hasRequiredError,
      controlledSelectionIdentity,
    });
    return (
      !hasRequiredError &&
      presetError === null &&
      getActiveInvalidInputIds().length === 0
    );
  }, [
    controlledSelectionIdentity,
    dispatchMetadata,
    getActiveInvalidInputIds,
    presetError,
    required,
    selectionIsEmpty,
  ]);
  const isValid =
    presetError === null &&
    metadata.invalidInputIds.size === 0 &&
    !requiredError;
  const focusFirstInvalidControl = React.useCallback(() => {
    const hasRequiredError = required && selectionIsEmpty;
    const candidates = [
      ...(presetError && presetControlRef.current
        ? [presetControlRef.current]
        : []),
      ...(hasRequiredError
        ? Array.from(controlRefs.current.values()).filter(
            (element) =>
              !("disabled" in element) ||
              !(element as HTMLInputElement | HTMLButtonElement).disabled,
          )
        : []),
      ...getActiveInvalidInputIds()
        .map((inputId) => controlRefs.current.get(inputId))
        .filter((element): element is HTMLElement => element !== undefined),
    ]
      .filter((element, index, all) => all.indexOf(element) === index)
      .sort((first, second) =>
        first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      );
    candidates[0]?.focus();
    return candidates.length > 0;
  }, [getActiveInvalidInputIds, presetError, required, selectionIsEmpty]);

  React.useEffect(() => {
    onValidityChangeRef.current = onValidityChange;
  }, [onValidityChange]);

  React.useEffect(() => {
    onValidityChangeRef.current?.(isValid);
  }, [isValid]);

  return {
    mode,
    updateMode,
    granularity,
    updateGranularity,
    includeTime: granularity === "date-time",
    presets,
    presetId,
    selectPreset,
    presetError,
    requiredError,
    inputDraftResetRevision: metadata.inputDraftResetRevision,
    clearRequiredError,
    setInputValidity,
    registerInvalidControl,
    registerPresetControl,
    focusFirstInvalidControl,
    validate,
    clearPresetIdentity,
    applyTransition,
    singleValue,
    rangeValue,
    usesRangeDraftApi,
  };
}
