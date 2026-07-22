import { describe, expect, it } from "vitest";
import {
  applyEnumFilterOption,
  applyFilterConflicts,
  countAppliedFilters,
  getAddedFilterState,
  getDateFilterDefaultRange,
  getDefaultFilterStates,
  getFilterSignature,
  isEnumFilterOptionApplied,
  loadFilterStatesFromUrl,
  saveFilterStatesToUrl,
  type DateFilterState,
  type EnumFilterState,
  type FilterDescriptor,
} from "./filter-model";

type TestFilterKey =
  | "createdAt"
  | "type"
  | "sendReason"
  | "receiveReason"
  | "code";

const DESCRIPTORS = [
  { type: "date", label: "Date", id: "createdAt" },
  {
    type: "enum",
    label: "Type",
    id: "type",
    conflictsWith: ["sendReason", "receiveReason"],
    options: [
      { label: "Outgoing", value: "OUTGOING" },
      { label: "Incoming", value: "INCOMING" },
    ],
  },
  {
    type: "string",
    label: "Send reason",
    id: "sendReason",
    conflictsWith: ["receiveReason", "type"],
  },
  { type: "string", label: "Receive reason", id: "receiveReason" },
  {
    type: "string",
    label: "Code",
    id: "code",
    normalizeValue: (value: string) => {
      const normalized = value.trim().toLowerCase();
      return normalized.startsWith("code-") ? normalized : null;
    },
    errorMessage: "Enter a valid code",
  },
] as const satisfies readonly FilterDescriptor<TestFilterKey>[];

function getDescriptor<TId extends TestFilterKey>(
  id: TId,
): Extract<(typeof DESCRIPTORS)[number], { id: TId }> {
  const descriptor = DESCRIPTORS.find((candidate) => candidate.id === id);
  if (!descriptor) {
    throw new Error(`No descriptor for ${id}`);
  }
  return descriptor as Extract<(typeof DESCRIPTORS)[number], { id: TId }>;
}

