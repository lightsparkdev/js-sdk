import * as React from "react";
import type { DateRange, DateRangeDraft } from "../DatePicker";
import {
  canonicalizeDateFilterBounds,
  getDateFilterDefaultRange,
  normalizeDateFilterPresetIdentity,
  type DateFilterDescriptor,
  type DateFilterState,
} from "./filter-model";

export interface DateFilterDraft {
  start: Date | null;
  end: Date | null;
  presetId: string | null;
}

interface DateFilterDraftState {
  draft: DateFilterDraft;
  isValid: boolean;
}

type NormalizeCustomRangeDraft = (range: DateRangeDraft) => DateRangeDraft;

type DateFilterDraftAction =
  | { type: "external-resync"; draft: DateFilterDraft }
  | { type: "reset"; draft: DateFilterDraft }
  | { type: "edit-preset"; presetId: string | null }
  | { type: "edit-value"; value: Date | DateRange }
  | {
      type: "edit-range";
      range: DateRangeDraft;
      normalizeCustomRangeDraft: NormalizeCustomRangeDraft | undefined;
    }
  | { type: "set-validity"; isValid: boolean };

interface CommittedDateFilterDraft {
  start: number | null;
  end: number | null;
  presetId: string | null;
}

function getDateFilterMode(
  descriptor: DateFilterDescriptor<string>,
): "single" | "range" {
  return descriptor.datePicker?.mode ?? "range";
}

function getDateFilterDraft(
  descriptor: DateFilterDescriptor<string>,
  state: DateFilterState,
  useDefaultRange: boolean,
): DateFilterDraft {
  const range =
    state.start || state.end || !useDefaultRange
      ? state
      : getDateFilterDefaultRange(descriptor);
  const bounds = canonicalizeDateFilterBounds({
    start: range?.start ? new Date(range.start) : null,
    end: range?.end ? new Date(range.end) : null,
    mode: getDateFilterMode(descriptor),
  });
  return normalizeDateFilterPresetIdentity(descriptor, {
    start: bounds.start,
    end: bounds.end,
    presetId: descriptor.datePicker ? state.presetId ?? null : null,
  });
}

function getCommittedDraft(
  descriptor: DateFilterDescriptor<string>,
  state: DateFilterState,
): CommittedDateFilterDraft {
  const draft = canonicalizeDateFilterBounds({
    start: state.start,
    end: state.end,
    mode: getDateFilterMode(descriptor),
  });
  return {
    start: draft.start?.getTime() ?? null,
    end: draft.end?.getTime() ?? null,
    presetId: descriptor.datePicker ? state.presetId ?? null : null,
  };
}

function normalizeCustomRange(
  current: DateFilterDraft,
  range: DateRangeDraft,
  normalizer: NormalizeCustomRangeDraft | undefined,
): DateRangeDraft {
  return current.presetId === null && normalizer ? normalizer(range) : range;
}

function dateFilterDraftReducer(
  current: DateFilterDraftState,
  action: DateFilterDraftAction,
): DateFilterDraftState {
  switch (action.type) {
    case "external-resync":
    case "reset":
      return {
        draft: action.draft,
        isValid: true,
      };
    case "edit-preset":
      return {
        ...current,
        draft: { ...current.draft, presetId: action.presetId },
      };
    case "edit-value":
      return {
        ...current,
        draft:
          action.value instanceof Date
            ? {
                ...current.draft,
                start: new Date(action.value),
                end: new Date(action.value),
              }
            : {
                ...current.draft,
                start: new Date(action.value.start),
                end: new Date(action.value.end),
              },
      };
    case "edit-range": {
      const range = normalizeCustomRange(
        current.draft,
        action.range,
        action.normalizeCustomRangeDraft,
      );
      return {
        ...current,
        draft: {
          ...current.draft,
          start: range.start ? new Date(range.start) : null,
          end: range.end ? new Date(range.end) : null,
        },
      };
    }
    case "set-validity":
      return current.isValid === action.isValid
        ? current
        : { ...current, isValid: action.isValid };
    default: {
      const exhaustiveCheck: never = action;
      throw new Error(
        `Unhandled date filter draft action: ${String(exhaustiveCheck)}`,
      );
    }
  }
}

export function useDateFilterDraft(
  descriptor: DateFilterDescriptor<string>,
  state: DateFilterState,
) {
  const [initialDraft] = React.useState(() =>
    getDateFilterDraft(descriptor, state, true),
  );
  const [draftState, dispatch] = React.useReducer(dateFilterDraftReducer, {
    draft: initialDraft,
    isValid: true,
  });
  const [maxDate] = React.useState<Date | undefined>(() =>
    descriptor.allowFuture === false ? new Date() : undefined,
  );
  const {
    start: committedStart,
    end: committedEnd,
    presetId: committedPresetId,
  } = getCommittedDraft(descriptor, state);
  const previousCommitted = React.useRef({
    start: committedStart,
    end: committedEnd,
    presetId: committedPresetId,
  });

  React.useEffect(() => {
    const previous = previousCommitted.current;
    if (
      previous.start === committedStart &&
      previous.end === committedEnd &&
      previous.presetId === committedPresetId
    ) {
      return;
    }
    previousCommitted.current = {
      start: committedStart,
      end: committedEnd,
      presetId: committedPresetId,
    };
    dispatch({
      type: "external-resync",
      draft: getDateFilterDraft(descriptor, state, false),
    });
  }, [committedEnd, committedPresetId, committedStart, descriptor, state]);

  const reset = React.useCallback(() => {
    dispatch({
      type: "reset",
      draft: getDateFilterDraft(descriptor, state, false),
    });
  }, [descriptor, state]);
  const normalizeCustomRangeDraft =
    descriptor.datePicker?.mode === "range"
      ? descriptor.datePicker.normalizeCustomRangeDraft
      : undefined;

  const projectApply = React.useCallback((): DateFilterState | null => {
    const { isValid } = draftState;
    const draft = canonicalizeDateFilterBounds({
      ...draftState.draft,
      mode: getDateFilterMode(descriptor),
    });
    if (!isValid || (!draft.start && !draft.end)) {
      return null;
    }
    const nextState = {
      type: "date" as const,
      start: draft.start ? new Date(draft.start) : null,
      end: draft.end ? new Date(draft.end) : null,
      isApplied: true,
    };
    return descriptor.datePicker
      ? {
          ...nextState,
          presetId: draft.presetId,
        }
      : nextState;
  }, [descriptor, draftState]);
  const editPreset = React.useCallback(
    (presetId: string | null) => dispatch({ type: "edit-preset", presetId }),
    [],
  );
  const editValue = React.useCallback(
    (value: Date | DateRange) => dispatch({ type: "edit-value", value }),
    [],
  );
  const editRange = React.useCallback(
    (range: DateRangeDraft) =>
      dispatch({
        type: "edit-range",
        range,
        normalizeCustomRangeDraft,
      }),
    [normalizeCustomRangeDraft],
  );
  const setValidity = React.useCallback(
    (isValid: boolean) => dispatch({ type: "set-validity", isValid }),
    [],
  );

  return {
    draft: draftState.draft,
    initialMonth: initialDraft.start ?? initialDraft.end,
    maxDate,
    editPreset,
    editValue,
    editRange,
    setValidity,
    reset,
    projectApply,
  };
}
