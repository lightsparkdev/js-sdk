"use client";

import * as React from "react";
import clsx from "clsx";
import { devWarnOnce } from "../../lib/dev-warn";
import { humanizeIdentifier } from "../../lib/formatters";
import { Button } from "../Button";
import { ChipFilter } from "../Chip";
import * as DatePicker from "../DatePicker";
import { CentralIcon } from "../Icon";
import { Input } from "../Input";
import { Menu } from "../Menu";
import { Popover } from "../Popover";
import styles from "./FilterBar.module.scss";
import {
  getDateFilterDefaultRange,
  isEnumFilterOptionApplied,
  toEnumOptionValueArray,
  type DateFilterDescriptor,
  type DateFilterState,
  type EnumFilterDescriptor,
  type EnumFilterState,
  type FilterDescriptor,
  type FilterDescriptorTuple,
  type FilterState,
  type StringFilterDescriptor,
  type StringFilterState,
} from "./filter-model";
import { type FiltersModel, type UpdateFilter } from "./useFilters";

/** Generic filter-bar chrome configured once on `FilterBar.Root`. */
export interface FilterBarConfig {
  /**
   * ChipFilter operator text between the filter's label and value
   * (e.g. "is").
   */
  operator: string;
  /**
   * Pill value text while a filter is applied but has no value yet
   * (e.g. "Empty").
   */
  emptyValue: string;
  /** Commit button inside string and date value editors. */
  apply: string;
  /** Add-filter trigger text and accessible name. */
  addFilter: string;
  /** Clear-all-filters action text. */
  clearFilters: string;
}

const DEFAULT_CONFIG: FilterBarConfig = {
  operator: "is",
  emptyValue: "Empty",
  apply: "Apply",
  addFilter: "Filter",
  clearFilters: "Clear",
};

interface ErasedFiltersModel {
  descriptors: FilterDescriptorTuple;
  states: Record<string, FilterState | undefined>;
  appliedCount: number;
  addFilter: (
    descriptor: FilterDescriptor<string>,
    options?: Parameters<FiltersModel["addFilter"]>[1],
  ) => void;
  updateFilter: (id: string, state: FilterState) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  openEditorId: string | null;
  setEditorOpen: (id: string, open: boolean) => void;
}

interface FilterBarContextValue {
  model: ErasedFiltersModel;
  config: FilterBarConfig;
  formatDateValue: (start: Date, end: Date) => string;
}

const FilterBarContext = React.createContext<FilterBarContextValue | null>(
  null,
);

function useFilterBarContext(): FilterBarContextValue {
  const context = React.useContext(FilterBarContext);
  if (context === null) {
    throw new Error("FilterBar parts must be placed within <FilterBar.Root>.");
  }
  return context;
}

/**
 * Controlled open state for a pill's value editor, backed by the model
 * (`openEditorId`/`setEditorOpen`) so external callers — e.g. a command
 * surface via `addFilter({ openEditor: true })` — open the same
 * Popover/Menu the pill trigger does.
 */
function useEditorOpenState(id: string) {
  const { model } = useFilterBarContext();
  return {
    isOpen: model.openEditorId === id,
    setIsOpen: (open: boolean) => model.setEditorOpen(id, open),
  };
}

export interface RootProps<TDescriptors extends FilterDescriptorTuple>
  extends Omit<React.ComponentPropsWithoutRef<"div">, "children"> {
  model: FiltersModel<TDescriptors>;
  /** Cohesive overrides for generic filter-bar chrome. */
  config?: Partial<FilterBarConfig>;
  /**
   * Format an applied date range for the pill value text. Defaults to a
   * fixed UTC `MMM dd, HH:mm - MMM dd, HH:mm` rendering; consumers with
   * locale or timezone requirements supply their own.
   */
  formatDateValue?: (start: Date, end: Date) => string;
  children?: React.ReactNode;
}