describe("loadFilterStatesFromUrl", () => {
  it("hydrates a literal comma in a singular string without splitting it", () => {
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("sendReason=ACME%2C+Inc."),
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(states.sendReason).toEqual({
      type: "string",
      isApplied: true,
      value: "ACME, Inc.",
    });
  });

  it("hydrates repeated enum values losslessly, including a comma value", () => {
    const descriptors = [
      {
        type: "enum",
        label: "Status",
        id: "status",
        isMulti: true,
        options: [
          { label: "Open", value: "OPEN" },
          { label: "Company", value: "ACME, Inc." },
        ],
      },
    ] as const satisfies readonly FilterDescriptor<string>[];
    const params = new URLSearchParams();
    params.append("status", "OPEN");
    params.append("status", "ACME, Inc.");

    const states = loadFilterStatesFromUrl(
      descriptors,
      params,
      getDefaultFilterStates(descriptors),
    );

    expect(states.status.appliedValues).toEqual(["OPEN", "ACME, Inc."]);
  });

  it("preserves legacy comma-separated enum hydration when unambiguous", () => {
    const descriptors = [
      {
        type: "enum",
        label: "Status",
        id: "status",
        isMulti: true,
        options: [
          { label: "Open", value: "OPEN" },
          { label: "Closed", value: "CLOSED" },
        ],
      },
    ] as const satisfies readonly FilterDescriptor<string>[];

    const states = loadFilterStatesFromUrl(
      descriptors,
      new URLSearchParams("status=OPEN%2CCLOSED"),
      getDefaultFilterStates(descriptors),
    );

    expect(states.status.appliedValues).toEqual(["OPEN", "CLOSED"]);
  });

  it("hydrates enum and singular string filters", () => {
    const enumStates = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("type=OUTGOING"),
      getDefaultFilterStates(DESCRIPTORS),
    );
    const stringStates = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("sendReason=USD"),
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(enumStates.type.isApplied).toBe(true);
    expect(enumStates.type.appliedValues).toEqual(["OUTGOING"]);
    expect(stringStates.sendReason.isApplied).toBe(true);
    expect(stringStates.sendReason.value).toBe("USD");
    expect(stringStates.receiveReason.isApplied).toBe(false);
  });

  it.each([
    "type=OUTGOING&sendReason=TIMEOUT",
    "sendReason=TIMEOUT&type=OUTGOING",
  ])(
    "resolves conflicting URL params in descriptor order for search %s",
    (search) => {
      const states = loadFilterStatesFromUrl(
        DESCRIPTORS,
        new URLSearchParams(search),
        getDefaultFilterStates(DESCRIPTORS),
      );

      expect(states.type.isApplied).toBe(false);
      expect(states.sendReason).toEqual({
        type: "string",
        isApplied: true,
        value: "TIMEOUT",
      });
    },
  );

  it("treats an applied-empty URL param as a conflict winner", () => {
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("type=OUTGOING&sendReason="),
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(states.type.isApplied).toBe(false);
    expect(states.sendReason).toEqual({
      type: "string",
      isApplied: true,
      value: null,
    });
  });

  it("falls back to the default for enum params with no valid values", () => {
    // Unknown enum values typically reach typed query variables verbatim,
    // where they fail server-side validation and error the whole query. A
    // stale or hand-edited URL (`?type=GARBAGE`) must hydrate as
    // unapplied.
    const params = new URLSearchParams("type=GARBAGE");
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(states.type.isApplied).toBe(false);
    expect((states.type as EnumFilterState).appliedValues).toEqual([]);
  });

  it("drops unknown enum values while keeping valid ones", () => {
    const params = new URLSearchParams("type=GARBAGE,OUTGOING");
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(states.type.isApplied).toBe(true);
    expect((states.type as EnumFilterState).appliedValues).toEqual([
      "OUTGOING",
    ]);
  });

  it("hydrates only the first valid URL option for a non-multi enum", () => {
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("type=GARBAGE,INCOMING,OUTGOING"),
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect((states.type as EnumFilterState).appliedValues).toEqual([
      "INCOMING",
    ]);
  });

  it("hydrates an array-valued exclusive option as one coherent selection", () => {
    const descriptors = [
      {
        type: "enum",
        label: "Status",
        id: "status",
        options: [
          { label: "Complete", value: ["SETTLED", "CONFIRMED"] },
          { label: "Failed", value: "FAILED" },
        ],
      },
    ] as const satisfies readonly FilterDescriptor<string>[];
    const states = loadFilterStatesFromUrl(
      descriptors,
      new URLSearchParams("status=CONFIRMED,FAILED"),
      getDefaultFilterStates(descriptors),
    );

    expect((states.status as EnumFilterState).appliedValues).toEqual([
      "SETTLED",
      "CONFIRMED",
    ]);
  });

  it("hydrates normalized string filters through the descriptor callback", () => {
    const params = new URLSearchParams("code=CODE-123");
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(states.code.isApplied).toBe(true);
    expect(states.code.value).toBe("code-123");
  });

  it("drops invalid normalized string URL values", () => {
    const allInvalid = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("code=garbage"),
      getDefaultFilterStates(DESCRIPTORS),
    );
    expect(allInvalid.code.isApplied).toBe(false);
    expect(allInvalid.code.value).toBeNull();
  });

  it("hydrates date filters from '<startISO>,<endISO>' params", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-06-01T00:00:00.000Z,2026-06-30T00:00:00.000Z",
    );
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.isApplied).toBe(true);
    expect(createdAt.start?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(createdAt.end?.toISOString()).toBe("2026-06-30T00:00:00.000Z");
  });

  it("canonicalizes reversed date ranges by swapping their bounds", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-06-30T17:00:00.000Z,2026-06-01T09:00:00.000Z",
    );
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.start?.toISOString()).toBe("2026-06-01T09:00:00.000Z");
    expect(createdAt.end?.toISOString()).toBe("2026-06-30T17:00:00.000Z");
  });

  it("accepts a canonical leap-day timestamp", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2028-02-29T12:34:56.789Z,2028-02-29T13:34:56.789Z",
    );
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.start?.toISOString()).toBe("2028-02-29T12:34:56.789Z");
    expect(createdAt.end?.toISOString()).toBe("2028-02-29T13:34:56.789Z");
  });

  it("drops a rollover date while preserving the valid side", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-02-30T00:00:00.000Z,2026-03-03T00:00:00.000Z",
    );
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.start).toBeNull();
    expect(createdAt.end?.toISOString()).toBe("2026-03-03T00:00:00.000Z");
  });

  it("rejects valid instants that are not in the codec's canonical format", () => {
    const params = new URLSearchParams();
    params.set(
      "createdAt",
      "2026-06-01T01:00:00.000+01:00,2026-06-02T00:00:00Z",
    );
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.start).toBeNull();
    expect(createdAt.end).toBeNull();
  });

  it("supports open-ended date ranges", () => {
    const params = new URLSearchParams();
    params.set("createdAt", "2026-06-01T00:00:00.000Z,");
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.start?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(createdAt.end).toBeNull();
  });

  it("drops the invalid side of a half-valid date param", () => {
    // A hand-edited URL like `?createdAt=<valid>,garbage` must not put an
    // Invalid Date into state — downstream `.toISOString()` and
    // `Intl.DateTimeFormat.format()` calls throw RangeError at render time.
    const params = new URLSearchParams();
    params.set("createdAt", "2026-06-01T00:00:00.000Z,garbage");
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.isApplied).toBe(true);
    expect(createdAt.start?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(createdAt.end).toBeNull();
  });

  it("hydrates a fully invalid date param as an applied empty range", () => {
    const params = new URLSearchParams();
    params.set("createdAt", "garbage,also-garbage");
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.isApplied).toBe(true);
    expect(createdAt.start).toBeNull();
    expect(createdAt.end).toBeNull();
  });

  it("leaves current state untouched for absent params (merge-on-hydrate)", () => {
    const current = getDefaultFilterStates(DESCRIPTORS);
    current.type = {
      type: "enum",
      isApplied: true,
      appliedValues: ["INCOMING"],
    };
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams(),
      current,
    );

    expect((states.type as EnumFilterState).appliedValues).toEqual([
      "INCOMING",
    ]);
    expect(states.sendReason.isApplied).toBe(false);
  });

  it("hydrates present-but-empty params as applied-but-empty (has() semantics)", () => {
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("sendReason=&createdAt="),
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(states.sendReason).toEqual({
      type: "string",
      isApplied: true,
      value: null,
    });
    const createdAt = states.createdAt as DateFilterState;
    expect(createdAt.isApplied).toBe(true);
    expect(createdAt.start).toBeNull();
    expect(createdAt.end).toBeNull();
    expect(states.type.isApplied).toBe(false);
  });
});

