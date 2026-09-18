import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  createRef,
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { describe, expect, it, vi } from "vitest";
import { Form } from "../Form";
import * as DatePicker from "./";

describe("DatePicker controlled input identity", () => {
  it("recovers DateInput when the timestamp changes within one calendar day", async () => {
    function Harness() {
      const [value, setValue] = useState(new Date("2026-07-30T09:00:00.000Z"));
      return (
        <>
          <button
            type="button"
            onClick={() => setValue(new Date("2026-07-30T17:00:00.000Z"))}
          >
            Change timestamp
          </button>
          <DatePicker.Root value={value} timeZone="UTC">
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/31/2026" } });
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.click(screen.getByRole("button", { name: "Change timestamp" }));

    await waitFor(() => {
      expect(input).toHaveValue("07/30/2026");
      expect(input).not.toHaveAttribute("aria-invalid");
    });
  });

  it("recovers TimeInput when seconds change within one displayed minute", async () => {
    function Harness() {
      const [value, setValue] = useState(new Date("2026-07-30T14:30:05.000Z"));
      return (
        <>
          <button
            type="button"
            onClick={() => setValue(new Date("2026-07-30T14:30:55.000Z"))}
          >
            Change seconds
          </button>
          <DatePicker.Root value={value} granularity="date-time" timeZone="UTC">
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Time (UTC)" });
    const formatted = input.getAttribute("value");
    fireEvent.change(input, { target: { value: "not a time" } });
    fireEvent.blur(input);
    expect(input).toHaveAttribute("aria-invalid", "true");

    fireEvent.click(screen.getByRole("button", { name: "Change seconds" }));

    await waitFor(() => {
      expect(input).toHaveValue(formatted);
      expect(input).not.toHaveAttribute("aria-invalid");
    });
  });

  it("preserves invalid text while the controlled timestamp is unchanged", () => {
    function Harness() {
      const [renderCount, setRenderCount] = useState(0);
      const [value] = useState(new Date("2026-07-30T14:30:05.000Z"));
      return (
        <>
          <button
            type="button"
            onClick={() => setRenderCount((count) => count + 1)}
          >
            Rerender {renderCount}
          </button>
          <DatePicker.Root value={value} granularity="date-time" timeZone="UTC">
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const dateInput = screen.getByRole("textbox", { name: "Date" });
    const timeInput = screen.getByRole("textbox", { name: "Time (UTC)" });
    fireEvent.change(dateInput, { target: { value: "02/31/2026" } });
    fireEvent.blur(dateInput);
    fireEvent.change(timeInput, { target: { value: "not a time" } });
    fireEvent.blur(timeInput);

    fireEvent.click(screen.getByRole("button", { name: "Rerender 0" }));

    expect(dateInput).toHaveValue("02/31/2026");
    expect(dateInput).toHaveAttribute("aria-invalid", "true");
    expect(timeInput).toHaveValue("not a time");
    expect(timeInput).toHaveAttribute("aria-invalid", "true");
  });

  it("validates a controlled selection replacement synchronously", () => {
    const onLayoutValidation = vi.fn();

    function Harness() {
      const actionsRef = useRef<DatePicker.DatePickerActions>(null);
      const [value, setValue] = useState(new Date("2026-07-30T00:00:00.000Z"));
      const [validateOnLayout, setValidateOnLayout] = useState(false);
      useLayoutEffect(() => {
        if (validateOnLayout) {
          onLayoutValidation(actionsRef.current?.validate());
        }
      }, [validateOnLayout, value]);

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setValue(new Date("2026-07-31T00:00:00.000Z"));
              setValidateOnLayout(true);
            }}
          >
            Replace selection
          </button>
          <DatePicker.Root actionsRef={actionsRef} value={value} timeZone="UTC">
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/31/2026" } });
    fireEvent.blur(input);

    fireEvent.click(screen.getByRole("button", { name: "Replace selection" }));

    expect(onLayoutValidation).toHaveBeenCalledOnce();
    expect(onLayoutValidation).toHaveBeenCalledWith(true);
  });

  it("validates an explicit same-value calendar selection synchronously", () => {
    const onLayoutValidation = vi.fn();

    function Harness() {
      const actionsRef = useRef<DatePicker.DatePickerActions>(null);
      const [value, setValue] = useState(new Date("2026-07-30T00:00:00.000Z"));
      useLayoutEffect(() => {
        onLayoutValidation(actionsRef.current?.validate());
      }, [value]);

      return (
        <DatePicker.Root
          actionsRef={actionsRef}
          value={value}
          onValueChange={(nextValue) => {
            if (nextValue instanceof Date) {
              setValue(nextValue);
            }
          }}
          defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
          timeZone="UTC"
        >
          <DatePicker.Header />
          <DatePicker.Grid />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    onLayoutValidation.mockClear();
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/31/2026" } });
    fireEvent.blur(input);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, July 30, 2026",
      }),
    );

    expect(onLayoutValidation).toHaveBeenCalledOnce();
    expect(onLayoutValidation).toHaveBeenCalledWith(true);
  });

  it.each([
    {
      label: "time input after date granularity replaces date-time",
      initialProps: {
        granularity: "date-time" as const,
        mode: "single" as const,
      },
      nextProps: {
        granularity: "date" as const,
        mode: "single" as const,
      },
      inputName: "Time (UTC)",
    },
    {
      label: "end input after single mode replaces range",
      initialProps: {
        granularity: "date" as const,
        mode: "range" as const,
      },
      nextProps: {
        granularity: "date" as const,
        mode: "single" as const,
      },
      inputName: "End date",
    },
  ])(
    "ignores an inactive $label synchronously",
    ({ initialProps, inputName, nextProps }) => {
      const onLayoutValidation = vi.fn();
      const onLayoutFocus = vi.fn();

      function Harness() {
        const actionsRef = useRef<DatePicker.DatePickerActions>(null);
        const [shape, setShape] = useState(initialProps);
        const [value] = useState<Date | DatePicker.DateRange>(() =>
          initialProps.mode === "range"
            ? {
                start: new Date("2026-07-30T14:30:00.000Z"),
                end: new Date("2026-07-31T14:30:00.000Z"),
              }
            : new Date("2026-07-30T14:30:00.000Z"),
        );
        const [validateOnLayout, setValidateOnLayout] = useState(false);
        useLayoutEffect(() => {
          if (validateOnLayout) {
            onLayoutValidation(actionsRef.current?.validate());
            onLayoutFocus(actionsRef.current?.focusFirstInvalidControl());
          }
        }, [shape, validateOnLayout]);

        return (
          <>
            <button
              type="button"
              onClick={() => {
                setShape(nextProps);
                setValidateOnLayout(true);
              }}
            >
              Change shape
            </button>
            <DatePicker.Root
              actionsRef={actionsRef}
              granularity={shape.granularity}
              mode={shape.mode}
              value={value}
              timeZone="UTC"
            >
              <DatePicker.Header />
            </DatePicker.Root>
          </>
        );
      }

      render(<Harness />);
      const input = screen.getByRole("textbox", { name: inputName });
      fireEvent.change(input, { target: { value: "invalid" } });
      fireEvent.blur(input);
      const changeShapeButton = screen.getByRole("button", {
        name: "Change shape",
      });
      changeShapeButton.focus();

      fireEvent.click(changeShapeButton);

      expect(onLayoutValidation).toHaveBeenCalledOnce();
      expect(onLayoutValidation).toHaveBeenCalledWith(true);
      expect(onLayoutFocus).toHaveBeenCalledOnce();
      expect(onLayoutFocus).toHaveBeenCalledWith(false);
      expect(input).not.toHaveFocus();
    },
  );

  it("preserves invalid metadata across an equal-value object rerender", () => {
    const onLayoutValidation = vi.fn();

    function Harness() {
      const actionsRef = useRef<DatePicker.DatePickerActions>(null);
      const [value, setValue] = useState(new Date("2026-07-30T14:30:05.000Z"));
      const [validateOnLayout, setValidateOnLayout] = useState(false);
      useLayoutEffect(() => {
        if (validateOnLayout) {
          onLayoutValidation(actionsRef.current?.validate());
        }
      }, [validateOnLayout, value]);

      return (
        <>
          <button
            type="button"
            onClick={() => {
              setValue((current) => new Date(current));
              setValidateOnLayout(true);
            }}
          >
            Rerender equal value
          </button>
          <DatePicker.Root
            actionsRef={actionsRef}
            value={value}
            granularity="date-time"
            timeZone="UTC"
          >
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/31/2026" } });
    fireEvent.blur(input);

    fireEvent.click(
      screen.getByRole("button", { name: "Rerender equal value" }),
    );

    expect(input).toHaveValue("02/31/2026");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onLayoutValidation).toHaveBeenCalledOnce();
    expect(onLayoutValidation).toHaveBeenCalledWith(false);
  });

  it("clears an invalid draft when the selected calendar day is reselected", async () => {
    const actionsRef = createRef<DatePicker.DatePickerActions>();
    render(
      <DatePicker.Root
        actionsRef={actionsRef}
        value={new Date("2026-07-30T00:00:00.000Z")}
        defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
        timeZone="UTC"
      >
        <DatePicker.Header />
        <DatePicker.Grid />
      </DatePicker.Root>,
    );
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/31/2026" } });
    fireEvent.blur(input);

    expect(input).toHaveValue("02/31/2026");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a valid date")).toBeInTheDocument();
    expect(actionsRef.current?.validate()).toBe(false);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Thursday, July 30, 2026",
      }),
    );

    await waitFor(() => {
      expect(input).toHaveValue("07/30/2026");
      expect(input).not.toHaveAttribute("aria-invalid");
      expect(screen.queryByText("Enter a valid date")).not.toBeInTheDocument();
    });
    expect(actionsRef.current?.validate()).toBe(true);
  });

  it("discards an uncommitted time draft when date-time inputs reactivate", () => {
    const value = new Date("2026-07-30T14:30:00.000Z");
    const { rerender } = render(
      <DatePicker.Root granularity="date-time" value={value} timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    const timeInput = screen.getByRole("textbox", { name: "Time (UTC)" });
    fireEvent.focus(timeInput);
    fireEvent.change(timeInput, { target: { value: "not a time" } });

    rerender(
      <DatePicker.Root granularity="date" value={value} timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    rerender(
      <DatePicker.Root granularity="date-time" value={value} timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    expect(screen.getByRole("textbox", { name: "Time (UTC)" })).toHaveValue(
      "2:30 PM",
    );
  });

  it("discards an uncommitted range-end draft when range inputs reactivate", () => {
    const value = {
      start: new Date("2026-07-30T00:00:00.000Z"),
      end: new Date("2026-07-31T00:00:00.000Z"),
    };
    const { rerender } = render(
      <DatePicker.Root mode="range" value={value} timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    const endInput = screen.getByRole("textbox", { name: "End date" });
    fireEvent.focus(endInput);
    fireEvent.change(endInput, { target: { value: "02/31/2026" } });

    rerender(
      <DatePicker.Root mode="single" value={value} timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    rerender(
      <DatePicker.Root mode="range" value={value} timeZone="UTC">
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    expect(screen.getByRole("textbox", { name: "End date" })).toHaveValue(
      "07/31/2026",
    );
  });
});

describe("DatePicker required accessibility semantics", () => {
  it("marks the active single date control as required without native form semantics", () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return Object.fromEntries(new FormData(event.currentTarget));
    });
    render(
      <form onSubmit={onSubmit}>
        <input name="consumerField" defaultValue="consumer value" />
        <DatePicker.Root required>
          <DatePicker.Header />
        </DatePicker.Root>
        <button type="submit">Submit</button>
      </form>,
    );

    const dateInput = screen.getByRole("textbox", { name: "Date" });
    expect(dateInput).toHaveAttribute("aria-required", "true");
    expect(dateInput).not.toHaveAttribute("required");

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect(onSubmit).toHaveReturnedWith({
      consumerField: "consumer value",
    });
  });

  it("requires both range date controls without requiring separate time controls", () => {
    render(
      <DatePicker.Root mode="range" granularity="date-time" required>
        <DatePicker.Header />
      </DatePicker.Root>,
    );

    expect(screen.getByRole("textbox", { name: "Start date" })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(screen.getByRole("textbox", { name: "End date" })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(
      screen.getByRole("textbox", { name: "Start time" }),
    ).not.toHaveAttribute("aria-required");
    expect(
      screen.getByRole("textbox", { name: "End time" }),
    ).not.toHaveAttribute("aria-required");
  });

  it("removes required semantics from optional and inactive date controls", () => {
    function Harness() {
      const [mode, setMode] = useState<DatePicker.DatePickerMode>("range");
      const [required, setRequired] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setMode("single")}>
            Use single mode
          </button>
          <button type="button" onClick={() => setRequired(false)}>
            Make optional
          </button>
          <DatePicker.Root
            mode={mode}
            onModeChange={setMode}
            required={required}
          >
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    const startInput = screen.getByRole("textbox", { name: "Start date" });
    const endInput = screen.getByRole("textbox", { name: "End date" });
    expect(startInput).toHaveAttribute("aria-required", "true");
    expect(endInput).toHaveAttribute("aria-required", "true");

    fireEvent.click(screen.getByRole("button", { name: "Use single mode" }));
    expect(screen.getByRole("textbox", { name: "Date" })).toHaveAttribute(
      "aria-required",
      "true",
    );
    expect(endInput).toBeDisabled();
    expect(endInput).not.toHaveAttribute("aria-required");

    fireEvent.click(screen.getByRole("button", { name: "Make optional" }));
    expect(screen.getByRole("textbox", { name: "Date" })).not.toHaveAttribute(
      "aria-required",
    );
  });
});

describe("DatePicker validity notifications", () => {
  it("does not notify again when only the callback identity changes", () => {
    const onValidityChange = vi.fn();

    function Harness() {
      const [renderCount, setRenderCount] = useState(0);
      return (
        <>
          <button
            type="button"
            onClick={() => setRenderCount((count) => count + 1)}
          >
            Rerender {renderCount}
          </button>
          <DatePicker.Root
            onValidityChange={(isValid) => onValidityChange(isValid)}
          >
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    expect(onValidityChange).toHaveBeenCalledOnce();
    expect(onValidityChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole("button", { name: "Rerender 0" }));

    expect(onValidityChange).toHaveBeenCalledOnce();
  });

  it("clears a stale required error when a controlled selection becomes nonempty", () => {
    const onValidityChange = vi.fn();
    const actionsRef = createRef<DatePicker.DatePickerActions>();

    function Harness() {
      const [value, setValue] = useState<Date | null>(null);
      return (
        <>
          <button type="button" onClick={() => setValue(new Date(2026, 1, 12))}>
            Set value
          </button>
          <DatePicker.Root
            required
            actionsRef={actionsRef}
            value={value}
            onValueChange={setValue}
            onValidityChange={onValidityChange}
          >
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    let validationResult: boolean | undefined;
    act(() => {
      validationResult = actionsRef.current?.validate();
    });

    expect(validationResult).toBe(false);
    expect(screen.getByText("Select a date")).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);

    fireEvent.click(screen.getByRole("button", { name: "Set value" }));

    expect(screen.queryByText("Select a date")).not.toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });

  it("defers an empty required error until validation and focuses it immediately", () => {
    const actionsRef = createRef<DatePicker.DatePickerActions>();
    const onValidityChange = vi.fn();
    render(
      <DatePicker.Root
        required
        actionsRef={actionsRef}
        onValidityChange={onValidityChange}
      >
        <DatePicker.Header />
      </DatePicker.Root>,
    );
    const input = screen.getByRole("textbox", { name: "Date" });

    expect(screen.queryByText("Select a date")).not.toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(true);

    let validationResult: boolean | undefined;
    let focusResult: boolean | undefined;
    act(() => {
      validationResult = actionsRef.current?.validate();
      focusResult = actionsRef.current?.focusFirstInvalidControl();
    });

    expect(validationResult).toBe(false);
    expect(screen.getByText("Select a date")).toBeInTheDocument();
    expect(focusResult).toBe(true);
    expect(input).toHaveFocus();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });

  it("dismisses a deferred required error while a legacy range selection starts", () => {
    const actionsRef = createRef<DatePicker.DatePickerActions>();
    const onValidityChange = vi.fn();
    const onValueChange = vi.fn();

    function Harness() {
      const [value, setValue] = useState<{
        start: Date;
        end: Date;
      } | null>(null);
      return (
        <DatePicker.Root
          mode="range"
          required
          actionsRef={actionsRef}
          value={value}
          onValueChange={(nextValue) => {
            onValueChange(nextValue);
            if (!(nextValue instanceof Date)) {
              setValue(nextValue);
            }
          }}
          onValidityChange={onValidityChange}
          defaultMonth={new Date("2026-07-01T00:00:00.000Z")}
          timeZone="UTC"
        >
          <DatePicker.Header />
          <DatePicker.Grid />
        </DatePicker.Root>
      );
    }

    render(<Harness />);
    act(() => {
      expect(actionsRef.current?.validate()).toBe(false);
    });
    expect(screen.getByText("Select a date range")).toBeInTheDocument();

    const start = screen.getByRole("button", {
      name: "Thursday, July 30, 2026",
    });
    fireEvent.click(start);

    expect(start).toHaveAttribute("data-selected");
    expect(screen.queryByText("Select a date range")).not.toBeInTheDocument();
    expect(onValueChange).not.toHaveBeenCalled();
    act(() => {
      expect(actionsRef.current?.validate()).toBe(false);
    });
    expect(screen.getByText("Select a date range")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Friday, July 31, 2026",
      }),
    );

    expect(onValueChange).toHaveBeenCalledWith({
      start: new Date("2026-07-30T00:00:00.000Z"),
      end: new Date("2026-07-31T00:00:00.000Z"),
    });
    expect(screen.queryByText("Select a date range")).not.toBeInTheDocument();
    act(() => {
      expect(actionsRef.current?.validate()).toBe(true);
    });
    expect(onValidityChange.mock.calls).toEqual([
      [true],
      [false],
      [true],
      [false],
      [true],
    ]);
  });

  it.each([
    {
      label: "an empty range",
      rangeDraft: null,
      expectedValid: false,
    },
    {
      label: "a partial range",
      rangeDraft: {
        start: new Date("2026-07-30T00:00:00.000Z"),
        end: null,
      },
      expectedValid: true,
    },
    {
      label: "a complete range",
      rangeDraft: {
        start: new Date("2026-07-30T00:00:00.000Z"),
        end: new Date("2026-07-31T00:00:00.000Z"),
      },
      expectedValid: true,
    },
  ])(
    "validates $label against required selection semantics",
    ({ rangeDraft, expectedValid }) => {
      const actionsRef = createRef<DatePicker.DatePickerActions>();
      render(
        <DatePicker.Root
          mode="range"
          required
          actionsRef={actionsRef}
          rangeDraft={rangeDraft}
        >
          <DatePicker.Header />
        </DatePicker.Root>,
      );

      let validationResult: boolean | undefined;
      act(() => {
        validationResult = actionsRef.current?.validate();
      });

      expect(validationResult).toBe(expectedValid);
      if (expectedValid) {
        expect(
          screen.queryByText("Select a date range"),
        ).not.toBeInTheDocument();
      } else {
        expect(screen.getByText("Select a date range")).toBeInTheDocument();
      }
    },
  );

  it("clears a failed required validation when required becomes false", () => {
    const actionsRef = createRef<DatePicker.DatePickerActions>();
    const onValidityChange = vi.fn();

    function Harness() {
      const [required, setRequired] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setRequired((value) => !value)}>
            Toggle required
          </button>
          <DatePicker.Root
            required={required}
            actionsRef={actionsRef}
            onValidityChange={onValidityChange}
          >
            <DatePicker.Header />
          </DatePicker.Root>
        </>
      );
    }

    render(<Harness />);
    act(() => {
      expect(actionsRef.current?.validate()).toBe(false);
    });
    expect(screen.getByText("Select a date")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Toggle required" }));

    expect(screen.queryByText("Select a date")).not.toBeInTheDocument();
    expect(actionsRef.current?.validate()).toBe(true);
    expect(onValidityChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(screen.getByRole("button", { name: "Toggle required" }));

    expect(screen.queryByText("Select a date")).not.toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
    act(() => {
      expect(actionsRef.current?.validate()).toBe(false);
    });
    expect(screen.getByText("Select a date")).toBeInTheDocument();
  });
});

describe("DatePicker form validation", () => {
  it("does not add internal date inputs to native FormData", () => {
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      return Object.fromEntries(new FormData(event.currentTarget));
    });
    render(
      <form onSubmit={onSubmit}>
        <input name="consumerField" defaultValue="consumer value" />
        <DatePicker.Root
          value={new Date("2026-02-11T09:00:00.000Z")}
          includeTime
        >
          <DatePicker.Header />
        </DatePicker.Root>
        <button type="submit">Submit</button>
      </form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onSubmit).toHaveReturnedWith({
      consumerField: "consumer value",
    });
  });

  it("does not add internal date inputs to Origin Form values", () => {
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <DatePicker.Root
          mode="range"
          includeTime
          value={{
            start: new Date("2026-02-11T09:00:00.000Z"),
            end: new Date("2026-02-12T17:00:00.000Z"),
          }}
        >
          <DatePicker.Header />
        </DatePicker.Root>
        <button type="submit">Submit</button>
      </Form>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onFormSubmit).toHaveBeenCalledWith({}, expect.anything());
  });

  it("prevents native form submission when Enter validates an invalid date", () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <DatePicker.Root>
          <DatePicker.Header />
        </DatePicker.Root>
        <button type="submit">Submit</button>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/31/2026" } });

    expect(fireEvent.keyDown(input, { key: "Enter" })).toBe(false);
    expect(input).toHaveValue("02/31/2026");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("commits a valid Enter edit once without recommitting on blur", () => {
    const onValueChange = vi.fn();
    render(
      <form>
        <DatePicker.Root onValueChange={onValueChange}>
          <DatePicker.Header />
        </DatePicker.Root>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Date" });
    fireEvent.change(input, { target: { value: "02/11/2026" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it("commits a valid time Enter edit once without recommitting on blur", () => {
    const onValueChange = vi.fn();
    render(
      <form>
        <DatePicker.Root
          value={new Date("2026-02-11T09:00:00.000Z")}
          includeTime
          onValueChange={onValueChange}
          timeZone="UTC"
        >
          <DatePicker.Header />
        </DatePicker.Root>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Time (UTC)" });
    fireEvent.change(input, { target: { value: "10:30 AM" } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(onValueChange).toHaveBeenCalledOnce();
  });

  it("blocks Origin Form submit and focuses the first invalid input", () => {
    const onFormSubmit = vi.fn();
    render(
      <Form onFormSubmit={onFormSubmit}>
        <DatePicker.Root mode="range">
          <DatePicker.Header />
        </DatePicker.Root>
        <button type="submit">Submit</button>
      </Form>,
    );
    const start = screen.getByRole("textbox", { name: "Start date" });
    const end = screen.getByRole("textbox", { name: "End date" });
    fireEvent.change(start, { target: { value: "02/31/2026" } });
    fireEvent.keyDown(start, { key: "Enter" });
    fireEvent.change(end, { target: { value: "02/32/2026" } });
    fireEvent.keyDown(end, { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(onFormSubmit).not.toHaveBeenCalled();
    expect(start).toHaveFocus();
  });
});