/**
 * Filter bar row providing model context. Children compose `FilterBar`
 * parts (`Pills`, `AddButton`, `Clear`) in any order; consumers can also
 * omit parts or place their own controls alongside.
 */
function Root<const TDescriptors extends FilterDescriptorTuple>({
  children,
  className,
  config,
  formatDateValue = defaultFormatDateValue,
  model,
  ...props
}: RootProps<TDescriptors>) {
  const resolvedConfig = React.useMemo<FilterBarConfig>(
    () => ({
      ...DEFAULT_CONFIG,
      ...config,
    }),
    [config],
  );
  const contextValue = React.useMemo<FilterBarContextValue>(
    () => ({
      // React context cannot retain Root's descriptor-tuple generic. Erase
      // it behind wrappers that only dispatch descriptors/ids originating
      // from this exact model. updateFilter additionally validates the
      // runtime discriminant before crossing the erased seam.
      model: {
        descriptors: model.descriptors,
        states: model.states,
        appliedCount: model.appliedCount,
        addFilter: (descriptor, options) => {
          const ownedDescriptor = model.descriptors.find(
            (candidate) => candidate.id === descriptor.id,
          );
          if (ownedDescriptor) {
            model.addFilter(ownedDescriptor, options);
          }
        },
        updateFilter: (id: string, state: FilterState) => {
          const descriptor = model.descriptors.find(
            (candidate) => candidate.id === id,
          );
          if (!descriptor || descriptor.type !== state.type) {
            devWarnOnce(
              `[FilterBar] Ignored a "${state.type}" state update for the "${id}" filter.`,
            );
            return;
          }
          (model.updateFilter as UpdateFilter<FilterDescriptorTuple>)(
            id,
            state,
          );
        },
        removeFilter: (id) => {
          const descriptor = model.descriptors.find(
            (candidate) => candidate.id === id,
          );
          if (descriptor) {
            model.removeFilter(descriptor.id);
          }
        },
        clearFilters: model.clearFilters,
        openEditorId: model.openEditorId,
        setEditorOpen: (id, open) => {
          const descriptor = model.descriptors.find(
            (candidate) => candidate.id === id,
          );
          if (descriptor) {
            model.setEditorOpen(descriptor.id, open);
          }
        },
      },
      config: resolvedConfig,
      formatDateValue,
    }),
    [model, resolvedConfig, formatDateValue],
  );

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div className={clsx(styles.root, className)} {...props}>
        {children === undefined ? (
          <>
            <Pills />
            <AddButton />
            <Clear />
          </>
        ) : (
          children
        )}
      </div>
    </FilterBarContext.Provider>
  );
}

export interface PillProps {
  id: string;
}

/** A single applied-filter pill. Renders nothing while unapplied. */
function Pill({ id }: PillProps) {
  const { model, config, formatDateValue } = useFilterBarContext();
  const descriptor = model.descriptors.find((candidate) => candidate.id === id);
  const state = model.states[id];
  if (!descriptor || !state?.isApplied) {
    return null;
  }

  return (
    <ChipFilter
      data-filter-id={descriptor.id}
      size="sm"
      property={descriptor.label}
      operator={config.operator}
      value={<PillValueEditor descriptor={descriptor} state={state} />}
      valueLabel={getFilterValueLabel(descriptor, state, {
        emptyValue: config.emptyValue,
        formatDateValue,
      })}
      onDismiss={() => model.removeFilter(descriptor.id)}
    />
  );
}

/** All applied-filter pills, in descriptor order. */
function Pills() {
  const { model } = useFilterBarContext();
  return (
    <>
      {model.descriptors.map((descriptor) => (
        <Pill key={descriptor.id} id={descriptor.id} />
      ))}
    </>
  );
}

export interface AddButtonProps {
  /**
   * Trigger label. Rendered as the button text while no filter is
   * applied; once filters are applied the trigger collapses to an
   * icon-only button and the label becomes its accessible name.
   */
  label?: string;
}

