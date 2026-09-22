import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getDefaultFilterStates,
  getFilterSignature,
  loadFilterStatesFromUrl,
  normalizeDateFilterPresetIdentity,
  saveFilterStatesToUrl,
  type DateFilterState,
  type FilterDescriptor,
} from "./filter-model";

afterEach(() => {
  vi.useRealTimers();
});

const DATE_PICKER_DESCRIPTORS = [
  {
    type: "date",
    label: "Date",
    id: "createdAt",
    datePicker: {
      mode: "single",
      granularity: "date",
      presets: [
        {
          id: "today",
          label: "Today",
          textValue: "Today",
          resolve: (now: Date) => ({
            mode: "single" as const,
            granularity: "date" as const,
            value: now,
          }),
        },
        {
          id: "disabled",
          label: "Disabled",
          textValue: "Disabled",
          disabled: true,
          resolve: (now: Date) => ({
            mode: "single" as const,
            granularity: "date" as const,
            value: now,
          }),
        },
      ],
    },
  },
] as const satisfies readonly FilterDescriptor<"createdAt">[];

describe("filter descriptor URL keys", () => {
  const collidingDescriptors = [
    {
      type: "date",
      label: "Created",
      id: "createdAt",
      datePicker: { mode: "range", granularity: "date-time" },
    },
    {
      type: "string",
      label: "Reserved metadata key",
      id: "createdAt.__origin",
    },
  ] as const satisfies readonly FilterDescriptor<string>[];
  const collisionError =
    'Filter URL key collision: "createdAt.__origin" is both the metadata key for date filter "createdAt" and the descriptor key for filter "createdAt.__origin". Descriptor keys, generated DatePicker metadata keys, and application-order metadata keys must be unique.';

  it("rejects descriptor keys that collide with generated metadata while loading", () => {
    expect(() =>
      loadFilterStatesFromUrl(
        collidingDescriptors,
        new URLSearchParams(),
        getDefaultFilterStates(collidingDescriptors),
      ),
    ).toThrowError(collisionError);
  });

  it("rejects descriptor keys that collide with generated metadata before saving", () => {
    expect(() =>
      saveFilterStatesToUrl(
        collidingDescriptors,
        new URLSearchParams(),
        getDefaultFilterStates(collidingDescriptors),
      ),
    ).toThrowError(collisionError);
  });

  it("rejects duplicate explicit descriptor keys deterministically", () => {
    const duplicateDescriptors = [
      { type: "string", label: "First status", id: "status" },
      { type: "string", label: "Second status", id: "status" },
    ] as const satisfies readonly FilterDescriptor<string>[];

    expect(() =>
      loadFilterStatesFromUrl(
        duplicateDescriptors,
        new URLSearchParams(),
        getDefaultFilterStates(duplicateDescriptors),
      ),
    ).toThrowError(
      'Filter URL key collision: "status" is both the descriptor key for filter "status" and the descriptor key for filter "status". Descriptor keys, generated DatePicker metadata keys, and application-order metadata keys must be unique.',
    );
  });

  it("accepts ordinary descriptors with distinct URL keys", () => {
    const descriptors = [
      { type: "date", label: "Date", id: "createdAt" },
      { type: "string", label: "Status", id: "status" },
    ] as const satisfies readonly FilterDescriptor<string>[];

    expect(() =>
      loadFilterStatesFromUrl(
        descriptors,
        new URLSearchParams(),
        getDefaultFilterStates(descriptors),
      ),
    ).not.toThrow();
  });

  it("does not reserve metadata keys for legacy date descriptors", () => {
    const descriptors = [
      { type: "date", label: "Created", id: "createdAt" },
      {
        type: "string",
        label: "External origin",
        id: "createdAt.__origin",
      },
    ] as const satisfies readonly FilterDescriptor<string>[];

    expect(() =>
      loadFilterStatesFromUrl(
        descriptors,
        new URLSearchParams(),
        getDefaultFilterStates(descriptors),
      ),
    ).not.toThrow();
  });
});

