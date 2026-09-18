import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import * as React from "react";
import { PhoneInput } from "./";
import { Field } from "../Field";

interface Country {
  code: string;
  name: string;
  dialCode: string;
}

const countries: Country[] = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
];

/**
 * Mirrors the consumer arrangement that exposed the name collision: one
 * Field.Root wrapping both the country Select and the phone input, where
 * only the phone input carries a form name.
 */
function renderPhoneForm({ countryName }: { countryName?: string } = {}) {
  const entries: Array<[string, FormDataEntryValue]> = [];

  const utils = render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        entries.push(...new FormData(event.currentTarget).entries());
      }}
    >
      <Field.Root>
        <Field.Label>Phone number</Field.Label>
        <PhoneInput.Root>
          <PhoneInput.CountrySelect
            defaultValue={countries[0]}
            name={countryName}
            itemToStringValue={(country: Country) => country.code}
          >
            <PhoneInput.CountryTrigger aria-label="Select country">
              <PhoneInput.CountryValue>
                {(country: Country) => <span>{country.dialCode}</span>}
              </PhoneInput.CountryValue>
              <PhoneInput.CountryIcon />
            </PhoneInput.CountryTrigger>
            <PhoneInput.CountryListbox>
              {countries.map((country) => (
                <PhoneInput.CountryItem key={country.code} value={country}>
                  <PhoneInput.CountryItemText>
                    {country.name} ({country.dialCode})
                  </PhoneInput.CountryItemText>
                </PhoneInput.CountryItem>
              ))}
            </PhoneInput.CountryListbox>
          </PhoneInput.CountrySelect>
          <PhoneInput.Input
            name="phoneNumber"
            defaultValue="5551234567"
            placeholder="Enter phone"
          />
        </PhoneInput.Root>
      </Field.Root>
    </form>,
  );

  const form = utils.container.querySelector("form");
  if (!form) {
    throw new Error("Harness form is missing");
  }

  return { ...utils, form, entries };
}

/**
 * State propagation harness: the nested field boundary inside CountrySelect
 * must not swallow PhoneInput's own disabled/invalid state on its way to
 * the country trigger.
 */
function renderPhoneWithRootState({
  invalid,
  disabled,
}: {
  invalid?: boolean;
  disabled?: boolean;
} = {}) {
  const utils = render(
    <Field.Root invalid={invalid} disabled={disabled}>
      <Field.Label>Phone number</Field.Label>
      <PhoneInput.Root invalid={invalid} disabled={disabled}>
        <PhoneInput.CountrySelect
          defaultValue={countries[0]}
          itemToStringValue={(country: Country) => country.code}
        >
          <PhoneInput.CountryTrigger aria-label="Select country">
            <PhoneInput.CountryValue>
              {(country: Country) => <span>{country.dialCode}</span>}
            </PhoneInput.CountryValue>
            <PhoneInput.CountryIcon />
          </PhoneInput.CountryTrigger>
          <PhoneInput.CountryListbox>
            {countries.map((country) => (
              <PhoneInput.CountryItem key={country.code} value={country}>
                <PhoneInput.CountryItemText>
                  {country.name} ({country.dialCode})
                </PhoneInput.CountryItemText>
              </PhoneInput.CountryItem>
            ))}
          </PhoneInput.CountryListbox>
        </PhoneInput.CountrySelect>
        <PhoneInput.Input name="phoneNumber" placeholder="Enter phone" />
      </PhoneInput.Root>
    </Field.Root>,
  );

  const trigger = utils.container.querySelector<HTMLButtonElement>(
    "[data-phone-input-trigger]",
  );
  if (!trigger) {
    throw new Error("Country trigger is missing");
  }

  return { ...utils, trigger };
}

