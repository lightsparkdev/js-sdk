"use client";

import * as React from "react";
import clsx from "clsx";
import { devWarnOnce } from "../../lib/dev-warn";
import { humanizeIdentifier } from "../../lib/formatters";
import { Button } from "../Button";
import { ChipFilter } from "../Chip";
import { CentralIcon } from "../Icon";
import { Input } from "../Input";
import { stripNonPrintable } from "../../lib/text";
import { Menu } from "../Menu";
import { Popover } from "../Popover";
import styles from "./FilterBar.module.scss";
import {
  DatePresetShortcutOptions,
  DateValueEditorContent,
} from "./datePresetParts";
import {
  isEnumFilterOptionApplied,
  matchesEnumFilterOption,
  toEnumOptionValueArray,
} from "./enumOptions";
import {
  DEFAULT_CONFIG,
  FilterBarContext,
  useEditorOpenState,
  useFilterBarContext,
  type FilterBarConfig,
  type FilterBarContextValue,
  type ResolvedFilterBarConfig,
} from "./filterBarContext";
import {
  resolveAppliedFilterIds,
  type DateFilterDescriptor,
  type DateFilterState,
  type EnumFilterDescriptor,
  type EnumFilterOption,
  type EnumFilterState,
  type FilterDescriptor,
  type FilterDescriptorTuple,
  type FilterState,
  type StringFilterDescriptor,
  type StringFilterState,
} from "./filter-model";
import { resolveFilterOperator } from "./filterOperators";
import { type FiltersModel, type UpdateFilter } from "./useFilters";

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
  const resolvedConfig = React.useMemo<ResolvedFilterBarConfig>(
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
        appliedFilterIds:
          model.appliedFilterIds ??
          resolveAppliedFilterIds(model.descriptors, model.states),
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
        discardsEmptyFilters: model.discardsEmptyFilters ?? false,
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
  const operatorLabel =
    resolveFilterOperator(descriptor, state.operator)?.label ?? config.operator;

  return (
    <ChipFilter
      data-filter-id={descriptor.id}
      size="sm"
      property={descriptor.label}
      operator={
        descriptor.operators && descriptor.operators.length > 1 ? (
          <OperatorEditor descriptor={descriptor} state={state} />
        ) : (
          operatorLabel
        )
      }
      operatorLabel={operatorLabel}
      value={<PillValueEditor descriptor={descriptor} state={state} />}
      valueLabel={getFilterValueLabel(descriptor, state, {
        emptyValue: config.emptyValue,
        formatDateValue,
      })}
      onDismiss={() => model.removeFilter(descriptor.id)}
    />
  );
}

