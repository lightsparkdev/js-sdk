"use client";

import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PhoneInput } from "./";
import { Field } from "@/components/Field";

const exampleCountries = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "MX", name: "Mexico", dialCode: "+52" },
];

type Country = (typeof exampleCountries)[number];

function getFlagUrl(code: string) {
  return `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;
}

const meta: Meta = {
  title: "Components/PhoneInput",
  component: PhoneInput.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;

function PhoneInputExample({
  disabled = false,
  placeholder = "Enter phone",
  defaultCountry = exampleCountries[0],
}: {
  disabled?: boolean;
  placeholder?: string;
  defaultCountry?: Country;
}) {
  const [selectedCountry, setSelectedCountry] =
    React.useState<Country>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = React.useState("");

  return (
    <div style={{ width: 300 }}>
      <PhoneInput.Root disabled={disabled}>
        <PhoneInput.CountrySelect
          value={selectedCountry}
          onValueChange={setSelectedCountry}
        >
          <PhoneInput.CountryTrigger aria-label="Select country">
            <PhoneInput.CountryValue>
              {(country: Country) => (
                <>
                  <PhoneInput.CountryFlag>
                    <img src={getFlagUrl(country.code)} alt="" />
                  </PhoneInput.CountryFlag>
                  <span>{country.dialCode}</span>
                </>
              )}
            </PhoneInput.CountryValue>
            <PhoneInput.CountryIcon />
          </PhoneInput.CountryTrigger>

          <PhoneInput.CountryListbox>
            {exampleCountries.map((country) => (
              <PhoneInput.CountryItem key={country.code} value={country}>
                <PhoneInput.CountryFlag>
                  <img src={getFlagUrl(country.code)} alt="" />
                </PhoneInput.CountryFlag>
                <PhoneInput.CountryItemText>
                  {country.name} ({country.dialCode})
                </PhoneInput.CountryItemText>
                <PhoneInput.CountryItemIndicator />
              </PhoneInput.CountryItem>
            ))}
          </PhoneInput.CountryListbox>
        </PhoneInput.CountrySelect>

        <PhoneInput.Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder={placeholder}
        />
      </PhoneInput.Root>
    </div>
  );
}

export const Default: StoryObj<{ disabled?: boolean }> = {
  args: {
    disabled: false,
  },
  render: (args) => <PhoneInputExample disabled={args.disabled} />,
};

export const WithDefaultCountry: StoryObj = {
  render: () => <PhoneInputExample defaultCountry={exampleCountries[1]} />,
};

// Controlled example with form
function ControlledExample() {
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    exampleCountries[0],
  );
  const [phoneNumber, setPhoneNumber] = React.useState("");

  const fullNumber = `${selectedCountry.dialCode} ${phoneNumber}`;

  return (
    <div
      style={{
        width: 300,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <PhoneInput.Root>
        <PhoneInput.CountrySelect
          value={selectedCountry}
          onValueChange={setSelectedCountry}
        >
          <PhoneInput.CountryTrigger aria-label="Select country">
            <PhoneInput.CountryValue>
              {(country: Country) => (
                <>
                  <PhoneInput.CountryFlag>
                    <img src={getFlagUrl(country.code)} alt="" />
                  </PhoneInput.CountryFlag>
                  <span>{country.dialCode}</span>
                </>
              )}
            </PhoneInput.CountryValue>
            <PhoneInput.CountryIcon />
          </PhoneInput.CountryTrigger>

          <PhoneInput.CountryListbox>
            {exampleCountries.map((country) => (
              <PhoneInput.CountryItem key={country.code} value={country}>
                <PhoneInput.CountryFlag>
                  <img src={getFlagUrl(country.code)} alt="" />
                </PhoneInput.CountryFlag>
                <PhoneInput.CountryItemText>
                  {country.name} ({country.dialCode})
                </PhoneInput.CountryItemText>
                <PhoneInput.CountryItemIndicator />
              </PhoneInput.CountryItem>
            ))}
          </PhoneInput.CountryListbox>
        </PhoneInput.CountrySelect>

        <PhoneInput.Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone"
        />
      </PhoneInput.Root>

      <div style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
        <strong>Full number:</strong> {fullNumber || "(empty)"}
      </div>
    </div>
  );
}

export const Controlled: StoryObj = {
  render: () => <ControlledExample />,
};

// Field integration example
function WithFieldExample() {
  const [selectedCountry, setSelectedCountry] = React.useState<Country>(
    exampleCountries[0],
  );
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [invalid, setInvalid] = React.useState(false);

  const handleBlur = () => {
    // Simple validation: phone number should be at least 7 digits
    const digitsOnly = phoneNumber.replace(/\D/g, "");
    setInvalid(phoneNumber.length > 0 && digitsOnly.length < 7);
  };

  return (
    <div style={{ width: 300 }}>
      <Field.Root invalid={invalid}>
        <Field.Label>Phone number</Field.Label>
        <PhoneInput.Root invalid={invalid}>
          <PhoneInput.CountrySelect
            value={selectedCountry}
            onValueChange={setSelectedCountry}
          >
            <PhoneInput.CountryTrigger aria-label="Select country">
              <PhoneInput.CountryValue>
                {(country: Country) => (
                  <>
                    <PhoneInput.CountryFlag>
                      <img src={getFlagUrl(country.code)} alt="" />
                    </PhoneInput.CountryFlag>
                    <span>{country.dialCode}</span>
                  </>
                )}
              </PhoneInput.CountryValue>
              <PhoneInput.CountryIcon />
            </PhoneInput.CountryTrigger>

            <PhoneInput.CountryListbox>
              {exampleCountries.map((country) => (
                <PhoneInput.CountryItem key={country.code} value={country}>
                  <PhoneInput.CountryFlag>
                    <img src={getFlagUrl(country.code)} alt="" />
                  </PhoneInput.CountryFlag>
                  <PhoneInput.CountryItemText>
                    {country.name} ({country.dialCode})
                  </PhoneInput.CountryItemText>
                  <PhoneInput.CountryItemIndicator />
                </PhoneInput.CountryItem>
              ))}
            </PhoneInput.CountryListbox>
          </PhoneInput.CountrySelect>

          <PhoneInput.Input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            onBlur={handleBlur}
            placeholder="Enter phone"
          />
        </PhoneInput.Root>
        <Field.Description>Include area code</Field.Description>
        <Field.Error>Please enter a valid phone number</Field.Error>
      </Field.Root>
    </div>
  );
}

export const WithField: StoryObj = {
  render: () => <WithFieldExample />,
};
