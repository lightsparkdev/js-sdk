import { OMIT, type CustomerType } from "./api";
import {
  IDENTIFIER_OMITTED,
  type BusinessForm,
  type IndividualForm,
} from "./forms";

export interface AddressResponse {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface BusinessInfoResponse {
  legalName?: string;
  doingBusinessAs?: string;
  country?: string;
  registrationNumber?: string;
  incorporatedOn?: string;
  entityType?: string;
  taxId?: string;
  countriesOfOperation?: string[];
  businessType?: string;
  purposeOfAccount?: string;
  sourceOfFunds?: string;
  expectedMonthlyTransactionCount?: string;
  expectedMonthlyTransactionVolume?: string;
  expectedRecipientJurisdictions?: string[];
}

export interface CustomerResponse {
  id: string;
  customerType: CustomerType;
  platformCustomerId: string;
  region?: string;
  currencies?: string[];
  email?: string;
  kycStatus?: string;
  kybStatus?: string;
  createdAt?: string;
  isDeleted?: boolean;
  fullName?: string;
  birthDate?: string;
  nationality?: string;
  address?: AddressResponse;
  idType?: string;
  countryOfIssuance?: string;
  sourceOfFundsCategories?: string[];
  sourceOfFundsOtherDescription?: string;
  sourceOfWealthCategories?: string[];
  sourceOfWealthOtherDescription?: string;
  purposeOfAccount?: string;
  purposeOfAccountOtherDescription?: string;
  expectedMonthlyTransactionCount?: string;
  expectedMonthlyTransactionVolume?: string;
  annualIncomeRange?: string;
  netWorthRange?: string;
  pepStatus?: string;
  businessInfo?: BusinessInfoResponse;
}

export interface CustomerListResponse {
  data: CustomerResponse[];
  hasMore?: boolean;
  totalCount?: number;
  nextCursor?: string;
}

export type LoadedCustomer =
  | { customerType: "INDIVIDUAL"; customerId: string; form: IndividualForm }
  | { customerType: "BUSINESS"; customerId: string; form: BusinessForm };

// Grid ids are LSIDs ("Customer:<uuid>") or a bare UUID; anything else is
// treated as the platform's own customer id.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isGridCustomerId(value: string): boolean {
  const v = value.trim();
  return v.startsWith("Customer:") || UUID_RE.test(v);
}

export function displayName(customer: CustomerResponse): string {
  return customer.fullName ?? customer.businessInfo?.legalName ?? "";
}

export function verificationStatus(customer: CustomerResponse): string {
  return customer.kycStatus ?? customer.kybStatus ?? "";
}

export function matchesName(
  customer: CustomerResponse,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return displayName(customer).toLowerCase().includes(q);
}

function joinCsv(values: string[] | undefined, fallback: string): string {
  return values && values.length ? values.join(",") : fallback;
}

function applyAddress<
  T extends Pick<
    IndividualForm,
    | "addrLine1"
    | "addrLine2"
    | "addrCity"
    | "addrState"
    | "addrPostal"
    | "addrCountry"
  >,
>(form: T, address: AddressResponse | undefined): T {
  if (!address) return form;
  return {
    ...form,
    addrLine1: address.line1 ?? "",
    addrLine2: address.line2 ?? "",
    addrCity: address.city ?? "",
    addrState: address.state ?? "",
    addrPostal: address.postalCode ?? "",
    addrCountry: address.country ?? "",
  };
}

// Every field comes from the response or is explicitly empty/OMIT. Nothing
// is carried over from the form that was showing before the load, so a
// later update cannot write another customer's values onto this one.
export function customerToIndividualForm(
  customer: CustomerResponse,
): IndividualForm {
  const form: IndividualForm = {
    platformCustomerId: customer.platformCustomerId,
    region: customer.region ?? "",
    fullName: customer.fullName ?? "",
    birthDate: customer.birthDate ?? "",
    nationality: customer.nationality ?? "",
    email: customer.email ?? "",
    currencies: joinCsv(customer.currencies, ""),
    addrLine1: "",
    addrLine2: "",
    addrCity: "",
    addrState: "",
    addrPostal: "",
    addrCountry: "",
    idType: customer.idType ?? "SSN",
    identifier: IDENTIFIER_OMITTED,
    countryOfIssuance: customer.countryOfIssuance ?? "",
    sourceOfFunds: joinCsv(customer.sourceOfFundsCategories, ""),
    sourceOfFundsOther: customer.sourceOfFundsOtherDescription ?? "",
    sourceOfWealth: joinCsv(customer.sourceOfWealthCategories, ""),
    sourceOfWealthOther: customer.sourceOfWealthOtherDescription ?? "",
    purposeOfAccount: customer.purposeOfAccount ?? OMIT,
    purposeOfAccountOther: customer.purposeOfAccountOtherDescription ?? "",
    txCount: customer.expectedMonthlyTransactionCount ?? OMIT,
    txVolume: customer.expectedMonthlyTransactionVolume ?? OMIT,
    annualIncomeRange: customer.annualIncomeRange ?? OMIT,
    netWorthRange: customer.netWorthRange ?? OMIT,
    pepStatus: customer.pepStatus ?? OMIT,
  };
  return applyAddress(form, customer.address);
}

export function customerToBusinessForm(
  customer: CustomerResponse,
): BusinessForm {
  const info = customer.businessInfo ?? {};
  const form: BusinessForm = {
    platformCustomerId: customer.platformCustomerId,
    region: customer.region ?? "",
    currencies: joinCsv(customer.currencies, ""),
    legalName: info.legalName ?? "",
    doingBusinessAs: info.doingBusinessAs ?? "",
    country: info.country ?? "",
    registrationNumber: info.registrationNumber ?? "",
    incorporatedOn: info.incorporatedOn ?? "",
    entityType: info.entityType ?? "",
    taxId: info.taxId ?? "",
    countriesOfOperation: joinCsv(info.countriesOfOperation, ""),
    businessType: info.businessType ?? "",
    purposeOfAccount: info.purposeOfAccount ?? "",
    sourceOfFunds: info.sourceOfFunds ?? "",
    txCount: info.expectedMonthlyTransactionCount ?? "",
    txVolume: info.expectedMonthlyTransactionVolume ?? "",
    recipientJurisdictions: joinCsv(info.expectedRecipientJurisdictions, ""),
    addrLine1: "",
    addrLine2: "",
    addrCity: "",
    addrState: "",
    addrPostal: "",
    addrCountry: "",
  };
  return applyAddress(form, customer.address);
}

export function toLoadedCustomer(customer: CustomerResponse): LoadedCustomer {
  if (customer.customerType === "BUSINESS") {
    return {
      customerType: "BUSINESS",
      customerId: customer.id,
      form: customerToBusinessForm(customer),
    };
  }
  return {
    customerType: "INDIVIDUAL",
    customerId: customer.id,
    form: customerToIndividualForm(customer),
  };
}