function AddButton({ label }: AddButtonProps) {
  const { config, model } = useFilterBarContext();
  const resolvedLabel = label ?? config.addFilter;
  const hasAppliedFilters = model.appliedCount > 0;

  return (
    <Menu.Root>
      <Menu.Trigger
        render={
          hasAppliedFilters ? (
            <Button
              variant="outline"
              size="dense"
              iconOnly
              aria-label={resolvedLabel}
              leadingIcon={<CentralIcon name="IconPlusLarge" size={16} />}
            />
          ) : (
            <Button
              variant="outline"
              size="dense"
              leadingIcon={<CentralIcon name="IconFilter2" size={16} />}
            />
          )
        }
      >
        {hasAppliedFilters ? null : resolvedLabel}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start">
          <Menu.Popup>
            {model.descriptors.map((descriptor) =>
              descriptor.type === "enum" ? (
                <Menu.SubmenuRoot key={descriptor.id}>
                  <Menu.SubmenuTrigger>
                    <span className={styles.submenuLabel}>
                      {descriptor.label}
                    </span>
                    {model.states[descriptor.id]?.isApplied && (
                      <span className={styles.activeDot} />
                    )}
                    <CentralIcon name="IconChevronRightSmall" size={16} />
                  </Menu.SubmenuTrigger>
                  <Menu.Portal>
                    <Menu.Positioner align="start">
                      <Menu.Popup>
                        <AddMenuEnumOptions descriptor={descriptor} />
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.SubmenuRoot>
              ) : (
                <Menu.Item
                  key={descriptor.id}
                  onClick={() =>
                    model.addFilter(descriptor, { openEditor: true })
                  }
                >
                  {descriptor.label}
                </Menu.Item>
              ),
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function AddMenuEnumOptions({
  descriptor,
}: {
  descriptor: EnumFilterDescriptor<string>;
}) {
  const { model } = useFilterBarContext();
  const state = model.states[descriptor.id];

  if (descriptor.isMulti) {
    return (
      <>
        {descriptor.options.map((option) => (
          <Menu.CheckboxItem
            key={option.label}
            checked={isEnumFilterOptionApplied(state, option)}
            closeOnClick={false}
            onCheckedChange={() =>
              model.addFilter(descriptor, { enumValue: option })
            }
          >
            <Menu.CheckboxItemIndicator />
            {option.label}
          </Menu.CheckboxItem>
        ))}
      </>
    );
  }

  const selectedLabel =
    descriptor.options.find((option) =>
      isEnumFilterOptionApplied(state, option),
    )?.label ?? "";

  return (
    <Menu.RadioGroup
      value={selectedLabel}
      onValueChange={(label) => {
        const option = descriptor.options.find(
          (candidate) => candidate.label === label,
        );
        if (option) {
          model.addFilter(descriptor, { enumValue: option });
        }
      }}
    >
      {descriptor.options.map((option) => (
        <Menu.RadioItem key={option.label} value={option.label}>
          <Menu.RadioItemIndicator />
          {option.label}
        </Menu.RadioItem>
      ))}
    </Menu.RadioGroup>
  );
}

export interface ClearProps {
  label?: string;
}

/** Clear-all action, right-aligned. Hidden while no filter is applied. */
function Clear({ label }: ClearProps) {
  const { config, model } = useFilterBarContext();
  if (model.appliedCount === 0) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="dense"
      className={styles.clearButton}
      onClick={model.clearFilters}
    >
      {label ?? config.clearFilters}
    </Button>
  );
}

function PillValueEditor({
  descriptor,
  state,
}: {
  descriptor: FilterDescriptor<string>;
  state: FilterState;
}) {
  switch (state.type) {
    case "enum":
      return descriptor.type === "enum" ? (
        <EnumValueEditor descriptor={descriptor} state={state} />
      ) : (
        reportFilterStateMismatch(descriptor, state)
      );
    case "string":
      return descriptor.type === "string" ? (
        <StringValueEditor descriptor={descriptor} state={state} />
      ) : (
        reportFilterStateMismatch(descriptor, state)
      );
    case "date":
      return descriptor.type === "date" ? (
        <DateValueEditor descriptor={descriptor} state={state} />
      ) : (
        reportFilterStateMismatch(descriptor, state)
      );
    default: {
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled filter type: ${String(exhaustiveCheck)}`);
    }
  }
}

function reportFilterStateMismatch(
  descriptor: FilterDescriptor<string>,
  state: FilterState,
): null {
  devWarnOnce(
    `[FilterBar] The "${descriptor.id}" descriptor is "${descriptor.type}" but its state is "${state.type}".`,
  );
  return null;
}

/**
 * The pill's interactive value segment. Composes Origin's
 * `ChipFilter.Trigger` (segment padding, hover, focus) and adds the
 * empty-value treatment.
 */
const PillValueTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof ChipFilter.Trigger> & {
    "data-empty"?: boolean | undefined;
  }
>(function PillValueTrigger({ className, ...props }, ref) {
  return (
    <ChipFilter.Trigger
      ref={ref}
      className={clsx(styles.pillValueTrigger, className)}
      {...props}
    />
  );
});

function EnumValueEditor({
  descriptor,
  state,
}: {
  descriptor: EnumFilterDescriptor<string>;
  state: EnumFilterState;
}) {
  const { config, formatDateValue } = useFilterBarContext();
  const { isOpen, setIsOpen } = useEditorOpenState(descriptor.id);
  const valueLabel = getFilterValueLabel(descriptor, state, {
    emptyValue: config.emptyValue,
    formatDateValue,
  });

  return (
    <Menu.Root open={isOpen} onOpenChange={setIsOpen}>
      <Menu.Trigger
        render={
          <PillValueTrigger
            data-empty={state.appliedValues.length === 0 || undefined}
          />
        }
      >
        {valueLabel}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start">
          <Menu.Popup>
            {/* Same checked items and seam transitions as the add-menu
                submenu; the two surfaces cannot drift. */}
            <AddMenuEnumOptions descriptor={descriptor} />
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function StringValueEditor({
  descriptor,
  state,
}: {
  descriptor: StringFilterDescriptor<string>;
  state: StringFilterState;
}) {
  const { model, config, formatDateValue } = useFilterBarContext();
  const { isOpen, setIsOpen } = useEditorOpenState(descriptor.id);
  const [draft, setDraft] = React.useState("");
  const [showError, setShowError] = React.useState(false);
  const valueLabel = getFilterValueLabel(descriptor, state, {
    emptyValue: config.emptyValue,
    formatDateValue,
  });
  const appliedValue = state.value ?? "";

  React.useEffect(() => {
    if (isOpen) {
      setDraft(appliedValue);
      setShowError(false);
    }
  }, [isOpen, appliedValue]);

  const applyDraft = () => {
    if (draft.trim() === "") {
      model.updateFilter(descriptor.id, {
        ...state,
        value: null,
        isApplied: true,
      });
      setIsOpen(false);
      return;
    }

    const value = descriptor.normalizeValue
      ? descriptor.normalizeValue(draft)
      : draft.trim();
    if (value === null) {
      setShowError(true);
      return;
    }

    model.updateFilter(descriptor.id, {
      ...state,
      value: value || null,
      isApplied: true,
    });
    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        render={
          <PillValueTrigger data-empty={state.value === null || undefined} />
        }
      >
        {valueLabel}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={4}>
          <Popover.Popup>
            <div className={styles.textEditorBody}>
              <Input
                aria-label={descriptor.label}
                {...(descriptor.placeholder !== undefined
                  ? { placeholder: descriptor.placeholder }
                  : {})}
                value={draft}
                aria-invalid={showError || undefined}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setDraft(event.target.value);
                  setShowError(false);
                }}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                  if (event.key === "Enter") {
                    applyDraft();
                  }
                }}
                autoFocus
              />
              {showError && descriptor.errorMessage && (
                <span className={styles.editorError} role="alert">
                  {descriptor.errorMessage}
                </span>
              )}
              <Button variant="filled" size="compact" onClick={applyDraft}>
                {config.apply}
              </Button>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

interface DateEditorDraft {
  start: Date | null;
  end: Date | null;
}

function getDateEditorSeed(
  descriptor: DateFilterDescriptor<string>,
  state: DateFilterState,
): DateEditorDraft | null {
  if (state.start || state.end) {
    return {
      start: state.start ? new Date(state.start) : null,
      end: state.end ? new Date(state.end) : null,
    };
  }
  const defaultRange = getDateFilterDefaultRange(descriptor);
  return defaultRange
    ? {
        start: new Date(defaultRange.start),
        end: new Date(defaultRange.end),
      }
    : null;
}

function DateValueEditorContent({
  descriptor,
  state,
  onClose,
}: {
  descriptor: DateFilterDescriptor<string>;
  state: DateFilterState;
  onClose: () => void;
}) {
  const { model, config } = useFilterBarContext();
  const [seed] = React.useState(() => getDateEditorSeed(descriptor, state));
  const [draft, setDraft] = React.useState<DateEditorDraft | null>(seed);
  const [maxDate] = React.useState<Date | undefined>(() =>
    descriptor.allowFuture === false ? new Date() : undefined,
  );
  const initialMonth = seed?.start ?? seed?.end;
  const committedStart = state.start?.getTime() ?? null;
  const committedEnd = state.end?.getTime() ?? null;
  const previousCommittedRange = React.useRef({
    start: committedStart,
    end: committedEnd,
  });

  React.useEffect(() => {
    if (
      previousCommittedRange.current.start === committedStart &&
      previousCommittedRange.current.end === committedEnd
    ) {
      return;
    }
    previousCommittedRange.current = {
      start: committedStart,
      end: committedEnd,
    };
    setDraft(
      committedStart === null && committedEnd === null
        ? null
        : {
            start: committedStart === null ? null : new Date(committedStart),
            end: committedEnd === null ? null : new Date(committedEnd),
          },
    );
  }, [committedStart, committedEnd]);

  const applyDraft = () => {
    if (!draft || (!draft.start && !draft.end)) {
      return;
    }
    model.updateFilter(descriptor.id, {
      ...state,
      start: draft.start ? new Date(draft.start) : null,
      end: draft.end ? new Date(draft.end) : null,
      isApplied: true,
    });
    onClose();
  };

  return (
    <DatePicker.Root
      mode="range"
      includeTime
      timeZone="UTC"
      rangeDraft={draft}
      {...(initialMonth ? { defaultMonth: initialMonth } : {})}
      onRangeDraftChange={setDraft}
      {...(maxDate ? { max: maxDate } : {})}
    >
      <DatePicker.Header />
      <DatePicker.Navigation />
      <DatePicker.Grid />
      <DatePicker.Footer>
        <Button
          variant="outline"
          size="compact"
          className={styles.dateApplyButton}
          onClick={applyDraft}
        >
          {config.apply}
        </Button>
      </DatePicker.Footer>
    </DatePicker.Root>
  );
}

function DateValueEditor({
  descriptor,
  state,
}: {
  descriptor: DateFilterDescriptor<string>;
  state: DateFilterState;
}) {
  const { config, formatDateValue } = useFilterBarContext();
  const { isOpen, setIsOpen } = useEditorOpenState(descriptor.id);
  const valueLabel = getFilterValueLabel(descriptor, state, {
    emptyValue: config.emptyValue,
    formatDateValue,
  });

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        render={
          <PillValueTrigger
            data-empty={(!state.start && !state.end) || undefined}
          />
        }
      >
        {valueLabel}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner align="start" sideOffset={4}>
          <Popover.Popup>
            {isOpen ? (
              <DateValueEditorContent
                descriptor={descriptor}
                state={state}
                onClose={() => setIsOpen(false)}
              />
            ) : null}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/**
 * Plain-text label for a filter's applied value: pill trigger text and the
 * ChipFilter dismiss aria-label fallback.
 */
function getFilterValueLabel(
  descriptor: FilterDescriptor<string>,
  state: FilterState,
  {
    emptyValue,
    formatDateValue,
  }: {
    emptyValue: string;
    formatDateValue: (start: Date, end: Date) => string;
  },
): string {
  switch (state.type) {
    case "enum": {
      if (descriptor.type !== "enum") {
        reportFilterStateMismatch(descriptor, state);
        return emptyValue;
      }
      return (
        getEnumValueLabels(descriptor, state.appliedValues).join(", ") ||
        emptyValue
      );
    }
    case "string":
      if (descriptor.type !== "string") {
        reportFilterStateMismatch(descriptor, state);
        return emptyValue;
      }
      return state.value ?? emptyValue;
    case "date": {
      if (descriptor.type !== "date") {
        reportFilterStateMismatch(descriptor, state);
        return emptyValue;
      }
      return state.start && state.end
        ? formatDateValue(state.start, state.end)
        : emptyValue;
    }
    default: {
      const exhaustiveCheck: never = state;
      throw new Error(`Unhandled filter type: ${String(exhaustiveCheck)}`);
    }
  }
}

/**
 * Labels for an applied enum value list, in applied order. Array-valued
 * options apply as several primitive values, so each applied value looks
 * up any option whose value set contains it and the option's label is
 * deduped — an applied `["A", "B"]` option reads as its label once, never
 * as two fabricated per-value labels.
 */
function getEnumValueLabels(
  descriptor: EnumFilterDescriptor<string>,
  appliedValues: readonly string[],
): string[] {
  const labels: string[] = [];
  for (const value of appliedValues) {
    const option = descriptor.options.find((candidate) =>
      toEnumOptionValueArray(candidate.value).includes(value),
    );
    const label = option?.label ?? prettifyEnumValue(descriptor, value);
    if (!labels.includes(label)) {
      labels.push(label);
    }
  }
  return labels;
}

/**
 * Last-resort pill text for an applied enum value no descriptor option
 * covers ("SOME_VALUE" → "Some value"). URL hydration validates enum
 * params against the option set, so this only fires for controlled states
 * a consumer seeded with values missing from `options` — a consumer bug,
 * warned in dev. The fabricated label keeps the pill legible instead of
 * leaking a raw enum constant.
 */
function prettifyEnumValue(
  descriptor: EnumFilterDescriptor<string>,
  value: string,
): string {
  devWarnOnce(
    `[FilterBar] Applied value "${value}" on the "${descriptor.id}" enum ` +
      `filter matches none of the descriptor's options; its pill label is ` +
      `being fabricated from the raw value. Add the option (or stop ` +
      `seeding the value) so the descriptor owns the label.`,
  );
  return humanizeIdentifier(value);
}

const utcDateValueFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "UTC",
});

function defaultFormatDateValue(start: Date, end: Date): string {
  return `${utcDateValueFormat.format(start)} - ${utcDateValueFormat.format(
    end,
  )}`;
}

export const FilterBar = {
  Root,
  Pills,
  Pill,
  AddButton,
  Clear,
};

if (process.env.NODE_ENV !== "production") {
  Root.displayName = "FilterBarRoot";
  Pills.displayName = "FilterBarPills";
  Pill.displayName = "FilterBarPill";
  AddButton.displayName = "FilterBarAddButton";
  Clear.displayName = "FilterBarClear";
  PillValueTrigger.displayName = "FilterBarPillValueTrigger";
}
