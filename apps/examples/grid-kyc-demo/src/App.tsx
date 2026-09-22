import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Textarea,
} from "@lightsparkdev/origin";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  callGrid,
  ENV_LABELS,
  nowTs,
  OMIT,
  randomSuffix,
  type CustomerCreateResponse,
  type CustomerType,
  type GridCredentials,
  type GridEnv,
  type GridMethod,
  type KycLinkResponse,
  type LogEntry,
  type RunCall,
} from "./api";
import { ProgrammaticFlow } from "./ProgrammaticFlow";
import {
  ButtonRow,
  Divider,
  ResultMeta,
  ResultPanel,
  Row,
  SectionLabel,
  SelectControl,
} from "./ui";

type KycFlow = "LINK" | "API";
type FlowMode = "HOSTED" | "SDK";
type Status = { kind: "ok" | "err"; message: string } | null;

const ENV_STORAGE_KEY = "grid-kyc-demo:env";
const CREDS_STORAGE_KEY_PREFIX = "grid-kyc-demo:creds:";

const ENTITY_TYPES = [
  "SOLE_PROPRIETORSHIP",
  "PARTNERSHIP",
  "LLC",
  "CORPORATION",
  "S_CORPORATION",
  "NON_PROFIT",
  "OTHER",
] as const;

const BUSINESS_TYPES = [
  "AGRICULTURE_FORESTRY_FISHING_AND_HUNTING",
  "MINING_QUARRYING_AND_OIL_AND_GAS_EXTRACTION",
  "UTILITIES",
  "CONSTRUCTION",
  "MANUFACTURING",
  "WHOLESALE_TRADE",
  "RETAIL_TRADE",
  "TRANSPORTATION_AND_WAREHOUSING",
  "INFORMATION",
  "FINANCE_AND_INSURANCE",
  "REAL_ESTATE_AND_RENTAL_AND_LEASING",
  "PROFESSIONAL_SCIENTIFIC_AND_TECHNICAL_SERVICES",
  "MANAGEMENT_OF_COMPANIES_AND_ENTERPRISES",
  "ADMINISTRATIVE_AND_SUPPORT_AND_WASTE_MANAGEMENT_AND_REMEDIATION_SERVICES",
  "EDUCATIONAL_SERVICES",
  "HEALTH_CARE_AND_SOCIAL_ASSISTANCE",
  "ARTS_ENTERTAINMENT_AND_RECREATION",
  "ACCOMMODATION_AND_FOOD_SERVICES",
  "OTHER_SERVICES",
  "PUBLIC_ADMINISTRATION",
] as const;

const PURPOSE_OF_ACCOUNT = [
  "CONTRACTOR_PAYOUTS",
  "CREATOR_PAYOUTS",
  "EMPLOYEE_PAYOUTS",
  "MARKETPLACE_SELLER_PAYOUTS",
  "SUPPLIER_PAYMENTS",
  "CROSS_BORDER_B2B",
  "AR_AUTOMATION",
  "AP_AUTOMATION",
  "EMBEDDED_PAYMENTS",
  "PLATFORM_FEE_COLLECTION",
  "P2P_TRANSFERS",
  "CHARITABLE_DONATIONS",
  "OTHER",
] as const;

const TX_COUNT = [
  "COUNT_UNDER_10",
  "COUNT_10_TO_100",
  "COUNT_100_TO_500",
  "COUNT_500_TO_1000",
  "COUNT_OVER_1000",
] as const;

const TX_VOLUME = [
  "VOLUME_UNDER_10K",
  "VOLUME_10K_TO_100K",
  "VOLUME_100K_TO_1M",
  "VOLUME_1M_TO_10M",
  "VOLUME_OVER_10M",
] as const;

const INDIVIDUAL_ID_TYPES = ["SSN", "ITIN"] as const;

const INDIVIDUAL_SOURCE_OF_FUNDS = [
  "SALARY",
  "SELF_EMPLOYMENT_INCOME",
  "INVESTMENT_INCOME",
  "PENSION",
  "RENTAL_INCOME",
  "GIFT",
  "INHERITANCE",
  "LOAN",
  "SAVINGS",
  "SALE_OF_ASSETS",
  "OTHER",
] as const;

const SOURCE_OF_WEALTH = [
  "SALARY",
  "BUSINESS_INCOME",
  "INVESTMENTS",
  "INHERITANCE",
  "PROPERTY_SALE",
  "GIFT",
  "RETIREMENT",
  "SAVINGS",
  "OTHER",
] as const;

const ANNUAL_INCOME_RANGE = [
  "UNDER_50K",
  "RANGE_50K_100K",
  "RANGE_100K_250K",
  "RANGE_250K_1M",
  "OVER_1M",
] as const;

const NET_WORTH_RANGE = [
  "UNDER_100K",
  "RANGE_100K_500K",
  "RANGE_500K_1M",
  "RANGE_1M_5M",
  "RANGE_5M_25M",
  "OVER_25M",
] as const;

const PEP_STATUS = [
  "NONE",
  "DOMESTIC",
  "FOREIGN",
  "HIO",
  "FAMILY_OR_ASSOCIATE",
] as const;

