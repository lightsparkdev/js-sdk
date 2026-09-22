import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Checkbox,
  Field,
  Input,
} from "@lightsparkdev/origin";
import { useCallback, useState } from "react";

import {
  OMIT,
  type BeneficialOwnerResponse,
  type CustomerType,
  type DocumentResponse,
  type RunCall,
  type Verification,
  type VerificationListResponse,
} from "./api";
import {
  ButtonRow,
  Divider,
  ResultMeta,
  ResultPanel,
  Row,
  SectionLabel,
  SelectControl,
} from "./ui";

const BO_ROLES = [
  "UBO",
  "DIRECTOR",
  "COMPANY_OFFICER",
  "CONTROL_PERSON",
  "TRUSTEE",
  "GENERAL_PARTNER",
] as const;

// EIN is rejected for beneficial owners; non-US owners use NON_US_TAX_ID.
const BO_ID_TYPES = ["SSN", "ITIN", "NON_US_TAX_ID"] as const;

const DOCUMENT_TYPES = [
  "PASSPORT",
  "DRIVERS_LICENSE",
  "NATIONAL_ID",
  "PROOF_OF_ADDRESS",
  "BANK_STATEMENT",
  "TAX_RETURN",
  "CERTIFICATE_OF_INCORPORATION",
  "ARTICLES_OF_INCORPORATION",
  "ARTICLES_OF_ASSOCIATION",
  "STATE_REGISTRY_EXCERPT",
  "GOOD_STANDING_CERTIFICATE",
  "INFORMATION_STATEMENT",
  "INCUMBENCY_CERTIFICATE",
  "BUSINESS_LICENSE",
  "SHAREHOLDER_REGISTER",
  "POWER_OF_ATTORNEY",
  "UTILITY_BILL",
  "ELECTRICITY_BILL",
  "RENT_OR_LEASE_AGREEMENT",
  "DIRECTOR_REGISTRY",
  "TRUST_AGREEMENT",
  "STATE_COMPANY_REGISTRY",
  "PARTNERSHIP_CONTROL_AGREEMENT",
  "PARTNERSHIP_AGREEMENT",
  "SELFIE",
  "OTHER",
] as const;

// documentNumber and issuingAuthority are required for these.
const IDENTITY_DOC_TYPES: readonly string[] = [
  "PASSPORT",
  "DRIVERS_LICENSE",
  "NATIONAL_ID",
];

type Status = { kind: "ok" | "err"; message: string } | null;

interface OwnerForm {
  roles: string[];
  ownershipPercentage: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  email: string;
  idType: string;
  identifier: string;
  addrLine1: string;
  addrLine2: string;
  addrCity: string;
  addrState: string;
  addrPostal: string;
  addrCountry: string;
}

function defaultOwner(): OwnerForm {
  return {
    roles: ["UBO", "CONTROL_PERSON"],
    ownershipPercentage: "51",
    firstName: "Robert",
    lastName: "Owner",
    birthDate: "1975-04-22",
    nationality: "US",
    email: "",
    idType: "SSN",
    identifier: "123-45-6789",
    addrLine1: "123 Market Street",
    addrLine2: "",
    addrCity: "San Francisco",
    addrState: "CA",
    addrPostal: "94105",
    addrCountry: "US",
  };
}

interface DocForm {
  documentType: string;
  country: string;
  side: string;
  documentNumber: string;
  issuingAuthority: string;
  holderId: string;
  replaceId: string;
}

function defaultDoc(): DocForm {
  return {
    documentType: "PASSPORT",
    country: "US",
    side: OMIT,
    documentNumber: "A12345678",
    issuingAuthority: "U.S. Department of State",
    holderId: "",
    replaceId: "",
  };
}

interface AddedOwner {
  id: string;
  label: string;
}

interface UploadedDoc {
  id: string;
  documentType: string;
  holder: string;
}