describe("DatePicker URL metadata hydration", () => {
  it.each([
    ["omitted", {}],
    ["explicit false", { showPresetShortcutsInAddMenu: false }],
    ["explicit true", { showPresetShortcutsInAddMenu: true }],
  ] as const)(
    "hydrates and signs the same future preset identity when shortcuts are %s",
    (_, shortcutConfig) => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
      const descriptors = [
        {
          type: "date",
          label: "Date",
          id: "createdAt",
          allowFuture: false,
          datePicker: {
            mode: "single",
            granularity: "date",
            presets: [
              {
                id: "tomorrow",
                label: "Tomorrow",
                textValue: "Tomorrow",
                resolve: (now: Date) => ({
                  mode: "single" as const,
                  granularity: "date" as const,
                  value: new Date(now.getTime() + 24 * 60 * 60 * 1000),
                }),
              },
            ],
            ...shortcutConfig,
          },
        },
      ] as const satisfies readonly FilterDescriptor<"createdAt">[];
      const params = new URLSearchParams();
      params.set("createdAt", "2026-06-16T12:00:00.000Z");
      params.set("createdAt.__origin", "tomorrow");

      const states = loadFilterStatesFromUrl(
        descriptors,
        params,
        getDefaultFilterStates(descriptors),
      );

      expect(states.createdAt.presetId).toBe("tomorrow");
      const saved = saveFilterStatesToUrl(
        descriptors,
        new URLSearchParams(),
        states,
      );
      expect(saved.get("createdAt.__origin")).toBe("tomorrow");
      expect(getFilterSignature(descriptors, states)).toBe(saved.toString());
    },
  );

  it("hydrates an applied-empty URL with the fixed descriptor metadata", () => {
    const states = loadFilterStatesFromUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams("createdAt="),
      getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
    );

    expect(states.createdAt).toEqual({
      type: "date",
      isApplied: true,
      start: null,
      end: null,
      presetId: null,
    });
  });

  it("hydrates legacy date-bound URLs into the fixed descriptor shape", () => {
    const states = loadFilterStatesFromUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams(
        "createdAt=2026-06-01T00%3A00%3A00.000Z%2C2026-06-30T00%3A00%3A00.000Z",
      ),
      getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
    );

    expect(states.createdAt).toEqual({
      type: "date",
      isApplied: true,
      start: new Date("2026-06-01T00:00:00.000Z"),
      end: new Date("2026-06-01T00:00:00.000Z"),
      presetId: null,
    });
  });

  it.each(["{not-json", "42", '{"presetId":"today"}', '"today"'])(
    "uses the fixed descriptor shape for unknown metadata %s",
    (metadata) => {
      const params = new URLSearchParams();
      params.set(
        "createdAt",
        "2026-06-01T00:00:00.000Z,2026-06-01T00:00:00.000Z",
      );
      params.set("createdAt.__origin", metadata);

      const states = loadFilterStatesFromUrl(
        DATE_PICKER_DESCRIPTORS,
        params,
        getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
      );

      expect(states.createdAt).toEqual({
        type: "date",
        isApplied: true,
        start: new Date("2026-06-01T00:00:00.000Z"),
        end: new Date("2026-06-01T00:00:00.000Z"),
        presetId: null,
      });
    },
  );

  it("drops an unknown preset while preserving valid date metadata", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-06-01T00:00:00.000Z,2026-06-01T00:00:00.000Z",
    );
    params.set("createdAt.__origin", "retired-preset");

    const states = loadFilterStatesFromUrl(
      DATE_PICKER_DESCRIPTORS,
      params,
      getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
    );

    expect(states.createdAt.presetId).toBeNull();
  });

  it("hydrates disabled preset metadata as Custom without changing persisted bounds", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-06-01T00:00:00.000Z,2026-06-01T00:00:00.000Z",
    );
    params.set("createdAt.__origin", "disabled");

    expect(
      loadFilterStatesFromUrl(
        DATE_PICKER_DESCRIPTORS,
        params,
        getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
      ).createdAt,
    ).toEqual({
      type: "date",
      isApplied: true,
      start: new Date("2026-06-01T00:00:00.000Z"),
      end: new Date("2026-06-01T00:00:00.000Z"),
      presetId: null,
    });
  });

  it("retains matching preset identity when URL bounds still match", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const states = getDefaultFilterStates(DATE_PICKER_DESCRIPTORS);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date(),
      end: new Date(),
      presetId: "today",
    };
    const saved = saveFilterStatesToUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams(),
      states,
    );

    expect(
      loadFilterStatesFromUrl(
        DATE_PICKER_DESCRIPTORS,
        saved,
        getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
      ).createdAt,
    ).toEqual(states.createdAt);
  });

  it("retains rolling preset identity after delayed URL hydration", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const states = getDefaultFilterStates(DATE_PICKER_DESCRIPTORS);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date(),
      end: new Date(),
      presetId: "today",
    };
    const saved = saveFilterStatesToUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams(),
      states,
    );

    vi.advanceTimersByTime(1);

    expect(
      loadFilterStatesFromUrl(
        DATE_PICKER_DESCRIPTORS,
        saved,
        getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
      ).createdAt,
    ).toEqual(states.createdAt);
  });

  it("normalizes a runtime preset shape mismatch to Custom", () => {
    const descriptors = [
      {
        type: "date",
        label: "Date",
        id: "createdAt",
        datePicker: {
          mode: "single",
          granularity: "date",
          presets: [
            {
              id: "malformed",
              label: "Malformed",
              resolve: () => ({
                mode: "range",
                granularity: "date",
                value: {
                  start: new Date("2026-06-01T00:00:00.000Z"),
                  end: new Date("2026-06-02T00:00:00.000Z"),
                },
              }),
            },
          ],
        },
      },
    ] as unknown as typeof DATE_PICKER_DESCRIPTORS;
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-06-01T00:00:00.000Z,2026-06-01T00:00:00.000Z",
    );
    params.set("createdAt.__origin", "malformed");

    expect(
      loadFilterStatesFromUrl(
        descriptors,
        params,
        getDefaultFilterStates(descriptors),
      ).createdAt,
    ).toEqual({
      type: "date",
      isApplied: true,
      start: new Date("2026-06-01T00:00:00.000Z"),
      end: new Date("2026-06-01T00:00:00.000Z"),
      presetId: null,
    });
  });

  it("retains semantic preset identity across a later reload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T17:30:45.000Z"));
    const persistedBounds = new Date();
    const states = getDefaultFilterStates(DATE_PICKER_DESCRIPTORS);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: persistedBounds,
      end: persistedBounds,
      presetId: "today",
    };
    const saved = saveFilterStatesToUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams(),
      states,
    );

    vi.setSystemTime(new Date("2026-08-01T17:30:45.000Z"));
    const rehydrated = loadFilterStatesFromUrl(
      DATE_PICKER_DESCRIPTORS,
      saved,
      getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
    );

    expect(rehydrated.createdAt).toEqual(states.createdAt);
  });
});

