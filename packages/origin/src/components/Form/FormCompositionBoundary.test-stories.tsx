"use client";

import * as React from "react";
import { Button } from "@/components/Button";
import { Checkbox } from "@/components/Checkbox";
import { Combobox } from "@/components/Combobox";
import { Field } from "@/components/Field";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Form } from "./Form";

type ProductOption = {
  value: string;
  label: string;
};

const entityTypeOptions: ProductOption[] = [
  { value: "corporation", label: "Corporation" },
  { value: "llc", label: "Limited liability company" },
  { value: "partnership", label: "Partnership" },
];

const countryOptions: ProductOption[] = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
];

const businessTypeOptions: ProductOption[] = [
  { value: "marketplace", label: "Marketplace" },
  { value: "financial-services", label: "Financial services" },
  { value: "software", label: "Software" },
];

const ownerRoleOptions: ProductOption[] = [
  { value: "control-person", label: "Control person" },
  { value: "beneficial-owner", label: "Beneficial owner" },
  { value: "signer", label: "Signer" },
];

const ownerRoleValues = ownerRoleOptions.map((option) => option.value);

const RenderedFormFieldRoot = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"section">
>(function RenderedFormFieldRoot(props, ref) {
  return <section ref={ref} data-custom-root="" {...props} />;
});

function getLabel(options: ProductOption[], value: string | null) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function removeError(errors: Record<string, string>, name: string) {
  const { [name]: _removed, ...remaining } = errors;
  return remaining;
}

/**
 * Form composition boundary coverage for KYB-shaped product forms.
 *
 * This is intentionally not a product migration or a product adapter. It keeps
 * product state as strings, maps `{ value, label }` options at the call site,
 * and uses Origin primitives directly.
 *
 * Current composition boundaries to keep visible:
 * - `Field.Root render` is part of the supported contract: root slot
 *   replacement keeps Origin styling, merged classes, and Form invalid state.
 * - Composite fields receive invalid state from `Form errors` when the
 *   `Field.Root name` matches the errors key. Product-owned errors outside
 *   `Form errors` still need explicit `invalid` wiring.
 */