export function ProgrammaticFlow({
  customerType,
  customerId,
  buildUpdatePayload,
  runCall,
}: {
  customerType: CustomerType;
  customerId: string;
  buildUpdatePayload: () => Record<string, unknown>;
  runCall: RunCall;
}) {
  const [patchStatus, setPatchStatus] = useState<Status>(null);
  const [owner, setOwner] = useState<OwnerForm>(defaultOwner);
  const [owners, setOwners] = useState<AddedOwner[]>([]);
  const [ownerStatus, setOwnerStatus] = useState<Status>(null);
  const [doc, setDoc] = useState<DocForm>(defaultDoc);
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [docStatus, setDocStatus] = useState<Status>(null);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<Status>(null);

  const requireCustomerId = useCallback((): string => {
    const id = customerId.trim();
    if (!id) throw new Error("Create a customer first (step 1).");
    return id;
  }, [customerId]);

  const onPatchCustomer = useCallback(async () => {
    try {
      const id = requireCustomerId();
      const data = await runCall<{ id: string }>(
        "PATCH",
        `/customers/${encodeURIComponent(id)}`,
        buildUpdatePayload(),
      );
      if (data)
        setPatchStatus({
          kind: "ok",
          message: `Updated customer ${data.id} with the current form values.`,
        });
    } catch (err) {
      setPatchStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, buildUpdatePayload, runCall]);

  const onAddOwner = useCallback(async () => {
    try {
      const customer = requireCustomerId();
      if (!owner.roles.length) throw new Error("Select at least one role.");
      const pct = Number(owner.ownershipPercentage);
      if (!Number.isInteger(pct) || pct < 0 || pct > 100)
        throw new Error("Ownership percentage must be an integer 0-100.");
      const address: Record<string, unknown> = {
        line1: owner.addrLine1.trim(),
        postalCode: owner.addrPostal.trim(),
        country: owner.addrCountry.trim(),
      };
      if (owner.addrCity.trim()) address.city = owner.addrCity.trim();
      if (owner.addrState.trim()) address.state = owner.addrState.trim();
      if (owner.addrLine2.trim()) address.line2 = owner.addrLine2.trim();
      const personalInfo: Record<string, unknown> = {
        firstName: owner.firstName.trim(),
        lastName: owner.lastName.trim(),
        birthDate: owner.birthDate,
        nationality: owner.nationality.trim(),
        address,
        idType: owner.idType,
        identifier: owner.identifier.trim(),
      };
      if (owner.email.trim()) personalInfo.email = owner.email.trim();
      const data = await runCall<BeneficialOwnerResponse>(
        "POST",
        "/beneficial-owners",
        {
          customerId: customer,
          roles: owner.roles,
          ownershipPercentage: pct,
          personalInfo,
        },
      );
      if (data) {
        setOwners((prev) => [
          ...prev,
          {
            id: data.id,
            label: `${owner.firstName} ${owner.lastName} — ${owner.roles.join(", ")}`,
          },
        ]);
        setOwnerStatus({
          kind: "ok",
          message: `Added ${owner.firstName} ${owner.lastName} → ${data.id}`,
        });
      }
    } catch (err) {
      setOwnerStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, owner, runCall]);

  const onUploadDoc = useCallback(async () => {
    try {
      if (!file) throw new Error("Choose a file first.");
      const holder = doc.holderId || requireCustomerId();
      if (
        IDENTITY_DOC_TYPES.includes(doc.documentType) &&
        (!doc.documentNumber.trim() || !doc.issuingAuthority.trim())
      )
        throw new Error(
          "Identity documents require a document number and issuing authority.",
        );
      const fd = new FormData();
      fd.append("file", file);
      fd.append("documentType", doc.documentType);
      fd.append("country", doc.country.trim());
      if (!doc.replaceId) fd.append("documentHolder", holder);
      if (doc.side !== OMIT) fd.append("side", doc.side);
      if (doc.documentNumber.trim())
        fd.append("documentNumber", doc.documentNumber.trim());
      if (doc.issuingAuthority.trim())
        fd.append("issuingAuthority", doc.issuingAuthority.trim());
      const data = doc.replaceId
        ? await runCall<DocumentResponse>(
            "PUT",
            `/documents/${encodeURIComponent(doc.replaceId)}`,
            undefined,
            fd,
          )
        : await runCall<DocumentResponse>("POST", "/documents", undefined, fd);
      if (data) {
        if (!doc.replaceId)
          setDocs((prev) => [
            ...prev,
            { id: data.id, documentType: doc.documentType, holder },
          ]);
        setDocStatus({
          kind: "ok",
          message: doc.replaceId
            ? `Replaced ${doc.replaceId} → ${data.id}`
            : `Uploaded ${doc.documentType} for ${holder} → ${data.id}`,
        });
      }
    } catch (err) {
      setDocStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, doc, file, runCall]);

  const onLoadDocs = useCallback(async () => {
    try {
      const holder = doc.holderId || requireCustomerId();
      const data = await runCall<{ data?: DocumentResponse[] }>(
        "GET",
        `/documents?documentHolder=${encodeURIComponent(holder)}&limit=100`,
      );
      if (data) {
        const fetched = (data.data ?? []).map((d) => ({
          id: d.id,
          documentType: d.documentType,
          holder,
        }));
        setDocs(fetched);
        setDoc((prev) => ({ ...prev, replaceId: "" }));
        setDocStatus({
          kind: "ok",
          message: fetched.length
            ? `Loaded ${fetched.length} existing document(s) for ${holder}.`
            : "No documents on this holder yet.",
        });
      }
    } catch (err) {
      setDocStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, doc.holderId, runCall]);

  const onLoadOwners = useCallback(async () => {
    try {
      const customer = requireCustomerId();
      const data = await runCall<{ data?: BeneficialOwnerResponse[] }>(
        "GET",
        `/beneficial-owners?customerId=${encodeURIComponent(customer)}&limit=100`,
      );
      if (data) {
        const list = (data.data ?? []).map((bo) => ({
          id: bo.id,
          label: `${bo.personalInfo?.firstName ?? ""} ${bo.personalInfo?.lastName ?? ""} — ${bo.roles.join(", ")}`,
        }));
        setOwners(list);
        setOwnerStatus({
          kind: "ok",
          message: list.length
            ? `Loaded ${list.length} existing owner(s).`
            : "No beneficial owners on this customer yet.",
        });
      }
    } catch (err) {
      setOwnerStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, runCall]);

  const onSubmitVerification = useCallback(async () => {
    try {
      const customer = requireCustomerId();
      const data = await runCall<Verification>("POST", "/verifications", {
        customerId: customer,
      });
      if (data) {
        setVerification(data);
        setVerifyStatus({
          kind: "ok",
          message: data.errors.length
            ? `${data.verificationStatus} — ${data.errors.length} issue(s) to resolve below.`
            : `${data.verificationStatus} — no outstanding issues.`,
        });
      }
    } catch (err) {
      setVerifyStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, runCall]);

  const onPollVerifications = useCallback(async () => {
    try {
      const customer = requireCustomerId();
      const data = await runCall<VerificationListResponse>(
        "GET",
        `/verifications?customerId=${encodeURIComponent(customer)}&limit=10`,
      );
      if (data) {
        const latest = [...(data.data ?? [])].sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        )[0];
        if (latest) setVerification(latest);
        setVerifyStatus({
          kind: "ok",
          message: latest
            ? `Latest of ${data.data?.length ?? 0} verification(s): ${latest.verificationStatus}`
            : "No verifications yet — submit one first.",
        });
      }
    } catch (err) {
      setVerifyStatus({ kind: "err", message: (err as Error).message });
    }
  }, [requireCustomerId, runCall]);

  const setOwnerField = <K extends keyof OwnerForm>(
    key: K,
    value: OwnerForm[K],
  ) => setOwner((prev) => ({ ...prev, [key]: value }));

  const setDocField = <K extends keyof DocForm>(key: K, value: DocForm[K]) =>
    setDoc((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <Button variant="outline" onClick={onPatchCustomer}>
        2. Update customer (PATCH)
      </Button>
      <HelpText>
        Re-sends the current customer form as{" "}
        <code>PATCH /customers/&lt;id&gt;</code> — use this to fix{" "}
        <code>MISSING_FIELD</code> / <code>INVALID_FIELD</code> errors before
        re-submitting.
      </HelpText>
      {patchStatus && (
        <Alert
          variant={patchStatus.kind === "ok" ? "default" : "critical"}
          title={patchStatus.kind === "ok" ? "Customer updated" : "Update failed"}
          description={patchStatus.message}
        />
      )}

      {customerType === "BUSINESS" && (
        <>
          <Divider />
          <SectionLabel>3. Beneficial owners (KYB)</SectionLabel>
          <HelpText>
            KYB requires one control person plus every individual owning ≥25%.
            Add each one with <code>POST /beneficial-owners</code>.
          </HelpText>
          <Field.Root>
            <Field.Label>Roles</Field.Label>
            <Checkbox.Group
              value={owner.roles}
              onValueChange={(v) => setOwnerField("roles", v)}
            >
              {BO_ROLES.map((r) => (
                <Checkbox.Item key={r} value={r} label={r} />
              ))}
            </Checkbox.Group>
          </Field.Root>
          <Row>
            <Field.Root>
              <Field.Label>Ownership %</Field.Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={owner.ownershipPercentage}
                onChange={(e) =>
                  setOwnerField("ownershipPercentage", e.target.value)
                }
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Birth date</Field.Label>
              <Input
                type="date"
                value={owner.birthDate}
                onChange={(e) => setOwnerField("birthDate", e.target.value)}
              />
            </Field.Root>
          </Row>
          <Row>
            <Field.Root>
              <Field.Label>First name</Field.Label>
              <Input
                value={owner.firstName}
                onChange={(e) => setOwnerField("firstName", e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Last name</Field.Label>
              <Input
                value={owner.lastName}
                onChange={(e) => setOwnerField("lastName", e.target.value)}
              />
            </Field.Root>
          </Row>
          <Row>
            <Field.Root>
              <Field.Label>Nationality (ISO 3166-1)</Field.Label>
              <Input
                value={owner.nationality}
                onChange={(e) => setOwnerField("nationality", e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Email (optional)</Field.Label>
              <Input
                type="email"
                value={owner.email}
                onChange={(e) => setOwnerField("email", e.target.value)}
              />
            </Field.Root>
          </Row>
          <Row>
            <Field.Root>
              <Field.Label>ID type</Field.Label>
              <SelectControl
                value={owner.idType}
                onValueChange={(v) => setOwnerField("idType", v)}
                items={BO_ID_TYPES.map((v) => ({ value: v, label: v }))}
              />
              <Field.Description>
                US persons: SSN or ITIN. Non-US: NON_US_TAX_ID.
              </Field.Description>
            </Field.Root>
            <Field.Root>
              <Field.Label>Identifier</Field.Label>
              <Input
                value={owner.identifier}
                onChange={(e) => setOwnerField("identifier", e.target.value)}
              />
            </Field.Root>
          </Row>
          <Row>
            <Field.Root>
              <Field.Label>Address line 1</Field.Label>
              <Input
                value={owner.addrLine1}
                onChange={(e) => setOwnerField("addrLine1", e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Line 2 (optional)</Field.Label>
              <Input
                value={owner.addrLine2}
                onChange={(e) => setOwnerField("addrLine2", e.target.value)}
              />
            </Field.Root>
          </Row>
          <Row>
            <Field.Root>
              <Field.Label>City</Field.Label>
              <Input
                value={owner.addrCity}
                onChange={(e) => setOwnerField("addrCity", e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>State</Field.Label>
              <Input
                value={owner.addrState}
                onChange={(e) => setOwnerField("addrState", e.target.value)}
              />
            </Field.Root>
          </Row>
          <Row>
            <Field.Root>
              <Field.Label>Postal code</Field.Label>
              <Input
                value={owner.addrPostal}
                onChange={(e) => setOwnerField("addrPostal", e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Country (ISO 3166-1)</Field.Label>
              <Input
                value={owner.addrCountry}
                onChange={(e) => setOwnerField("addrCountry", e.target.value)}
              />
            </Field.Root>
          </Row>
          <ButtonRow>
            <Button variant="outline" onClick={onAddOwner}>
              Add beneficial owner
            </Button>
            <Button variant="ghost" onClick={onLoadOwners}>
              Load existing owners
            </Button>
          </ButtonRow>
          {ownerStatus && (
            <Alert
              variant={ownerStatus.kind === "ok" ? "default" : "critical"}
              title={ownerStatus.kind === "ok" ? "Owner added" : "Add failed"}
              description={ownerStatus.message}
            />
          )}
          {owners.length > 0 && (
            <ResultPanel>
              {owners.map((o) => (
                <ResultMeta key={o.id}>
                  <Badge variant="green">{o.label}</Badge>
                  <Badge variant="gray">{o.id}</Badge>
                </ResultMeta>
              ))}
            </ResultPanel>
          )}
        </>
      )}

      <Divider />
      <SectionLabel>
        {customerType === "BUSINESS" ? "4" : "3"}. Upload document
      </SectionLabel>
      <HelpText>
        Documents are optional until <code>POST /verifications</code> returns{" "}
        <code>MISSING_*_DOCUMENT</code> errors naming the accepted types. PDF,
        JPEG or PNG, ≤ 10 MB.
      </HelpText>
      <Row>
        <Field.Root>
          <Field.Label>File</Field.Label>
          <FileInput
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Document type</Field.Label>
          <SelectControl
            value={doc.documentType}
            onValueChange={(v) =>
              setDoc((prev) => ({ ...prev, documentType: v, replaceId: "" }))
            }
            items={DOCUMENT_TYPES.map((v) => ({ value: v, label: v }))}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Issuing country (ISO 3166-1)</Field.Label>
          <Input
            value={doc.country}
            onChange={(e) => setDocField("country", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Side (optional)</Field.Label>
          <SelectControl
            value={doc.side}
            onValueChange={(v) => setDocField("side", v)}
            items={[
              { value: OMIT, label: "— omit —" },
              { value: "FRONT", label: "FRONT" },
              { value: "BACK", label: "BACK" },
            ]}
          />
        </Field.Root>
      </Row>
      <Row>
        <Field.Root>
          <Field.Label>Document number</Field.Label>
          <Input
            value={doc.documentNumber}
            onChange={(e) => setDocField("documentNumber", e.target.value)}
          />
        </Field.Root>
        <Field.Root>
          <Field.Label>Issuing authority</Field.Label>
          <Input
            value={doc.issuingAuthority}
            onChange={(e) => setDocField("issuingAuthority", e.target.value)}
          />
        </Field.Root>
      </Row>
      {docs.filter((d) => d.holder === (doc.holderId || customerId)).length >
        0 && (
        <Field.Root>
          <Field.Label>Save as</Field.Label>
          <SelectControl
            value={doc.replaceId || "new"}
            onValueChange={(v) =>
              setDocField("replaceId", v === "new" ? "" : v)
            }
            items={[
              { value: "new", label: "New document (POST /documents)" },
              ...docs
                .filter((d) => d.holder === (doc.holderId || customerId))
                .map((d) => ({
                  value: d.id,
                  label: `Replace ${d.documentType} — ${d.holder} — ${d.id}`,
                })),
            ]}
          />
          <Field.Description>
            Re-uploading a type that already exists for a holder is rejected —
            replace the existing document instead. Only documents for the
            active holder are listed.
          </Field.Description>
        </Field.Root>
      )}
      {doc.replaceId === "" && (
        <Field.Root>
          <Field.Label>Document holder</Field.Label>
          <SelectControl
            value={doc.holderId || customerId}
            onValueChange={(v) =>
              setDoc((prev) => ({ ...prev, holderId: v, replaceId: "" }))
            }
            items={[
              { value: customerId, label: `Customer — ${customerId || "(create first)"}` },
              ...owners.map((o) => ({ value: o.id, label: o.label })),
            ]}
          />
          <Field.Description>
            Who this document belongs to — the customer or an added beneficial
            owner.
          </Field.Description>
        </Field.Root>
      )}
      <ButtonRow>
        <Button variant="outline" onClick={onUploadDoc}>
          Upload document
        </Button>
        <Button variant="ghost" onClick={onLoadDocs}>
          Load existing documents
        </Button>
      </ButtonRow>
      {docStatus && (
        <Alert
          variant={docStatus.kind === "ok" ? "default" : "critical"}
          title={docStatus.kind === "ok" ? "Document uploaded" : "Upload failed"}
          description={docStatus.message}
        />
      )}
      {docs.length > 0 && (
        <ResultPanel>
          {docs.map((d) => (
            <ResultMeta key={d.id}>
              <Badge variant="green">{d.documentType}</Badge>
              <Badge variant="gray">{d.holder}</Badge>
              <Badge variant="gray">{d.id}</Badge>
            </ResultMeta>
          ))}
        </ResultPanel>
      )}

      <Divider />
      <SectionLabel>
        {customerType === "BUSINESS" ? "5" : "4"}. Submit for verification
      </SectionLabel>
      <ButtonRow>
        <Button onClick={onSubmitVerification}>Submit verification</Button>
        <Button variant="ghost" onClick={onPollVerifications}>
          Refresh (GET /verifications)
        </Button>
      </ButtonRow>
      {verifyStatus && (
        <Alert
          variant={verifyStatus.kind === "ok" ? "default" : "critical"}
          title={
            verifyStatus.kind === "ok" ? "Verification status" : "Submit failed"
          }
          description={verifyStatus.message}
        />
      )}
      {verification && (
        <ResultPanel>
          <ResultMeta>
            <Badge
              variant={
                verification.verificationStatus === "APPROVED"
                  ? "green"
                  : verification.verificationStatus === "REJECTED"
                    ? "red"
                    : "gray"
              }
            >
              {verification.verificationStatus}
            </Badge>
            <Badge variant="gray">{verification.id}</Badge>
          </ResultMeta>
          {verification.errors.map((e, i) => (
            <ErrorRow key={`${e.resourceId}-${e.type}-${i}`}>
              <ResultMeta>
                <Badge variant="red">{e.type}</Badge>
                {e.field && <ErrorField>{e.field}</ErrorField>}
              </ResultMeta>
              {e.acceptedDocumentTypes && e.acceptedDocumentTypes.length > 0 && (
                <ResultMeta>
                  {e.acceptedDocumentTypes.map((t) => (
                    <Badge variant="gray" key={t}>
                      {t}
                    </Badge>
                  ))}
                </ResultMeta>
              )}
              <ErrorReason>{e.reason}</ErrorReason>
            </ErrorRow>
          ))}
          {verification.errors.length > 0 && (
            <ErrorReason>
              Resolve these above (PATCH the customer form, add owners, or
              upload one of the accepted document types), then submit again.
            </ErrorReason>
          )}
        </ResultPanel>
      )}
    </>
  );
}

const FileInput = styled.input`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-primary);
`;

const HelpText = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #555);
  line-height: 1.5;
`;

const ErrorRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  padding-top: var(--spacing-xs, 4px);
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #eee);
`;

const ErrorField = styled.code`
  font-family: var(--font-family-mono);
  font-size: var(--font-size-xs, 12px);
  color: var(--text-primary);
  align-self: center;
`;

const ErrorReason = styled.div`
  font-size: var(--font-size-xs, 12px);
  color: var(--text-secondary, #555);
`;