interface IndividualForm {
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

interface BusinessForm {
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

function defaultIndividual(): IndividualForm {
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

function defaultBusiness(): BusinessForm {
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

function splitCsv(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildIndividualCore(form: IndividualForm): Record<string, unknown> {
  const currencies = splitCsv(form.currencies);
  const data: Record<string, unknown> = {
    fullName: form.fullName.trim(),
    birthDate: form.birthDate,
    nationality: form.nationality.trim(),
  };
  if (currencies.length) data.currencies = currencies;
  if (form.email.trim()) data.email = form.email.trim();
  return data;
}

function buildIndividualKycData(form: IndividualForm): Record<string, unknown> {
  const data = buildIndividualCore(form);
  if (form.addrLine1.trim() && form.addrPostal.trim() && form.addrCountry.trim()) {
    const address: Record<string, unknown> = {
      line1: form.addrLine1.trim(),
      postalCode: form.addrPostal.trim(),
      country: form.addrCountry.trim(),
    };
    if (form.addrCity.trim()) address.city = form.addrCity.trim();
    if (form.addrState.trim()) address.state = form.addrState.trim();
    if (form.addrLine2.trim()) address.line2 = form.addrLine2.trim();
    data.address = address;
  }
  if (form.identifier.trim()) {
    data.idType = form.idType;
    data.identifier = form.identifier.trim();
    if (form.countryOfIssuance.trim())
      data.countryOfIssuance = form.countryOfIssuance.trim();
  }
  const sourceOfFunds = splitCsv(form.sourceOfFunds);
  if (sourceOfFunds.length) data.sourceOfFundsCategories = sourceOfFunds;
  if (sourceOfFunds.includes("OTHER") && form.sourceOfFundsOther.trim())
    data.sourceOfFundsOtherDescription = form.sourceOfFundsOther.trim();
  const sourceOfWealth = splitCsv(form.sourceOfWealth);
  if (sourceOfWealth.length) data.sourceOfWealthCategories = sourceOfWealth;
  if (sourceOfWealth.includes("OTHER") && form.sourceOfWealthOther.trim())
    data.sourceOfWealthOtherDescription = form.sourceOfWealthOther.trim();
  if (form.purposeOfAccount !== OMIT) data.purposeOfAccount = form.purposeOfAccount;
  if (form.purposeOfAccount === "OTHER" && form.purposeOfAccountOther.trim())
    data.purposeOfAccountOtherDescription = form.purposeOfAccountOther.trim();
  if (form.txCount !== OMIT) data.expectedMonthlyTransactionCount = form.txCount;
  if (form.txVolume !== OMIT) data.expectedMonthlyTransactionVolume = form.txVolume;
  if (form.annualIncomeRange !== OMIT) data.annualIncomeRange = form.annualIncomeRange;
  if (form.netWorthRange !== OMIT) data.netWorthRange = form.netWorthRange;
  if (form.pepStatus !== OMIT) data.pepStatus = form.pepStatus;
  return data;
}

function buildIndividualPayload(
  form: IndividualForm,
  includeKycData: boolean,
): Record<string, unknown> {
  return {
    customerType: "INDIVIDUAL",
    platformCustomerId: form.platformCustomerId.trim(),
    region: form.region.trim(),
    ...(includeKycData ? buildIndividualKycData(form) : buildIndividualCore(form)),
  };
}

function buildIndividualUpdatePayload(
  form: IndividualForm,
): Record<string, unknown> {
  return { customerType: "INDIVIDUAL", ...buildIndividualKycData(form) };
}

function buildBusinessKycData(form: BusinessForm): Record<string, unknown> {
  const currencies = splitCsv(form.currencies);
  const businessInfo: Record<string, unknown> = {
    legalName: form.legalName.trim(),
    country: form.country.trim(),
    registrationNumber: form.registrationNumber.trim(),
    incorporatedOn: form.incorporatedOn,
    entityType: form.entityType,
    taxId: form.taxId.trim(),
    countriesOfOperation: splitCsv(form.countriesOfOperation),
    businessType: form.businessType,
    purposeOfAccount: form.purposeOfAccount,
    sourceOfFunds: form.sourceOfFunds.trim(),
    expectedMonthlyTransactionCount: form.txCount,
    expectedMonthlyTransactionVolume: form.txVolume,
    expectedRecipientJurisdictions: splitCsv(form.recipientJurisdictions),
  };
  if (form.doingBusinessAs.trim())
    businessInfo.doingBusinessAs = form.doingBusinessAs.trim();

  const address: Record<string, unknown> = {
    line1: form.addrLine1.trim(),
    postalCode: form.addrPostal.trim(),
    country: form.addrCountry.trim(),
  };
  if (form.addrCity.trim()) address.city = form.addrCity.trim();
  if (form.addrState.trim()) address.state = form.addrState.trim();
  if (form.addrLine2.trim()) address.line2 = form.addrLine2.trim();

  const data: Record<string, unknown> = { businessInfo, address };
  if (currencies.length) data.currencies = currencies;
  return data;
}

function buildBusinessPayload(form: BusinessForm): Record<string, unknown> {
  return {
    customerType: "BUSINESS",
    platformCustomerId: form.platformCustomerId.trim(),
    region: form.region.trim(),
    ...buildBusinessKycData(form),
  };
}

function buildBusinessUpdatePayload(form: BusinessForm): Record<string, unknown> {
  return { customerType: "BUSINESS", ...buildBusinessKycData(form) };
}

export function App() {
  const [env, setEnv] = useState<GridEnv>(envInitial);
  const [creds, setCreds] = useState<GridCredentials>(() =>
    loadCreds(envInitial()),
  );
  const [customerType, setCustomerType] = useState<CustomerType>("INDIVIDUAL");
  const [individual, setIndividual] = useState<IndividualForm>(
    defaultIndividual,
  );
  const [business, setBusiness] = useState<BusinessForm>(defaultBusiness);
  const [customerId, setCustomerId] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [kycFlow, setKycFlow] = useState<KycFlow>("LINK");
  const [flowMode, setFlowMode] = useState<FlowMode>("HOSTED");
  const [kycLink, setKycLink] = useState<KycLinkResponse | null>(null);
  // SdkLauncher owns its own launched-or-not state so it resets cleanly on
  // remount (Hosted ⇄ SDK mode cycles, regenerating the link). Lifting it
  // here would leave a stale `true` value that hides the Launch button and
  // shows an empty iframe container.

  const [pingStatus, setPingStatus] = useState<Status>(null);
  const [createStatus, setCreateStatus] = useState<Status>(null);
  const [linkStatus, setLinkStatus] = useState<Status>(null);
  const [fetchStatus, setFetchStatus] = useState<Status>(null);

  const [log, setLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  // Persist env across reloads; swap creds when env changes.
  useEffect(() => {
    sessionStorage.setItem(ENV_STORAGE_KEY, env);
    setCreds(loadCreds(env));
  }, [env]);

  // Persist creds synchronously when the user edits them. We can't run this
  // through a `[creds, env]` effect: that fires once with (oldCreds, newEnv)
  // mid-transition during an env switch, briefly writing the previous
  // env's credentials into the new env's storage slot before the next
  // render corrects it. Driving the write from the input handlers and
  // `onClearCreds` keeps persistence in lockstep with the action that
  // caused it, and the env-swap effect above owns its own loadCreds
  // round-trip.
  const persistCreds = useCallback(
    (next: GridCredentials) => {
      const id = next.id.trim();
      const secret = next.secret.trim();
      const key = CREDS_STORAGE_KEY_PREFIX + env;
      if (!id && !secret) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify({ id, secret }));
    },
    [env],
  );

  const appendLog = useCallback((entry: Omit<LogEntry, "id" | "ts">) => {
    const id = ++logIdRef.current;
    setLog((prev) => [{ id, ts: nowTs(), ...entry }, ...prev].slice(0, 100));
  }, []);

  const runCall = useCallback<RunCall>(
    async <T,>(
      method: GridMethod,
      path: string,
      body?: unknown,
      formData?: FormData,
    ): Promise<T | null> => {
      const logBody = formData
        ? Object.fromEntries(
            [...formData.entries()].map(([k, v]) => [
              k,
              v instanceof File
                ? { name: v.name, type: v.type, size: v.size }
                : v,
            ]),
          )
        : body;
      try {
        const result = await callGrid<T>({ env, creds, method, path, body, formData });
        appendLog({
          env,
          method,
          path,
          requestBody: logBody,
          status: result.status,
          responseBody: result.data,
        });
        return result.data;
      } catch (err) {
        const e = err as Error & { status?: number; body?: unknown };
        appendLog({
          env,
          method,
          path,
          requestBody: logBody,
          status: e.status,
          responseBody: e.body,
          error: e.message,
        });
        throw err;
      }
    },
    [env, creds, appendLog],
  );

  const onPing = useCallback(async () => {
    try {
      const data = await runCall<{ data?: unknown[] }>(
        "GET",
        "/customers?limit=1",
      );
      const count = Array.isArray(data?.data) ? data.data.length : 0;
      setPingStatus({ kind: "ok", message: `OK — listed ${count} customer(s).` });
    } catch (err) {
      setPingStatus({ kind: "err", message: (err as Error).message });
    }
  }, [runCall]);

  const onClearCreds = useCallback(() => {
    const empty = { id: "", secret: "" };
    setCreds(empty);
    persistCreds(empty);
  }, [persistCreds]);

  const onCreateCustomer = useCallback(async () => {
    try {
      const payload =
        customerType === "INDIVIDUAL"
          ? buildIndividualPayload(individual, kycFlow === "API")
          : buildBusinessPayload(business);
      const data = await runCall<CustomerCreateResponse>(
        "POST",
        "/customers",
        payload,
      );
      if (data) {
        setCustomerId(data.id);
        setCreateStatus({
          kind: "ok",
          message: `Created ${data.customerType} customer ${data.id}`,
        });
      }
    } catch (err) {
      setCreateStatus({ kind: "err", message: (err as Error).message });
    }
  }, [customerType, individual, business, kycFlow, runCall]);

  const buildUpdatePayload = useCallback(
    () =>
      customerType === "INDIVIDUAL"
        ? buildIndividualUpdatePayload(individual)
        : buildBusinessUpdatePayload(business),
    [customerType, individual, business],
  );

  const onGenerateLink = useCallback(async () => {
    setKycLink(null);
    try {
      const id = customerId.trim();
      if (!id) throw new Error("Customer ID required.");
      // The hosted-link redirect URI is irrelevant for the embedded-SDK
      // flow (the SDK runs inline; the page never navigates away), so
      // omit it when the user is in SDK mode.
      const body =
        flowMode === "HOSTED" && redirectUri.trim()
          ? { redirectUri: redirectUri.trim() }
          : undefined;
      const data = await runCall<KycLinkResponse>(
        "POST",
        `/customers/${encodeURIComponent(id)}/kyc-link`,
        body,
      );
      if (data) {
        if (flowMode === "SDK" && !data.token) {
          throw new Error(
            "Provider returned no SDK access token. " +
              "Switch to Hosted mode or use a provider that supports embedded SDK.",
          );
        }
        setKycLink(data);
        setLinkStatus({
          kind: "ok",
          message: `Link generated — expires ${data.expiresAt}`,
        });
      }
    } catch (err) {
      setLinkStatus({ kind: "err", message: (err as Error).message });
    }
  }, [customerId, flowMode, redirectUri, runCall]);

  // The Sumsub SDK calls our token-refresh callback when the current
  // access token expires. We re-call the same endpoint to mint a fresh
  // one for the same customer.
  const refreshSdkToken = useCallback(async (): Promise<string> => {
    const id = customerId.trim();
    if (!id) throw new Error("Customer ID required.");
    const data = await runCall<KycLinkResponse>(
      "POST",
      `/customers/${encodeURIComponent(id)}/kyc-link`,
    );
    if (!data?.token) throw new Error("Provider returned no SDK token on refresh");
    return data.token;
  }, [customerId, runCall]);

  const onFetchCustomer = useCallback(async () => {
    try {
      const id = customerId.trim();
      if (!id) throw new Error("Customer ID required.");
      const data = await runCall<CustomerCreateResponse>(
        "GET",
        `/customers/${encodeURIComponent(id)}`,
      );
      if (data) {
        const status = data.kycStatus ?? data.kybStatus ?? "(unknown)";
        setFetchStatus({
          kind: "ok",
          message: `${data.customerType} status: ${status}`,
        });
      }
    } catch (err) {
      setFetchStatus({ kind: "err", message: (err as Error).message });
    }
  }, [customerId, runCall]);

  const customerTypeOptions = useMemo(
    () => [
      { value: "INDIVIDUAL", label: "INDIVIDUAL — KYC hosted link" },
      { value: "BUSINESS", label: "BUSINESS — KYB hosted link" },
    ],
    [],
  );

  return (
    <Page>
      <Column>
        <PageHeader>
          <PageTitle>Grid KYC/KYB Demo</PageTitle>
          <PageSubtitle>
            Internal demo tool for exercising the Grid KYC/KYB APIs — the
            hosted link flow and the programmatic verification API. Everything
            runs client-side — credentials live in this browser tab only.
            Requests are proxied through Vite to the selected environment.
          </PageSubtitle>
        </PageHeader>

        <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Environment & credentials</Card.Title>
            <Card.Subtitle>
              Credentials are stored per environment in <code>sessionStorage</code> so
              prod and dev keys don&apos;t get mixed up.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          <FormGrid>
            <Field.Root>
              <Field.Label>Environment</Field.Label>
              <SelectControl
                value={env}
                onValueChange={(v) => setEnv(v as GridEnv)}
                items={[
                  { value: "prod", label: ENV_LABELS.prod },
                  { value: "dev", label: ENV_LABELS.dev },
                  { value: "local", label: ENV_LABELS.local },
                ]}
              />
            </Field.Root>
            <Row>
              <Field.Root>
                <Field.Label>API Client ID</Field.Label>
                <Input
                  value={creds.id}
                  onChange={(e) => {
                    const next = { ...creds, id: e.target.value };
                    setCreds(next);
                    persistCreds(next);
                  }}
                  autoComplete="off"
                />
              </Field.Root>
              <Field.Root>
                <Field.Label>API Client Secret</Field.Label>
                <Input
                  type="password"
                  value={creds.secret}
                  onChange={(e) => {
                    const next = { ...creds, secret: e.target.value };
                    setCreds(next);
                    persistCreds(next);
                  }}
                  autoComplete="off"
                />
              </Field.Root>
            </Row>
            <ButtonRow>
              <Button variant="ghost" onClick={onClearCreds}>
                Clear credentials (this env)
              </Button>
              <Button variant="ghost" onClick={onPing}>
                Test auth (GET /customers)
              </Button>
            </ButtonRow>
            {pingStatus && (
              <Alert
                variant={pingStatus.kind === "ok" ? "default" : "critical"}
                title={pingStatus.kind === "ok" ? "Auth OK" : "Auth failed"}
                description={pingStatus.message}
              />
            )}
          </FormGrid>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Customer</Card.Title>
            <Card.Subtitle>
              The customer type determines the create payload and whether
              verification is KYC (individual) or KYB (business). The hosted
              link is generated by <code>POST /customers/&lt;id&gt;/kyc-link</code>;
              the programmatic flow submits the data below via{" "}
              <code>POST /verifications</code>.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          <FormGrid>
            <Field.Root>
              <Field.Label>Customer type</Field.Label>
              <SelectControl
                value={customerType}
                onValueChange={(v) => {
                  setCustomerType(v as CustomerType);
                  setCustomerId("");
                }}
                items={customerTypeOptions}
              />
              <Field.Description>
                Switching type clears the customer ID — a customer created as
                one type can&apos;t be acted on as the other.
              </Field.Description>
            </Field.Root>

            {customerType === "INDIVIDUAL" ? (
              <IndividualFields form={individual} onChange={setIndividual} />
            ) : (
              <BusinessFields form={business} onChange={setBusiness} />
            )}
          </FormGrid>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Run the flow</Card.Title>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          <FormGrid>
            <Button onClick={onCreateCustomer}>1. Create customer</Button>
            {createStatus && (
              <Alert
                variant={createStatus.kind === "ok" ? "default" : "critical"}
                title={
                  createStatus.kind === "ok" ? "Customer created" : "Create failed"
                }
                description={createStatus.message}
              />
            )}

            <Divider />

            <Field.Root>
              <Field.Label>Customer ID</Field.Label>
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="auto-filled from Create Customer"
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>KYC flow</Field.Label>
              <SelectControl
                value={kycFlow}
                onValueChange={(v) => setKycFlow(v as KycFlow)}
                items={[
                  { value: "LINK", label: "Hosted link / embedded SDK" },
                  { value: "API", label: "Programmatic API" },
                ]}
              />
              <Field.Description>
                Hosted link sends the customer through Sumsub; programmatic API
                submits KYC data directly via <code>/customers</code>,{" "}
                <code>/beneficial-owners</code>, <code>/documents</code> and{" "}
                <code>/verifications</code>.
              </Field.Description>
            </Field.Root>
            {kycFlow === "LINK" ? (
              <>
                <Field.Root>
                  <Field.Label>Verification mode</Field.Label>
                  <SelectControl
                    value={flowMode}
                    onValueChange={(v) => setFlowMode(v as FlowMode)}
                    items={[
                      { value: "HOSTED", label: "Hosted link (open in new tab)" },
                      { value: "SDK", label: "Embedded SDK (Sumsub WebSDK inline)" },
                    ]}
                  />
                  <Field.Description>
                    Both modes call the same <code>/kyc-link</code> endpoint —
                    hosted mode uses the returned <code>kycUrl</code>, embedded
                    mode uses the returned provider <code>token</code> via
                    Sumsub&apos;s WebSDK script.
                  </Field.Description>
                </Field.Root>
                {flowMode === "HOSTED" && (
                  <Field.Root>
                    <Field.Label>Redirect URI (optional)</Field.Label>
                    <Input
                      value={redirectUri}
                      onChange={(e) => setRedirectUri(e.target.value)}
                      placeholder="https://app.example.com/onboarding/done"
                    />
                    <Field.Description>
                      Where Sumsub sends the customer after the hosted flow. Must
                      be <code>https://</code>; Sumsub rejects <code>http://</code>{" "}
                      and localhost URLs. Leave blank to use Sumsub&apos;s default
                      post-flow page.
                    </Field.Description>
                  </Field.Root>
                )}
                <Button onClick={onGenerateLink}>2. Generate KYC link</Button>
                {linkStatus && (
                  <Alert
                    variant={linkStatus.kind === "ok" ? "default" : "critical"}
                    title={
                      linkStatus.kind === "ok" ? "Link generated" : "Link failed"
                    }
                    description={linkStatus.message}
                  />
                )}
                {kycLink && flowMode === "HOSTED" && (
                  <KycLinkResult result={kycLink} />
                )}
                {kycLink && flowMode === "SDK" && (
                  <SdkLauncher
                    token={kycLink.token ?? ""}
                    provider={kycLink.provider}
                    onTokenRefresh={refreshSdkToken}
                  />
                )}
              </>
            ) : (
              <ProgrammaticFlow
                key={`${customerType}:${customerId}`}
                customerType={customerType}
                customerId={customerId}
                buildUpdatePayload={buildUpdatePayload}
                runCall={runCall}
              />
            )}

            <Divider />

            <Button variant="ghost" onClick={onFetchCustomer}>
              Fetch customer status
            </Button>
            {fetchStatus && (
              <Alert
                variant={fetchStatus.kind === "ok" ? "default" : "critical"}
                title={
                  fetchStatus.kind === "ok" ? "Customer fetched" : "Fetch failed"
                }
                description={fetchStatus.message}
              />
            )}
          </FormGrid>
        </Card.Body>
      </Card.Root>

      <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Response log</Card.Title>
            <Card.Subtitle>
              Most recent first. Cleared on reload.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          {log.length === 0 ? (
            <EmptyLog>No requests yet.</EmptyLog>
          ) : (
            <LogList>
              {log.map((entry) => (
                <LogItem key={entry.id} entry={entry} />
              ))}
            </LogList>
          )}
        </Card.Body>
      </Card.Root>
      </Column>
    </Page>
  );
}

function IndividualFields({
  form,
  onChange,
}: {
  form: IndividualForm;
  onChange: (next: IndividualForm) => void;
}) {
  const set = <K extends keyof IndividualForm>(
    key: K,
    value: IndividualForm[K],
  ) => onChange({ ...form, [key]: value });
  return (
    <>
      <Row>
        <Field.Root>
          <Field.Label>Platform customer ID</Field.Label>
          <Input
            value={form.platformCustomerId}
            onChange={(e) => set("platformCustomerId", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Region (ISO 3166-1)</Field.Label>
          <Input
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Full name</Field.Label>
          <Input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Birth date</Field.Label>
          <Input
            type="date"
            value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Nationality (ISO 3166-1)</Field.Label>
          <Input
            value={form.nationality}
            onChange={(e) => set("nationality", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Email (optional)</Field.Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Field.Root>
        <Field.Label>Currencies (comma-separated, optional)</Field.Label>
        <Input
          value={form.currencies}
          onChange={(e) => set("currencies", e.target.value)}
        />
      </Field.Root>

      <SectionLabel>Address</SectionLabel>
      <Row>
        <Field.Root>
          <Field.Label>Line 1</Field.Label>
          <Input
            value={form.addrLine1}
            onChange={(e) => set("addrLine1", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Line 2 (optional)</Field.Label>
          <Input
            value={form.addrLine2}
            onChange={(e) => set("addrLine2", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>City</Field.Label>
          <Input
            value={form.addrCity}
            onChange={(e) => set("addrCity", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>State</Field.Label>
          <Input
            value={form.addrState}
            onChange={(e) => set("addrState", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <Input
            value={form.addrPostal}
            onChange={(e) => set("addrPostal", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Country (ISO 3166-1)</Field.Label>
          <Input
            value={form.addrCountry}
            onChange={(e) => set("addrCountry", e.target.value)}
          />
        </Field.Root>
      </Row>

      <SectionLabel>Identification</SectionLabel>
      <Row>
        <Field.Root>
          <Field.Label>ID type</Field.Label>
          <SelectControl
            value={form.idType}
            onValueChange={(v) => set("idType", v)}
            items={INDIVIDUAL_ID_TYPES.map((v) => ({ value: v, label: v }))}
          />
          <Field.Description>
            Only SSN and ITIN are accepted for individuals.
          </Field.Description>
        </Field.Root>
        <Field.Root>
          <Field.Label>Identifier</Field.Label>
          <Input
            value={form.identifier}
            onChange={(e) => set("identifier", e.target.value)}
            placeholder="123-45-6789"
          />
          <Field.Description>
            Write-only — never returned in customer responses.
          </Field.Description>
        </Field.Root>
      </Row>
      <Field.Root>
        <Field.Label>Country of issuance</Field.Label>
        <Input
          value={form.countryOfIssuance}
          onChange={(e) => set("countryOfIssuance", e.target.value)}
        />
        <Field.Description>
          SSN/ITIN are US-issued — must stay <code>US</code> for individuals.
        </Field.Description>
      </Field.Root>

      <SectionLabel>EDD (optional — programmatic flow)</SectionLabel>
      <Field.Root>
        <Field.Label>Source of funds categories (comma-separated)</Field.Label>
        <Input
          value={form.sourceOfFunds}
          onChange={(e) => set("sourceOfFunds", e.target.value)}
        />
        <Field.Description>
          {INDIVIDUAL_SOURCE_OF_FUNDS.join(", ")}
        </Field.Description>
      </Field.Root>
      {splitCsv(form.sourceOfFunds).includes("OTHER") && (
        <Field.Root>
          <Field.Label>Source of funds — OTHER description</Field.Label>
          <Input
            value={form.sourceOfFundsOther}
            onChange={(e) => set("sourceOfFundsOther", e.target.value)}
          />
          <Field.Description>
            Required by the API when OTHER is included.
          </Field.Description>
        </Field.Root>
      )}
      <Field.Root>
        <Field.Label>Source of wealth categories (comma-separated)</Field.Label>
        <Input
          value={form.sourceOfWealth}
          onChange={(e) => set("sourceOfWealth", e.target.value)}
        />
        <Field.Description>{SOURCE_OF_WEALTH.join(", ")}</Field.Description>
      </Field.Root>
      {splitCsv(form.sourceOfWealth).includes("OTHER") && (
        <Field.Root>
          <Field.Label>Source of wealth — OTHER description</Field.Label>
          <Input
            value={form.sourceOfWealthOther}
            onChange={(e) => set("sourceOfWealthOther", e.target.value)}
          />
          <Field.Description>
            Required by the API when OTHER is included.
          </Field.Description>
        </Field.Root>
      )}
      <Row>
        <Field.Root>
          <Field.Label>Purpose of account</Field.Label>
          <SelectControl
            value={form.purposeOfAccount}
            onValueChange={(v) => set("purposeOfAccount", v)}
            items={omittedFirst(PURPOSE_OF_ACCOUNT)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>PEP status</Field.Label>
          <SelectControl
            value={form.pepStatus}
            onValueChange={(v) => set("pepStatus", v)}
            items={omittedFirst(PEP_STATUS)}
          />
        </Field.Root>
      </Row>
      {form.purposeOfAccount === "OTHER" && (
        <Field.Root>
          <Field.Label>Purpose of account — OTHER description</Field.Label>
          <Input
            value={form.purposeOfAccountOther}
            onChange={(e) => set("purposeOfAccountOther", e.target.value)}
          />
          <Field.Description>
            Required by the API when purpose of account is OTHER.
          </Field.Description>
        </Field.Root>
      )}
      <Row>
        <Field.Root>
          <Field.Label>Expected monthly tx count</Field.Label>
          <SelectControl
            value={form.txCount}
            onValueChange={(v) => set("txCount", v)}
            items={omittedFirst(TX_COUNT)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Expected monthly tx volume</Field.Label>
          <SelectControl
            value={form.txVolume}
            onValueChange={(v) => set("txVolume", v)}
            items={omittedFirst(TX_VOLUME)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Annual income range</Field.Label>
          <SelectControl
            value={form.annualIncomeRange}
            onValueChange={(v) => set("annualIncomeRange", v)}
            items={omittedFirst(ANNUAL_INCOME_RANGE)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Net worth range</Field.Label>
          <SelectControl
            value={form.netWorthRange}
            onValueChange={(v) => set("netWorthRange", v)}
            items={omittedFirst(NET_WORTH_RANGE)}
          />
        </Field.Root>
      </Row>
    </>
  );
}

function omittedFirst(values: readonly string[]) {
  return [
    { value: OMIT, label: "— omit from payload —" },
    ...values.map((v) => ({ value: v, label: v })),
  ];
}

function BusinessFields({
  form,
  onChange,
}: {
  form: BusinessForm;
  onChange: (next: BusinessForm) => void;
}) {
  const set = <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) =>
    onChange({ ...form, [key]: value });
  return (
    <>
      <Row>
        <Field.Root>
          <Field.Label>Platform customer ID</Field.Label>
          <Input
            value={form.platformCustomerId}
            onChange={(e) => set("platformCustomerId", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Region (ISO 3166-1)</Field.Label>
          <Input
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Field.Root>
        <Field.Label>Currencies (comma-separated, optional)</Field.Label>
        <Input
          value={form.currencies}
          onChange={(e) => set("currencies", e.target.value)}
        />
      </Field.Root>

      <SectionLabel>Business info</SectionLabel>
      <Row>
        <Field.Root>
          <Field.Label>Legal name</Field.Label>
          <Input
            value={form.legalName}
            onChange={(e) => set("legalName", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Doing business as (optional)</Field.Label>
          <Input
            value={form.doingBusinessAs}
            onChange={(e) => set("doingBusinessAs", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Country of incorporation</Field.Label>
          <Input
            value={form.country}
            onChange={(e) => set("country", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Registration number</Field.Label>
          <Input
            value={form.registrationNumber}
            onChange={(e) => set("registrationNumber", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Incorporated on</Field.Label>
          <Input
            type="date"
            value={form.incorporatedOn}
            onChange={(e) => set("incorporatedOn", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Entity type</Field.Label>
          <SelectControl
            value={form.entityType}
            onValueChange={(v) => set("entityType", v)}
            items={ENTITY_TYPES.map((v) => ({ value: v, label: v }))}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Tax ID</Field.Label>
          <Input
            value={form.taxId}
            onChange={(e) => set("taxId", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Countries of operation</Field.Label>
          <Input
            value={form.countriesOfOperation}
            onChange={(e) => set("countriesOfOperation", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Business type</Field.Label>
          <SelectControl
            value={form.businessType}
            onValueChange={(v) => set("businessType", v)}
            items={BUSINESS_TYPES.map((v) => ({ value: v, label: v }))}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Purpose of account</Field.Label>
          <SelectControl
            value={form.purposeOfAccount}
            onValueChange={(v) => set("purposeOfAccount", v)}
            items={PURPOSE_OF_ACCOUNT.map((v) => ({ value: v, label: v }))}
          />
        </Field.Root>
      </Row>
      <Field.Root>
        <Field.Label>Source of funds</Field.Label>
        <Input
          value={form.sourceOfFunds}
          onChange={(e) => set("sourceOfFunds", e.target.value)}
        />
      </Field.Root>
      <Row>
        <Field.Root>
          <Field.Label>Expected monthly tx count</Field.Label>
          <SelectControl
            value={form.txCount}
            onValueChange={(v) => set("txCount", v)}
            items={TX_COUNT.map((v) => ({ value: v, label: v }))}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Expected monthly tx volume</Field.Label>
          <SelectControl
            value={form.txVolume}
            onValueChange={(v) => set("txVolume", v)}
            items={TX_VOLUME.map((v) => ({ value: v, label: v }))}
          />
        </Field.Root>
      </Row>
      <Field.Root>
        <Field.Label>Recipient jurisdictions</Field.Label>
        <Input
          value={form.recipientJurisdictions}
          onChange={(e) => set("recipientJurisdictions", e.target.value)}
        />
      </Field.Root>

      <SectionLabel>Business address</SectionLabel>
      <Row>
        <Field.Root>
          <Field.Label>Line 1</Field.Label>
          <Input
            value={form.addrLine1}
            onChange={(e) => set("addrLine1", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Line 2 (optional)</Field.Label>
          <Input
            value={form.addrLine2}
            onChange={(e) => set("addrLine2", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>City</Field.Label>
          <Input
            value={form.addrCity}
            onChange={(e) => set("addrCity", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>State</Field.Label>
          <Input
            value={form.addrState}
            onChange={(e) => set("addrState", e.target.value)}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Postal code</Field.Label>
          <Input
            value={form.addrPostal}
            onChange={(e) => set("addrPostal", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Country (ISO 3166-1)</Field.Label>
          <Input
            value={form.addrCountry}
            onChange={(e) => set("addrCountry", e.target.value)}
          />
        </Field.Root>
      </Row>
    </>
  );
}

function KycLinkResult({ result }: { result: KycLinkResponse }) {
  const [copied, setCopied] = useState(false);
  return (
    <ResultPanel>
      <ResultMeta>
        <Badge variant="green">{result.provider}</Badge>
        <Badge variant="gray">expires {result.expiresAt}</Badge>
      </ResultMeta>
      <ResultUrl>{result.kycUrl}</ResultUrl>
      <ButtonRow>
        <Button
          onClick={() =>
            window.open(result.kycUrl, "_blank", "noopener,noreferrer")
          }
        >
          Open hosted KYC URL
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            void navigator.clipboard.writeText(result.kycUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied!" : "Copy URL"}
        </Button>
      </ButtonRow>
      {result.token && (
        <TokenLine>
          Provider token (consumed by embedded SDK mode):{" "}
          <code>{result.token.slice(0, 32)}…</code>
        </TokenLine>
      )}
    </ResultPanel>
  );
}

function SdkLauncher({
  token,
  provider,
  onTokenRefresh,
}: {
  token: string;
  provider: string;
  onTokenRefresh: () => Promise<string>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sdkError, setSdkError] = useState<string | null>(null);
  // Owned here (not lifted) so the launched state resets every time the
  // launcher remounts — toggling Hosted ⇄ SDK mode or regenerating the
  // link always lands back at the Launch button, never a stale empty
  // iframe container.
  const [launched, setLaunched] = useState(false);

  // Tear down the embedded SDK when the launcher unmounts (switching back
  // to Hosted mode, regenerating the link, etc.). Sumsub's WebSDK builds
  // its iframe + event listeners inside the container we hand it; without
  // an explicit cleanup those would leak. The SDK doesn't expose a public
  // destroy API, so we clear the container's children — which removes the
  // iframe (and the listeners it owns) deterministically.
  useEffect(() => {
    const container = containerRef.current;
    return () => {
      if (container) container.replaceChildren();
    };
  }, []);

  const launch = useCallback(() => {
    const sdk = snsWebSdk;
    if (sdk === undefined) {
      setSdkError(
        "Sumsub WebSDK script didn't load — check the <script> tag in index.html or your network.",
      );
      return;
    }
    if (!containerRef.current) {
      setSdkError("Internal: SDK container ref missing");
      return;
    }
    if (!containerRef.current.id) {
      containerRef.current.id = "grid-kyc-demo-sumsub-container";
    }
    setSdkError(null);

    // Surface token-refresh failures via the same Alert as SDK errors.
    // Without this, a rejected refresh promise either silently kills the
    // session (Sumsub's SDK behavior on refresh failure is undocumented
    // and version-dependent) or surfaces only in the console, leaving
    // the iframe stuck on a "loading" state with no signal to the user.
    // We still re-throw so the SDK sees the rejection too.
    const wrappedRefresh = async (): Promise<string> => {
      try {
        return await onTokenRefresh();
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Failed to refresh Sumsub token";
        setSdkError(`Token refresh failed: ${msg}`);
        throw err;
      }
    };

    sdk
      .init(token, wrappedRefresh)
      .withConf({ lang: "en" })
      .withOptions({ adaptIframeHeight: true })
      .on("idCheck.onError", (payload) => {
        // Surface SDK-side errors without breaking the iframe.
        // Console for full payload; banner for headline.
        // eslint-disable-next-line no-console
        console.error("[sumsub] idCheck.onError", payload);
        const msg =
          (payload as { reason?: string })?.reason ?? "Sumsub SDK error";
        setSdkError(msg);
      })
      .build()
      .launch(`#${containerRef.current.id}`);
    setLaunched(true);
  }, [token, onTokenRefresh]);

  return (
    <ResultPanel>
      <ResultMeta>
        <Badge variant="green">{provider}</Badge>
        <Badge variant="gray">embedded SDK</Badge>
      </ResultMeta>
      {!launched && (
        <>
          <TokenLine>
            Sumsub WebSDK will mount inline below. Token preview:{" "}
            <code>{token.slice(0, 32)}…</code>
          </TokenLine>
          <ButtonRow>
            <Button onClick={launch} disabled={!token}>
              Launch Sumsub SDK
            </Button>
          </ButtonRow>
        </>
      )}
      {sdkError && (
        <Alert
          variant="critical"
          title="SDK error"
          description={sdkError}
        />
      )}
      <SdkContainer ref={containerRef} $visible={launched} />
    </ResultPanel>
  );
}

function LogItem({ entry }: { entry: LogEntry }) {
  const headline = `${entry.method} ${entry.path}`;
  const statusBadgeVariant: "green" | "red" | "gray" = entry.error
    ? "red"
    : entry.status && entry.status >= 200 && entry.status < 300
      ? "green"
      : "gray";
  return (
    <LogRow>
      <LogHeader>
        <Badge variant="gray">{entry.env}</Badge>
        <Badge variant={statusBadgeVariant}>
          {entry.status ?? "ERR"}
        </Badge>
        <LogPath>{headline}</LogPath>
        <LogTs>{entry.ts}</LogTs>
      </LogHeader>
      {entry.requestBody !== undefined && (
        <Textarea
          readOnly
          rows={Math.min(8, JSON.stringify(entry.requestBody, null, 2).split("\n").length)}
          value={JSON.stringify(entry.requestBody, null, 2)}
        />
      )}
      {entry.responseBody !== undefined && (
        <Textarea
          readOnly
          rows={Math.min(10, JSON.stringify(entry.responseBody, null, 2).split("\n").length)}
          value={
            typeof entry.responseBody === "string"
              ? entry.responseBody
              : JSON.stringify(entry.responseBody, null, 2)
          }
        />
      )}
    </LogRow>
  );
}

// ----- session-storage helpers -----

function envInitial(): GridEnv {
  const saved = sessionStorage.getItem(ENV_STORAGE_KEY);
  if (saved === "dev" || saved === "prod" || saved === "local") return saved;
  return "prod";
}

function loadCreds(env: GridEnv): GridCredentials {
  const raw = sessionStorage.getItem(CREDS_STORAGE_KEY_PREFIX + env);
  if (!raw) return { id: "", secret: "" };
  try {
    const { id, secret } = JSON.parse(raw) as Partial<GridCredentials>;
    return { id: id ?? "", secret: secret ?? "" };
  } catch {
    return { id: "", secret: "" };
  }
}

// ----- styled layout -----

const Page = styled.div`
  background: var(--surface-base, #f5f5f7);
  min-height: 100vh;
  padding: var(--spacing-xl, 32px) var(--spacing-lg, 24px);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-family-sans);
  color: var(--text-primary);
`;

const Column = styled.div`
  width: 100%;
  max-width: 880px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 12px);
`;

const PageHeader = styled.header`
  margin-bottom: var(--spacing-sm, 8px);
`;

const PageTitle = styled.h1`
  margin: 0 0 var(--spacing-xs, 4px);
  font-size: var(--font-size-2xl, 24px);
  font-weight: var(--font-weight-semibold, 600);
  letter-spacing: var(--font-tracking-tight, -0.4px);
`;

const PageSubtitle = styled.p`
  margin: 0;
  color: var(--text-secondary, #555);
  font-size: var(--font-size-sm, 13px);
  line-height: 1.5;
  max-width: 720px;
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 12px);
  max-width: 720px;
`;

const ResultUrl = styled.div`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #555);
  word-break: break-all;
`;

const TokenLine = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #555);
`;

const SdkContainer = styled.div<{ $visible: boolean }>`
  display: ${(p) => (p.$visible ? "block" : "none")};
  width: 100%;
  min-height: 600px;
  background: var(--background-primary, #fff);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  border-radius: var(--radius-md, 8px);
`;

const LogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
`;

const LogRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  padding-bottom: var(--spacing-sm, 8px);
  border-bottom: var(--stroke-xs, 1px) solid var(--border-primary, #eee);
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const LogHeader = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  flex-wrap: wrap;
`;

const LogPath = styled.span`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-sm, 13px);
  color: var(--text-primary);
  flex: 1;
`;

const LogTs = styled.span`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-tertiary, #888);
`;

const EmptyLog = styled.div`
  color: var(--text-tertiary, #888);
  font-size: var(--font-size-sm, 13px);
  padding: var(--spacing-md, 12px) 0;
`;