describe("DatePicker URL metadata serialization", () => {
  it("preserves foreign metadata-like params for legacy date descriptors", () => {
    const descriptors = [
      { type: "date", label: "Created", id: "createdAt" },
    ] as const satisfies readonly FilterDescriptor<"createdAt">[];
    const states = getDefaultFilterStates(descriptors);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-06-01T00:00:00.000Z"),
      end: new Date("2026-06-30T00:00:00.000Z"),
    };

    const saved = saveFilterStatesToUrl(
      descriptors,
      new URLSearchParams("createdAt.__origin=foreign-owner"),
      states,
    );

    expect(saved.get("createdAt.__origin")).toBe("foreign-owner");
    expect(saved.get("createdAt")).toBe(
      "2026-06-01T00:00:00.000Z,2026-06-30T00:00:00.000Z",
    );
  });

  it("round-trips opted-in DatePicker metadata without changing bound or foreign params", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00.000Z"));
    const states = getDefaultFilterStates(DATE_PICKER_DESCRIPTORS);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-06-01T00:00:00.000Z"),
      end: new Date("2026-06-01T00:00:00.000Z"),
      presetId: "today",
    };

    const saved = saveFilterStatesToUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams("tab=activity"),
      states,
    );

    expect(saved.get("createdAt")).toBe(
      "2026-06-01T00:00:00.000Z,2026-06-01T00:00:00.000Z",
    );
    expect(saved.get("createdAt.__origin")).toBe("today");
    expect(saved.get("tab")).toBe("activity");

    expect(
      loadFilterStatesFromUrl(
        DATE_PICKER_DESCRIPTORS,
        saved,
        getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
      ).createdAt,
    ).toEqual(states.createdAt);
  });

  it("omits metadata for Custom while descriptor shape stays authoritative", () => {
    const states = getDefaultFilterStates(DATE_PICKER_DESCRIPTORS);
    states.createdAt = {
      type: "date",
      isApplied: true,
      start: new Date("2026-06-01T00:00:00.000Z"),
      end: new Date("2026-06-01T00:00:00.000Z"),
      presetId: null,
    };

    const saved = saveFilterStatesToUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams(),
      states,
    );

    expect(saved.get("createdAt.__origin")).toBeNull();
  });

  it.each(["disabled", "unknown"])(
    "serializes %s preset identity as Custom while retaining authoritative bounds",
    (presetId) => {
      const states = getDefaultFilterStates(DATE_PICKER_DESCRIPTORS);
      states.createdAt = {
        type: "date",
        isApplied: true,
        start: new Date("2026-06-01T00:00:00.000Z"),
        end: new Date("2026-06-01T00:00:00.000Z"),
        presetId,
      };

      const saved = saveFilterStatesToUrl(
        DATE_PICKER_DESCRIPTORS,
        new URLSearchParams(),
        states,
      );

      expect(saved.get("createdAt")).toBe(
        "2026-06-01T00:00:00.000Z,2026-06-01T00:00:00.000Z",
      );
      expect(saved.get("createdAt.__origin")).toBeNull();
      expect(
        loadFilterStatesFromUrl(
          DATE_PICKER_DESCRIPTORS,
          saved,
          getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
        ).createdAt,
      ).toEqual({ ...states.createdAt, presetId: null });
    },
  );

  it("removes stale DatePicker metadata with its unapplied filter", () => {
    const saved = saveFilterStatesToUrl(
      DATE_PICKER_DESCRIPTORS,
      new URLSearchParams(
        "createdAt=2026-06-01T00%3A00%3A00.000Z%2C&createdAt.__origin=today&tab=activity",
      ),
      getDefaultFilterStates(DATE_PICKER_DESCRIPTORS),
    );

    expect(saved.get("createdAt")).toBeNull();
    expect(saved.get("createdAt.__origin")).toBeNull();
    expect(saved.get("tab")).toBe("activity");
  });
});