describe("PhoneInput state propagation", () => {
  it("marks the country trigger invalid when PhoneInput.Root is invalid", () => {
    const { trigger } = renderPhoneWithRootState({ invalid: true });

    expect(trigger.hasAttribute("data-invalid")).toBe(true);
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
  });

  it("disables the country trigger when PhoneInput.Root is disabled", () => {
    const { trigger } = renderPhoneWithRootState({ disabled: true });

    expect(trigger.disabled).toBe(true);
    expect(trigger.hasAttribute("data-disabled")).toBe(true);
  });

  it("leaves the country trigger enabled and valid by default", () => {
    const { trigger } = renderPhoneWithRootState();

    expect(trigger.disabled).toBe(false);
    expect(trigger.hasAttribute("data-invalid")).toBe(false);
  });
});

describe("PhoneInput locked country", () => {
  function renderLocked() {
    const utils = render(
      <PhoneInput.Root>
        <PhoneInput.LockedCountry>
          <PhoneInput.CountryFlag />
          <span>+1</span>
        </PhoneInput.LockedCountry>
        <PhoneInput.Input placeholder="Enter phone" />
      </PhoneInput.Root>,
    );

    const locked = utils.container.querySelector<HTMLElement>(
      "[data-phone-input-locked]",
    );
    if (!locked) {
      throw new Error("Locked country cap is missing");
    }

    return { ...utils, locked };
  }

  it("renders a static element with no select semantics", () => {
    const { locked, queryByRole } = renderLocked();

    expect(queryByRole("combobox")).toBeNull();
    expect(locked.tagName).toBe("DIV");
    expect(locked.getAttribute("aria-haspopup")).toBeNull();
    expect(locked.tabIndex).toBe(-1);
  });

  it("keeps the dial code as real, non-hidden content", () => {
    const { locked, getByText } = renderLocked();

    expect(locked.getAttribute("aria-hidden")).toBeNull();
    expect(getByText("+1")).toBeTruthy();
  });

  it("does not render the country Select's hidden serialization input", () => {
    const { container } = renderLocked();

    expect(container.querySelector('input[aria-hidden="true"]')).toBeNull();
  });

  it("forwards native div props and refs", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <PhoneInput.Root>
        <PhoneInput.LockedCountry ref={ref} data-testid="locked-cap">
          <span>+44</span>
        </PhoneInput.LockedCountry>
        <PhoneInput.Input placeholder="Enter phone" />
      </PhoneInput.Root>,
    );

    expect(ref.current).not.toBeNull();
    expect(ref.current?.getAttribute("data-testid")).toBe("locked-cap");
  });
});

describe("PhoneInput form serialization", () => {
  it("does not leak the phone input's field name onto the country Select's hidden input", () => {
    const { form, container, entries } = renderPhoneForm();

    const namedControls = container.querySelectorAll('[name="phoneNumber"]');
    expect(namedControls).toHaveLength(1);
    expect(namedControls[0].tagName).toBe("INPUT");
    expect(namedControls[0].getAttribute("aria-hidden")).toBeNull();

    const hiddenSelectInput = container.querySelector(
      'input[aria-hidden="true"]',
    );
    expect(hiddenSelectInput).not.toBeNull();
    expect(hiddenSelectInput?.hasAttribute("name")).toBe(false);

    fireEvent.submit(form);

    const phoneEntries = entries.filter(([key]) => key === "phoneNumber");
    expect(phoneEntries).toHaveLength(1);
    expect(phoneEntries[0][1]).toBe("5551234567");
  });

  it("serializes the country under its own name when CountrySelect receives one", () => {
    const { form, container, entries } = renderPhoneForm({
      countryName: "phoneCountry",
    });

    const hiddenSelectInput = container.querySelector(
      'input[aria-hidden="true"]',
    );
    expect(hiddenSelectInput?.getAttribute("name")).toBe("phoneCountry");

    fireEvent.submit(form);

    const phoneEntries = entries.filter(([key]) => key === "phoneNumber");
    expect(phoneEntries).toHaveLength(1);
    expect(phoneEntries[0][1]).toBe("5551234567");

    const countryEntries = entries.filter(([key]) => key === "phoneCountry");
    expect(countryEntries).toHaveLength(1);
    expect(countryEntries[0][1]).toBe("US");
  });
});