describe("saveFilterStatesToUrl", () => {
  it("serializes singular strings and enum arrays without comma loss", () => {
    const descriptors = [
      {
        type: "string",
        label: "Company",
        id: "company",
      },
      {
        type: "enum",
        label: "Status",
        id: "status",
        isMulti: true,
        options: [
          { label: "Open", value: "OPEN" },
          { label: "Company", value: "ACME, Inc." },
        ],
      },
    ] as const satisfies readonly FilterDescriptor<string>[];
    const states = getDefaultFilterStates(descriptors);
    states.company = {
      type: "string",
      isApplied: true,
      value: "ACME, Inc.",
    };
    states.status = {
      type: "enum",
      isApplied: true,
      appliedValues: ["OPEN", "ACME, Inc."],
    };

    const saved = saveFilterStatesToUrl(
      descriptors,
      new URLSearchParams(),
      states,
    );

    expect(saved.get("company")).toBe("ACME, Inc.");
    expect(saved.getAll("status")).toEqual(["OPEN", "ACME, Inc."]);
  });

  it("round-trips applied filters through the URL", () => {
    const params = new URLSearchParams(
      "sendReason=TIMEOUT&createdAt=2026-06-01T00:00:00.000Z,",
    );
    const states = loadFilterStatesFromUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    const saved = saveFilterStatesToUrl(
      DESCRIPTORS,
      new URLSearchParams(),
      states,
    );
    expect(saved.get("sendReason")).toBe("TIMEOUT");
    expect(saved.get("createdAt")).toBe("2026-06-01T00:00:00.000Z,");
    expect(saved.get("type")).toBeNull();
    expect(saved.get("receiveReason")).toBeNull();
  });

  it("removes params for filters that are no longer applied and preserves foreign params", () => {
    const params = new URLSearchParams("type=OUTGOING&export=abc");
    const saved = saveFilterStatesToUrl(
      DESCRIPTORS,
      params,
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(saved.get("type")).toBeNull();
    expect(saved.get("export")).toBe("abc");
  });

  it("round-trips applied-empty pills through an empty param", () => {
    const states = getDefaultFilterStates(DESCRIPTORS);
    states.sendReason = getAddedFilterState(getDescriptor("sendReason"));

    const saved = saveFilterStatesToUrl(
      DESCRIPTORS,
      new URLSearchParams(),
      states,
    );
    expect(saved.get("sendReason")).toBe("");

    const rehydrated = loadFilterStatesFromUrl(
      DESCRIPTORS,
      saved,
      getDefaultFilterStates(DESCRIPTORS),
    );
    expect(rehydrated.sendReason).toEqual({
      type: "string",
      isApplied: true,
      value: null,
    });
  });
});

describe("applyFilterConflicts", () => {
  it("resets conflicting filters when a filter becomes applied", () => {
    const states = getDefaultFilterStates(DESCRIPTORS);
    states.receiveReason = {
      type: "string",
      isApplied: true,
      value: "LNURLP_FAILED",
    };
    states.type = {
      type: "enum",
      isApplied: true,
      appliedValues: ["OUTGOING"],
    };

    const applied = {
      type: "string" as const,
      isApplied: true,
      value: "TIMEOUT",
    };
    const next = applyFilterConflicts(DESCRIPTORS, "sendReason", applied, {
      ...states,
      sendReason: applied,
    });

    expect(next.sendReason.isApplied).toBe(true);
    expect(next.receiveReason.isApplied).toBe(false);
    expect(next.type.isApplied).toBe(false);
  });

  it("does nothing when the changed state is not applied", () => {
    const states = getDefaultFilterStates(DESCRIPTORS);
    states.type = {
      type: "enum",
      isApplied: true,
      appliedValues: ["INCOMING"],
    };

    const next = applyFilterConflicts(
      DESCRIPTORS,
      "sendReason",
      states.sendReason,
      states,
    );
    expect(next.type.isApplied).toBe(true);
  });

  it("does nothing for filters without conflicts", () => {
    const states = getDefaultFilterStates(DESCRIPTORS);
    states.type = {
      type: "enum",
      isApplied: true,
      appliedValues: ["INCOMING"],
    };

    const applied = {
      type: "string" as const,
      isApplied: true,
      value: "X",
    };
    const next = applyFilterConflicts(DESCRIPTORS, "receiveReason", applied, {
      ...states,
      receiveReason: applied,
    });
    expect(next.type.isApplied).toBe(true);
    expect(next.receiveReason.isApplied).toBe(true);
  });
});

describe("getAddedFilterState", () => {
  it("applies enum and string filters empty and date filters as an open range", () => {
    const enumState = getAddedFilterState(getDescriptor("type"));
    expect(enumState.isApplied).toBe(true);
    expect((enumState as EnumFilterState).appliedValues).toEqual([]);

    const stringState = getAddedFilterState(getDescriptor("sendReason"));
    expect(stringState.isApplied).toBe(true);
    expect(stringState.value).toBeNull();

    const dateState = getAddedFilterState(
      getDescriptor("createdAt"),
    ) as DateFilterState;
    expect(dateState.isApplied).toBe(true);
    expect(dateState.start).toBeNull();
    expect(dateState.end).toBeNull();
  });
});

describe("applyEnumFilterOption", () => {
  const exclusiveDescriptor = getDescriptor("type") as Extract<
    FilterDescriptor<TestFilterKey>,
    { type: "enum" }
  >;
  const multiDescriptor = {
    ...exclusiveDescriptor,
    isMulti: true,
  };
  const outgoing = { label: "Outgoing", value: "OUTGOING" };
  const incoming = { label: "Incoming", value: "INCOMING" };

  it("replaces the selection for exclusive descriptors", () => {
    const applied: EnumFilterState = {
      type: "enum",
      isApplied: true,
      appliedValues: ["INCOMING"],
    };

    expect(
      applyEnumFilterOption(exclusiveDescriptor, applied, outgoing),
    ).toEqual({ type: "enum", isApplied: true, appliedValues: ["OUTGOING"] });
    expect(
      applyEnumFilterOption(exclusiveDescriptor, undefined, outgoing),
    ).toEqual({ type: "enum", isApplied: true, appliedValues: ["OUTGOING"] });
  });

  it("toggles values for multi-select descriptors", () => {
    const empty = applyEnumFilterOption(multiDescriptor, undefined, outgoing);
    expect(empty.appliedValues).toEqual(["OUTGOING"]);

    const both = applyEnumFilterOption(multiDescriptor, empty, incoming);
    expect(both.appliedValues).toEqual(["OUTGOING", "INCOMING"]);

    const toggledOff = applyEnumFilterOption(multiDescriptor, both, outgoing);
    expect(toggledOff.appliedValues).toEqual(["INCOMING"]);
  });

  it("unchecking the last multi value leaves an applied-but-empty state", () => {
    const applied: EnumFilterState = {
      type: "enum",
      isApplied: true,
      appliedValues: ["OUTGOING"],
    };

    expect(applyEnumFilterOption(multiDescriptor, applied, outgoing)).toEqual({
      type: "enum",
      isApplied: true,
      appliedValues: [],
    });
  });
});

describe("isEnumFilterOptionApplied", () => {
  it("is true only when every option value is applied", () => {
    const option = { label: "Both", value: ["A", "B"] };
    const applied = (values: string[]): EnumFilterState => ({
      type: "enum",
      isApplied: true,
      appliedValues: values,
    });

    expect(isEnumFilterOptionApplied(applied(["A", "B", "C"]), option)).toBe(
      true,
    );
    expect(isEnumFilterOptionApplied(applied(["A"]), option)).toBe(false);
    expect(isEnumFilterOptionApplied(undefined, option)).toBe(false);
    expect(
      isEnumFilterOptionApplied(
        { type: "enum", isApplied: false, appliedValues: ["A", "B"] },
        option,
      ),
    ).toBe(false);
  });
});

describe("getDateFilterDefaultRange", () => {
  it("returns no seeded range when undeclared", () => {
    expect(
      getDateFilterDefaultRange({
        type: "date",
        label: "Date",
        id: "createdAt",
      }),
    ).toBeNull();
  });

  it("evaluates a descriptor override at call time", () => {
    const start = new Date("2026-06-01T00:00:00.000Z");
    const end = new Date("2026-06-08T00:00:00.000Z");
    const range = getDateFilterDefaultRange({
      type: "date",
      label: "Date",
      id: "createdAt",
      defaultRange: () => ({ start, end }),
    });

    expect(range).toEqual({ start, end });
  });
});

describe("signature and counting", () => {
  it("changes the signature when any filter changes", () => {
    const defaults = getDefaultFilterStates(DESCRIPTORS);
    const withType = loadFilterStatesFromUrl(
      DESCRIPTORS,
      new URLSearchParams("type=OUTGOING"),
      getDefaultFilterStates(DESCRIPTORS),
    );

    expect(getFilterSignature(DESCRIPTORS, defaults)).toBe("");
    expect(getFilterSignature(DESCRIPTORS, withType)).not.toBe(
      getFilterSignature(DESCRIPTORS, defaults),
    );
    expect(countAppliedFilters(defaults)).toBe(0);
    expect(countAppliedFilters(withType)).toBe(1);
  });
});