describe("DatePicker preset identity normalization", () => {
  const persistedState: DateFilterState & { presetId: string | null } = {
    type: "date",
    isApplied: true,
    start: new Date("2026-06-01T00:00:00.000Z"),
    end: new Date("2026-06-01T00:00:00.000Z"),
    presetId: null,
  };

  it.each([
    {
      label: "a disabled preset",
      presetId: "disabled",
      expectedPresetId: null,
    },
    {
      label: "an unknown preset",
      presetId: "unknown",
      expectedPresetId: null,
    },
    {
      label: "a known enabled preset",
      presetId: "today",
      expectedPresetId: "today",
    },
  ])(
    "normalizes $label deterministically",
    ({ presetId, expectedPresetId }) => {
      expect(
        normalizeDateFilterPresetIdentity(DATE_PICKER_DESCRIPTORS[0], {
          ...persistedState,
          presetId,
        }),
      ).toEqual({ ...persistedState, presetId: expectedPresetId });
    },
  );

  it.each([
    {
      label: "throws",
      resolve: () => {
        throw new Error("resolver failed");
      },
    },
    {
      label: "returns malformed output",
      resolve: () => ({ mode: "single", granularity: "date" }),
    },
    {
      label: "returns a reversed range",
      resolve: () => ({
        mode: "range",
        granularity: "date",
        value: {
          start: new Date("2026-06-02T00:00:00.000Z"),
          end: new Date("2026-06-01T00:00:00.000Z"),
        },
      }),
    },
    {
      label: "returns a shape mismatch",
      resolve: () => ({
        mode: "range",
        granularity: "date",
        value: {
          start: new Date("2026-06-01T00:00:00.000Z"),
          end: new Date("2026-06-02T00:00:00.000Z"),
        },
      }),
    },
  ])("normalizes Custom when a resolver $label", ({ resolve }) => {
    const descriptor = {
      ...DATE_PICKER_DESCRIPTORS[0],
      datePicker: {
        ...DATE_PICKER_DESCRIPTORS[0].datePicker,
        presets: [
          {
            id: "unsafe",
            label: "Unsafe",
            textValue: "Unsafe",
            resolve,
          },
        ],
      },
    } as unknown as (typeof DATE_PICKER_DESCRIPTORS)[0];

    expect(
      normalizeDateFilterPresetIdentity(descriptor, {
        ...persistedState,
        presetId: "unsafe",
      }),
    ).toEqual(persistedState);
  });

  it("retains a valid future preset without reinterpreting persisted bounds", () => {
    const descriptor = {
      ...DATE_PICKER_DESCRIPTORS[0],
      allowFuture: false,
      datePicker: {
        ...DATE_PICKER_DESCRIPTORS[0].datePicker,
        presets: [
          {
            id: "future",
            label: "Future",
            textValue: "Future",
            resolve: () => ({
              mode: "single" as const,
              granularity: "date" as const,
              value: new Date("2026-06-02T00:00:00.000Z"),
            }),
          },
        ],
      },
    };

    expect(
      normalizeDateFilterPresetIdentity(
        descriptor,
        {
          ...persistedState,
          presetId: "future",
        },
        new Date("2026-06-01T00:00:00.000Z"),
      ),
    ).toEqual({ ...persistedState, presetId: "future" });
  });
});
