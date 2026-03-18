"use client";

import * as React from "react";
import { PhoneInput } from "./";

// Mock country data for tests
const mockCountries = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "JP", name: "Japan", dialCode: "+81" },
];

type Country = (typeof mockCountries)[number];

// Circle-flags CDN URL helper
function getFlagUrl(code: string) {
  return `https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg`;
}

interface PhoneInputStoryProps {
  defaultCountry?: Country;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}

function PhoneInputStory({
  defaultCountry = mockCountries[0],
  disabled = false,
  invalid = false,
  placeholder = "Enter phone",
}: PhoneInputStoryProps) {
  const [selectedCountry, setSelectedCountry] =
    React.useState<Country>(defaultCountry);
  const [phoneNumber, setPhoneNumber] = React.useState("");

  return (
    <PhoneInput.Root disabled={disabled} invalid={invalid}>
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
          {mockCountries.map((country) => (
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
  );
}

// Default state
export function Default() {
  return <PhoneInputStory />;
}

// With pre-selected country
export function WithSelectedCountry() {
  return <PhoneInputStory defaultCountry={mockCountries[1]} />;
}

// Disabled state
export function Disabled() {
  return <PhoneInputStory disabled />;
}

// Invalid state
export function Invalid() {
  return <PhoneInputStory invalid />;
}

// With custom placeholder
export function CustomPlaceholder() {
  return <PhoneInputStory placeholder="(555) 123-4567" />;
}

// Controlled with phone number pre-filled
export function WithPhoneNumber() {
  const [selectedCountry, setSelectedCountry] = React.useState(
    mockCountries[0],
  );
  const [phoneNumber, setPhoneNumber] = React.useState("(530) 949-4902");

  return (
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
          {mockCountries.map((country) => (
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
  );
}

// Invalid with focus (for testing focus-critical ring)
export function InvalidFocused() {
  return <PhoneInputStory invalid />;
}
