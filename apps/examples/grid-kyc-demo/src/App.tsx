import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Select,
  Textarea,
} from "@lightsparkdev/origin";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  callGrid,
  ENV_LABELS,
  nowTs,
  randomSuffix,
  type CustomerCreateResponse,
  type GridCredentials,
  type GridEnv,
  type KycLinkResponse,
  type LogEntry,
} from "./api";

type CustomerType = "INDIVIDUAL" | "BUSINESS";
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

interface IndividualForm {
  platformCustomerId: string;
  region: string;
  fullName: string;
  birthDate: string;
  nationality: string;
  email: string;
  currencies: string;
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

function buildIndividualPayload(form: IndividualForm): Record<string, unknown> {
  const currencies = splitCsv(form.currencies);
  const payload: Record<string, unknown> = {
    customerType: "INDIVIDUAL",
    platformCustomerId: form.platformCustomerId.trim(),
    region: form.region.trim(),
    fullName: form.fullName.trim(),
    birthDate: form.birthDate,
    nationality: form.nationality.trim(),
  };
  if (currencies.length) payload.currencies = currencies;
  if (form.email.trim()) payload.email = form.email.trim();
  return payload;
}

function buildBusinessPayload(form: BusinessForm): Record<string, unknown> {
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
    city: form.addrCity.trim(),
    state: form.addrState.trim(),
    postalCode: form.addrPostal.trim(),
    country: form.addrCountry.trim(),
  };
  if (form.addrLine2.trim()) address.line2 = form.addrLine2.trim();

  const payload: Record<string, unknown> = {
    customerType: "BUSINESS",
    platformCustomerId: form.platformCustomerId.trim(),
    region: form.region.trim(),
    businessInfo,
    address,
  };
  if (currencies.length) payload.currencies = currencies;
  return payload;
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
  const [kycLink, setKycLink] = useState<KycLinkResponse | null>(null);

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

  const runCall = useCallback(
    async <T,>(
      method: "GET" | "POST",
      path: string,
      body?: unknown,
    ): Promise<T | null> => {
      try {
        const result = await callGrid<T>({ env, creds, method, path, body });
        appendLog({
          env,
          method,
          path,
          requestBody: body,
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
          requestBody: body,
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
          ? buildIndividualPayload(individual)
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
  }, [customerType, individual, business, runCall]);

  const onGenerateLink = useCallback(async () => {
    setKycLink(null);
    try {
      const id = customerId.trim();
      if (!id) throw new Error("Customer ID required.");
      const body = redirectUri.trim() ? { redirectUri: redirectUri.trim() } : undefined;
      const data = await runCall<KycLinkResponse>(
        "POST",
        `/customers/${encodeURIComponent(id)}/kyc-link`,
        body,
      );
      if (data) {
        setKycLink(data);
        setLinkStatus({
          kind: "ok",
          message: `Link generated — expires ${data.expiresAt}`,
        });
      }
    } catch (err) {
      setLinkStatus({ kind: "err", message: (err as Error).message });
    }
  }, [customerId, redirectUri, runCall]);

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
            Internal demo tool for exercising the Grid hosted KYC/KYB link
            API. Everything runs client-side — credentials live in this
            browser tab only. Requests are proxied through Vite to the
            selected environment.
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
              The customer type determines the create payload and whether the
              link is KYC (individual) or KYB (business). Either way the link
              is generated by <code>POST /customers/&lt;id&gt;/kyc-link</code>.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body>
          <FormGrid>
            <Field.Root>
              <Field.Label>Customer type</Field.Label>
              <SelectControl
                value={customerType}
                onValueChange={(v) => setCustomerType(v as CustomerType)}
                items={customerTypeOptions}
              />
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
              <Field.Label>Redirect URI (optional)</Field.Label>
              <Input
                value={redirectUri}
                onChange={(e) => setRedirectUri(e.target.value)}
                placeholder="https://app.example.com/onboarding/done"
              />
              <Field.Description>
                Where Sumsub sends the customer after the hosted flow. Must be
                <code> https://</code>; Sumsub rejects <code>http://</code> and
                localhost URLs. Leave blank to use Sumsub&apos;s default
                post-flow page.
              </Field.Description>
            </Field.Root>
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
            {kycLink && <KycLinkResult result={kycLink} />}

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
    </>
  );
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

function SelectControl({
  value,
  onValueChange,
  items,
}: {
  value: string;
  onValueChange: (next: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={(next) => {
        if (next != null) onValueChange(next);
      }}
    >
      <Select.Trigger>
        <Select.Value>
          {(v: string) => items.find((i) => i.value === v)?.label ?? v}
        </Select.Value>
        <Select.Icon />
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner>
          <Select.Popup>
            <Select.List>
              {items.map((item) => (
                <Select.Item key={item.value} value={item.value}>
                  <Select.ItemIndicator />
                  <Select.ItemText>{item.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
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
          Provider token (for embedded SDK, follow-up):{" "}
          <code>{result.token.slice(0, 32)}…</code>
        </TokenLine>
      )}
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

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md, 12px);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--spacing-sm, 8px);
  flex-wrap: wrap;
`;

const SectionLabel = styled.div`
  margin-top: var(--spacing-sm, 8px);
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-secondary, #666);
  font-weight: var(--font-weight-medium, 500);
`;

const Divider = styled.hr`
  border: none;
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  margin: var(--spacing-sm, 8px) 0;
`;

const ResultPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-md, 12px);
  background: var(--surface-primary, #fff);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e0e0e0);
  border-radius: var(--corner-radius-md, 8px);
`;

const ResultMeta = styled.div`
  display: flex;
  gap: var(--spacing-xs, 4px);
  flex-wrap: wrap;
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