export function KybOriginFormCompositionBoundary() {
  const [legalName, setLegalName] = React.useState("");
  const [entityType, setEntityType] = React.useState<string | null>(null);
  const [registrationCountry, setRegistrationCountry] = React.useState<
    string | null
  >(null);
  const [countrySearch, setCountrySearch] = React.useState("");
  const [countryOpen, setCountryOpen] = React.useState(false);
  const [serverErrors, setServerErrors] = React.useState<
    Record<string, string>
  >({});
  const [businessPurpose, setBusinessPurpose] = React.useState("");
  const [businessPurposeError, setBusinessPurposeError] = React.useState("");
  const [comboboxRoles, setComboboxRoles] = React.useState<string[]>([]);
  const [checkboxRoles, setCheckboxRoles] = React.useState<string[]>([
    "control-person",
  ]);
  const [countryPortal, setCountryPortal] =
    React.useState<HTMLDivElement | null>(null);
  const legalNameInputRef = React.useRef<HTMLInputElement>(null);
  const registrationCountryInputRef = React.useRef<HTMLInputElement>(null);

  const selectedCountry =
    countryOptions.find((option) => option.value === registrationCountry) ??
    null;

  const handleLegalNameChange = (value: string) => {
    setLegalName(value);
    setServerErrors((current) => removeError(current, "legalName"));
  };

  const handleCountryChange = (option: ProductOption | null) => {
    setRegistrationCountry(option?.value ?? null);
    setServerErrors((current) => removeError(current, "registrationCountry"));
  };

  const handleBusinessPurposeChange = (value: string) => {
    setBusinessPurpose(value);
    if (businessPurposeError && value.trim()) {
      setBusinessPurposeError("");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: Record<string, string> = {};
    if (!legalName.trim()) {
      nextErrors.legalName = "Enter a legal business name";
    }
    if (!registrationCountry) {
      nextErrors.registrationCountry = "Select a registration country";
    }

    setServerErrors(nextErrors);
    setBusinessPurposeError(
      businessPurpose.trim() ? "" : "Enter a business purpose",
    );

    const firstInvalidInput = nextErrors.legalName
      ? legalNameInputRef.current
      : nextErrors.registrationCountry
      ? registrationCountryInputRef.current
      : null;
    firstInvalidInput?.focus();
  };

  return (
    <div>
      <Form errors={serverErrors} onSubmit={handleSubmit}>
        <Field.Root name="legalName">
          <Field.Label>Legal business name</Field.Label>
          <Input
            ref={legalNameInputRef}
            value={legalName}
            onValueChange={handleLegalNameChange}
            placeholder="Enter legal business name"
          />
          <Field.Error>Enter a legal business name</Field.Error>
        </Field.Root>

        <Field.Root name="entityType">
          <Field.Label>Entity type</Field.Label>
          <Select.Root value={entityType} onValueChange={setEntityType}>
            <Select.Trigger data-testid="entity-type-trigger">
              <Select.Value placeholder="Select entity type">
                {(value: string | null) => getLabel(entityTypeOptions, value)}
              </Select.Value>
              <Select.Icon />
            </Select.Trigger>
            <Select.Portal>
              <Select.Positioner align="start" sideOffset={8}>
                <Select.Popup>
                  <Select.List>
                    {entityTypeOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        <Select.ItemIndicator />
                        <Select.ItemText>{option.label}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Field.Root>

        <Field.Root
          name="registrationCountry"
          invalid={Boolean(serverErrors.registrationCountry)}
        >
          <Field.Label>Registration country</Field.Label>
          <Combobox.Root<ProductOption>
            items={countryOptions}
            value={selectedCountry}
            onValueChange={handleCountryChange}
            inputValue={countrySearch}
            onInputValueChange={setCountrySearch}
            open={countryOpen}
            onOpenChange={setCountryOpen}
            itemToStringValue={(option) => option.label}
          >
            <Combobox.InputWrapper>
              <Combobox.Input
                ref={registrationCountryInputRef}
                placeholder="Search countries"
              />
              <Combobox.ActionButtons>
                <Combobox.Clear aria-label="Clear country" />
                <Combobox.Trigger aria-label="Open countries" />
              </Combobox.ActionButtons>
            </Combobox.InputWrapper>
            <div data-testid="country-portal" ref={setCountryPortal} />
            {countryPortal && (
              <Combobox.Portal container={countryPortal}>
                <Combobox.Positioner sideOffset={8}>
                  <Combobox.Popup>
                    <Combobox.Empty>No countries found</Combobox.Empty>
                    <Combobox.List>
                      {(option: ProductOption) => (
                        <Combobox.Item key={option.value} value={option}>
                          <Combobox.ItemIndicator />
                          <Combobox.ItemText>{option.label}</Combobox.ItemText>
                        </Combobox.Item>
                      )}
                    </Combobox.List>
                  </Combobox.Popup>
                </Combobox.Positioner>
              </Combobox.Portal>
            )}
          </Combobox.Root>
          <Field.Error>Select a registration country</Field.Error>
        </Field.Root>

        <Field.Root invalid={Boolean(businessPurposeError)}>
          <Field.Label>Business purpose</Field.Label>
          <Input
            value={businessPurpose}
            onValueChange={handleBusinessPurposeChange}
            placeholder="Describe business purpose"
          />
          <Field.Error>{businessPurposeError}</Field.Error>
        </Field.Root>

        <Field.Root>
          <Field.Label>Combobox owner roles</Field.Label>
          <Combobox.Root<string, true>
            multiple
            items={ownerRoleValues}
            value={comboboxRoles}
            onValueChange={setComboboxRoles}
          >
            <Combobox.InputWrapper>
              <Combobox.Chips>
                <Combobox.Value>
                  {(values: string[]) => (
                    <>
                      {values.map((value) => {
                        const label = getLabel(ownerRoleOptions, value);
                        return (
                          <Combobox.Chip key={value}>
                            {label}
                            <Combobox.ChipRemove
                              aria-label={`Remove ${label}`}
                            />
                          </Combobox.Chip>
                        );
                      })}
                      <Combobox.Input placeholder="Add owner roles" />
                    </>
                  )}
                </Combobox.Value>
              </Combobox.Chips>
            </Combobox.InputWrapper>
            <Combobox.Portal>
              <Combobox.Positioner sideOffset={4}>
                <Combobox.Popup>
                  <Combobox.List>
                    {(value: string) => (
                      <Combobox.Item key={value} value={value}>
                        <Combobox.ItemCheckbox />
                        <Combobox.ItemText>
                          {getLabel(ownerRoleOptions, value)}
                        </Combobox.ItemText>
                      </Combobox.Item>
                    )}
                  </Combobox.List>
                </Combobox.Popup>
              </Combobox.Positioner>
            </Combobox.Portal>
          </Combobox.Root>
        </Field.Root>

        <Checkbox.Field>
          <Checkbox.Legend>Checkbox owner roles</Checkbox.Legend>
          <Checkbox.Group
            value={checkboxRoles}
            onValueChange={setCheckboxRoles}
          >
            {ownerRoleOptions.map((option) => (
              <Checkbox.Item
                key={option.value}
                value={option.value}
                label={option.label}
                data-testid={`checkbox-role-${option.value}`}
              />
            ))}
          </Checkbox.Group>
        </Checkbox.Field>

        <Button type="submit">Review</Button>
      </Form>

      <output data-testid="legal-name-value">
        {legalName || "no legal name"}
      </output>
      <output data-testid="entity-type-value">{entityType ?? "none"}</output>
      <output data-testid="country-value">
        {registrationCountry ?? "none"}
      </output>
      <output data-testid="country-search-value">
        {countrySearch || "empty"}
      </output>
      <output data-testid="country-open-state">
        {countryOpen ? "open" : "closed"}
      </output>
      <output data-testid="combobox-roles-value">
        {comboboxRoles.join(",") || "none"}
      </output>
      <output data-testid="checkbox-roles-value">
        {checkboxRoles.join(",") || "none"}
      </output>
    </div>
  );
}

export function CompositeFormErrorsBoundary() {
  return (
    <Form
      errors={{
        country: "Select a country",
        businessType: "Select a business type",
      }}
    >
      <Field.Root name="country">
        <Field.Label>Country</Field.Label>
        <Select.Root>
          <Select.Trigger data-testid="country-trigger">
            <Select.Value placeholder="Select country">
              {(value: string | null) => getLabel(countryOptions, value)}
            </Select.Value>
            <Select.Icon />
          </Select.Trigger>
          <Select.Portal>
            <Select.Positioner align="start" sideOffset={8}>
              <Select.Popup>
                <Select.List>
                  {countryOptions.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      <Select.ItemIndicator />
                      <Select.ItemText>{option.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>
        <Field.Error>Select a country</Field.Error>
      </Field.Root>

      <Field.Root name="businessType">
        <Field.Label>Business type</Field.Label>
        <Combobox.Root<ProductOption>
          items={businessTypeOptions}
          itemToStringValue={(option) => option.label}
        >
          <Combobox.InputWrapper data-testid="business-type-wrapper">
            <Combobox.Input placeholder="Search business types" />
            <Combobox.ActionButtons>
              <Combobox.Trigger aria-label="Open business types" />
            </Combobox.ActionButtons>
          </Combobox.InputWrapper>
          <Combobox.Portal>
            <Combobox.Positioner sideOffset={8}>
              <Combobox.Popup>
                <Combobox.Empty>No business types found</Combobox.Empty>
                <Combobox.List>
                  {(option: ProductOption) => (
                    <Combobox.Item key={option.value} value={option}>
                      <Combobox.ItemIndicator />
                      <Combobox.ItemText>{option.label}</Combobox.ItemText>
                    </Combobox.Item>
                  )}
                </Combobox.List>
              </Combobox.Popup>
            </Combobox.Positioner>
          </Combobox.Portal>
        </Combobox.Root>
        <Field.Error>Select a business type</Field.Error>
      </Field.Root>
    </Form>
  );
}

export function FieldRootRenderFormBoundary() {
  return (
    <Form
      errors={{
        registeredName: "Enter a registered business name",
      }}
    >
      <Field.Root
        name="registeredName"
        className="consumer-form-field-root"
        render={
          <RenderedFormFieldRoot
            className="rendered-form-field-root"
            data-testid="form-rendered-field-root"
          />
        }
      >
        <Field.Label>Registered business name</Field.Label>
        <Input placeholder="Enter registered business name" />
        <Field.Error>Enter a registered business name</Field.Error>
      </Field.Root>
    </Form>
  );
}