function OperatorEditor({
  descriptor,
  state,
}: {
  descriptor: FilterDescriptor<string>;
  state: FilterState;
}) {
  const { model } = useFilterBarContext();
  const options = descriptor.operators ?? [];
  const selected = resolveFilterOperator(descriptor, state.operator);
  const selectedValue = selected?.value ?? "";
  const selectedLabel = selected?.label ?? "";

  return (
    <Menu.Root>
      <Menu.Trigger
        render={<ChipFilter.Trigger />}
        aria-label={`${descriptor.label} operator: ${selectedLabel}`}
      >
        {selectedLabel}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner align="start">
          <Menu.Popup>
            <Menu.RadioGroup
              value={selectedValue}
              onValueChange={(value: string) => {
                const operator = resolveFilterOperator(descriptor, value)
                  ?.value;
                if (operator !== undefined) {
                  model.updateFilter(descriptor.id, { ...state, operator });
                }
              }}
            >
              {options.map((option) => (
                <Menu.RadioItem
                  key={option.value}
                  value={option.value}
                  closeOnClick
                >
                  <Menu.RadioItemIndicator />
                  {option.label}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

/** All applied-filter pills, in the model's resolved order. */
function Pills() {
  const { model } = useFilterBarContext();
  return (
    <>
      {model.appliedFilterIds.map((id) => (
        <Pill key={id} id={id} />
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
            {model.descriptors.map((descriptor) => (
              <React.Fragment key={descriptor.id}>
                {descriptor.addMenuSeparatorBefore ? <Menu.Separator /> : null}
                {descriptor.type === "enum" ? (
                  <Menu.SubmenuRoot>
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
                          <AddMenuEnumOptions
                            descriptor={descriptor}
                            closeOnSelection
                            removeWhenEmptied
                          />
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                ) : descriptor.type === "date" &&
                  descriptor.datePicker?.showPresetShortcutsInAddMenu &&
                  descriptor.datePicker.presets?.length ? (
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger>
                      <span className={styles.submenuLabel}>
                        {descriptor.label}
                      </span>
                      <CentralIcon name="IconChevronRightSmall" size={16} />
                    </Menu.SubmenuTrigger>
                    <Menu.Portal>
                      <Menu.Positioner align="start">
                        <Menu.Popup>
                          <DatePresetShortcutOptions
                            customLabel={config.customDatePreset}
                            descriptor={descriptor}
                            onApply={(state) =>
                              model.updateFilter(descriptor.id, state)
                            }
                            onCustom={() =>
                              model.addFilter(descriptor, { openEditor: true })
                            }
                          />
                        </Menu.Popup>
                      </Menu.Positioner>
                    </Menu.Portal>
                  </Menu.SubmenuRoot>
                ) : (
                  <Menu.Item
                    onClick={() =>
                      model.addFilter(descriptor, { openEditor: true })
                    }
                  >
                    {descriptor.label}
                  </Menu.Item>
                )}
              </React.Fragment>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

function AddMenuEnumOptions({
  descriptor,
  closeOnSelection = false,
  removeWhenEmptied = false,
}: {
  descriptor: EnumFilterDescriptor<string>;
  closeOnSelection?: boolean;
  /**
   * Remove the filter when its last value is unchecked, if the model
   * discards empty filters. The pill editor keeps it so the user can pick
   * another value before closing.
   */
  removeWhenEmptied?: boolean;
}) {
  const { config, model } = useFilterBarContext();
  const state = model.states[descriptor.id];
  const applyOption = (option: EnumFilterOption) => {
    model.addFilter(descriptor, { enumValue: option });
  };
  const [query, setQuery] = React.useState("");
  const visibleOptions = descriptor.searchable
    ? descriptor.options.filter((option) =>
        matchesEnumFilterOption(option, query),
      )
    : descriptor.options;
  const search = descriptor.searchable ? (
    <div className={styles.optionSearch}>
      <input
        className={styles.optionSearchInput}
        type="text"
        value={query}
        onChange={(event) => setQuery(stripNonPrintable(event.target.value))}
        placeholder={config.searchOptions}
        aria-label={`${config.searchOptions} ${descriptor.label}`}
        autoFocus
        onKeyDown={(event) => {
          // Keep typed characters out of the menu's typeahead; arrows and
          // Escape still reach it for keyboard navigation and dismissal.
          if (!MENU_NAVIGATION_KEYS.has(event.key)) {
            event.stopPropagation();
          }
        }}
      />
    </div>
  ) : null;
  const noResults =
    descriptor.searchable && visibleOptions.length === 0 ? (
      <div className={styles.noOptionResults} role="status">
        {config.noOptionResults}
      </div>
    ) : null;

  if (descriptor.isMulti) {
    return (
      <>
        {search}
        {visibleOptions.map((option) => (
          <Menu.CheckboxItem
            key={option.label}
            checked={isEnumFilterOptionApplied(state, option)}
            closeOnClick={false}
            onCheckedChange={() => {
              const uncheckingLastValue =
                state?.type === "enum" &&
                state.appliedValues.every((value) =>
                  toEnumOptionValueArray(option.value).includes(value),
                ) &&
                isEnumFilterOptionApplied(state, option);
              if (
                removeWhenEmptied &&
                model.discardsEmptyFilters &&
                uncheckingLastValue
              ) {
                model.removeFilter(descriptor.id);
                return;
              }
              applyOption(option);
            }}
          >
            <Menu.CheckboxItemIndicator />
            {option.label}
          </Menu.CheckboxItem>
        ))}
        {noResults}
      </>
    );
  }

  const selectedLabel =
    descriptor.options.find((option) =>
      isEnumFilterOptionApplied(state, option),
    )?.label ?? "";

  return (
    <>
      {search}
      <Menu.RadioGroup
        value={selectedLabel}
        onValueChange={(label) => {
          const option = descriptor.options.find(
            (candidate) => candidate.label === label,
          );
          if (option) {
            applyOption(option);
          }
        }}
      >
        {visibleOptions.map((option) => (
          <Menu.RadioItem
            key={option.label}
            value={option.label}
            closeOnClick={closeOnSelection}
          >
            <Menu.RadioItemIndicator />
            {option.label}
          </Menu.RadioItem>
        ))}
      </Menu.RadioGroup>
      {noResults}
    </>
  );
}

const MENU_NAVIGATION_KEYS = new Set(["ArrowDown", "ArrowUp", "Escape", "Tab"]);

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
  const { config, formatDateValue } = useFilterBarContext();
  const { isOpen, setIsOpen, applyAndClose } = useEditorOpenState(
    descriptor.id,
  );
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
      applyAndClose({ ...state, value: null, isApplied: true });
      return;
    }

    const value = descriptor.normalizeValue
      ? descriptor.normalizeValue(draft)
      : draft.trim();
    if (value === null) {
      setShowError(true);
      return;
    }

    applyAndClose({ ...state, value: value || null, isApplied: true });
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

function DateValueEditor({
  descriptor,
  state,
}: {
  descriptor: DateFilterDescriptor<string>;
  state: DateFilterState;
}) {
  const { config, formatDateValue } = useFilterBarContext();
  const { isOpen, setIsOpen, commit } = useEditorOpenState(descriptor.id);
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
          <Popover.Popup aria-label={`${descriptor.label} filter`}>
            {isOpen ? (
              <DateValueEditorContent
                applyLabel={config.apply}
                descriptor={descriptor}
                state={state}
                onApply={commit}
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
