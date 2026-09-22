import { OMIT, randomSuffix } from "./api";

// Shown in place of the identifier after a load. The API never echoes the
// SSN/ITIN back, and the payload builders skip the field while it holds this.
export const IDENTIFIER_OMITTED = "<omitted>";

export interface IndividualForm {
  platformCustomerId: string;
  region: string;
  fullName: string;
  birthDate: string;
  nationality: string;
  email: string;
  currencies: string;
  addrLine1: string;
  addrLine2: string;
  addrCity: string;
  addrState: string;
  addrPostal: string;
  addrCountry: string;
  idType: string;
  identifier: string;
  countryOfIssuance: string;
  sourceOfFunds: string;
  sourceOfFundsOther: string;
  sourceOfWealth: string;
  sourceOfWealthOther: string;
  purposeOfAccount: string;
  purposeOfAccountOther: string;
  txCount: string;
  txVolume: string;
  annualIncomeRange: string;
  netWorthRange: string;
  pepStatus: string;
}

export interface BusinessForm {
  platformCustomerId: string;
  region: string;
  currencies: string;
  legalName: string;
  doingBusinessAs: string;
  country: string;
  registrationNumber: string;
  incorporatedOn: string;
  entityType: string;
  taxId: string;
  countriesOfOperation: string;
  businessType: string;
  purposeOfAccount: string;
  sourceOfFunds: string;
  txCount: string;
  txVolume: string;
  recipientJurisdictions: string;
  addrLine1: string;
  addrLine2: string;
  addrCity: string;
  addrState: string;
  addrPostal: string;
  addrCountry: string;
}

export function defaultIndividual(): IndividualForm {
  return {
    platformCustomerId: `ind-${randomSuffix()}`,
    region: "US",
    fullName: "Jane Smith",
    birthDate: "1990-01-15",
    nationality: "US",
    email: "",
    currencies: "USD,USDC",
    addrLine1: "123 Market Street",
    addrLine2: "",
    addrCity: "San Francisco",
    addrState: "CA",
    addrPostal: "94105",
    addrCountry: "US",
    idType: "SSN",
    identifier: "123-45-6789",
    countryOfIssuance: "US",
    sourceOfFunds: "SALARY",
    sourceOfFundsOther: "",
    sourceOfWealth: "",
    sourceOfWealthOther: "",
    purposeOfAccount: OMIT,
    purposeOfAccountOther: "",
    txCount: OMIT,
    txVolume: OMIT,
    annualIncomeRange: OMIT,
    netWorthRange: OMIT,
    pepStatus: OMIT,
  };
}

export function defaultBusiness(): BusinessForm {
  return {
    platformCustomerId: `biz-${randomSuffix()}`,
    region: "US",
    currencies: "USD,USDC",
    legalName: "Acme Corporation",
    doingBusinessAs: "Acme",
    country: "US",
    registrationNumber: "5523041",
    incorporatedOn: "2018-03-14",
    entityType: "LLC",
    taxId: "47-1234567",
    countriesOfOperation: "US",
    businessType: "INFORMATION",
    purposeOfAccount: "CONTRACTOR_PAYOUTS",
    sourceOfFunds: "Funds derived from customer payments for software services",
    txCount: "COUNT_100_TO_500",
    txVolume: "VOLUME_100K_TO_1M",
    recipientJurisdictions: "US,MX",
    addrLine1: "123 Market Street",
    addrLine2: "Suite 400",
    addrCity: "San Francisco",
    addrState: "CA",
    addrPostal: "94105",
    addrCountry: "US",
  };
}
