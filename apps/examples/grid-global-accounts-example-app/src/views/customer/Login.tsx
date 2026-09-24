import styled from "@emotion/styled";
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Tabs,
} from "@lightsparkdev/origin";
import { useCallback, useEffect, useState } from "react";

import { sandboxMagicFor } from "../../mode";
import {
  persistLoginKeyEncoding,
  readLoginKeyEncoding,
} from "../../login-key-encoding";
import { GOOGLE_OAUTH_CLIENT_ID, type LoginKeyEncoding } from "../../config";
import { DismissibleAlert } from "../../components/DismissibleAlert";
import { useAppState } from "../../state/store";
import { generateClientKeyPair } from "../../turnkey";
import {
  oidcNonceForPublicKey,
  requestGoogleIdToken,
} from "../../google-identity";
import { addEmailOtpIssue, addEmailOtpRetry } from "../../flows/email-otp";
import {
  addOauthIssue,
  addOauthRetry,
  runOauthVerify,
  signInOauth,
} from "../../flows/oauth";
import {
  addPasskeyIssue,
  addPasskeyRetry,
  registerRealPasskey,
  signInPasskey,
  type PasskeyAttestation,
} from "../../flows/passkey";
import { listCredentials } from "../../flows/manage";
import { getRawCredentialId, getRawCredentialIds } from "../../passkey-store";
import { sendOtpChallenge, verifyOtpStep } from "../../flows/otp-step";
import {
  hasEmailOtpCredential,
  methodForCredential,
  parseCredentials,
  type ExistingCredential,
  type Method,
} from "../../flows/login-decision";

const METHOD_LABEL: Record<Method, string> = {
  email_otp: "Email OTP",
  oauth: "OAuth",
  passkey: "Security key",
};

const METHOD_BADGE: Record<Method, "blue" | "purple" | "green"> = {
  email_otp: "blue",
  oauth: "purple",
  passkey: "green",
};

/** What the login view knows about an account's existing credentials. */
type CredentialsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; credentials: ExistingCredential[] };

/**
 * Customer login screen (logged-out state). It is organized around the wallet's
 * EXISTING credentials rather than method tabs:
 *
 *   1. "Your sign-in methods" lists EVERY credential the wallet has (a wallet can
 *      hold multiple passkeys / oauth identities — we render the full list, never
 *      collapsing to one-per-type). Each row authenticates against THAT row's
 *      credential id.
 *   2. "Add a sign-in method" runs the create + verify ceremony for a brand-new
 *      method. Passkey/OAuth are always addable (multiple allowed); Email OTP is
 *      offered only when the wallet has none yet (single).
 *
 * The production EMAIL_OTP bug is fixed by the per-row sign-in being a TWO-STEP
 * action: clicking "Sign in" on an Email-OTP row fires `requestV3Challenge` ONCE
 * (the only thing that sends the OTP email), then reveals a code input. Verify
 * runs `runV3Verify` against the bundle the challenge produced — it never issues
 * a challenge, so a failed verify / retry can't re-send (and invalidate) the
 * code. The challenge fires only on an explicit Send / Resend click, never on
 * render. See `flows/otp-step.ts` for the pure two-step orchestration.
 *
 * On a verified session it calls `setSession(...)`, flipping `CustomerView` to
 * the wallet home. In sandbox the magic values are pre-filled (but never
 * auto-submitted); in production the user supplies real material.
 */
export function Login() {
  const { activeCustomer, platformAuth, reporter } = useAppState();

  // Login needs both an account to attach the credential to and platform auth
  // to talk to Grid. Both come from the platform side ("Act as" + Connect).
  const accountId = activeCustomer?.accountId ?? null;

  const [creds, setCreds] = useState<CredentialsState>({ status: "loading" });

  const refreshCredentials = useCallback(async () => {
    if (!platformAuth || !accountId) {
      setCreds({ status: "ready", credentials: [] });
      return;
    }
    setCreds({ status: "loading" });
    try {
      const raw = await listCredentials(reporter, platformAuth, accountId);
      setCreds({ status: "ready", credentials: parseCredentials(raw) });
    } catch (err) {
      setCreds({
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }, [platformAuth, accountId, reporter]);

  // Single-shot per (account, auth): refreshCredentials' deps are stable, so this
  // fires once per account rather than looping.
  useEffect(() => {
    void refreshCredentials();
  }, [refreshCredentials]);

  if (!platformAuth) {
    return (
      <Card.Root variant="structured">
        <Card.Body>
          <Alert
            variant="default"
            title="Platform not connected"
            description="Connect platform credentials in the Platform view first — the wallet authenticates through them."
          />
        </Card.Body>
      </Card.Root>
    );
  }

  const credentials =
    creds.status === "ready" ? creds.credentials : ([] as ExistingCredential[]);
  const canAddEmailOtp =
    creds.status === "ready" && !hasEmailOtpCredential(credentials);
  const empty = creds.status === "ready" && credentials.length === 0;

  return (
    <Card.Root variant="structured">
      <Card.Header>
        <Card.TitleGroup>
          <EyebrowRow>
            <Badge variant="blue" vibrant>
              Sign in
            </Badge>
            <Badge
              variant={platformAuth.mode === "production" ? "yellow" : "sky"}
            >
              {platformAuth.mode}
            </Badge>
          </EyebrowRow>
          <Card.Title>Access your wallet</Card.Title>
          <Card.Subtitle>
            Sign in with a method already on this wallet, or add a new one.
            Every ceremony runs for real — nothing is auto-signed.
          </Card.Subtitle>
        </Card.TitleGroup>
      </Card.Header>

      <Card.Body>
        {!accountId && (
          <Note>
            <Alert
              variant="warning"
              title="No wallet account for this customer"
              description="This customer was created without a provisioned internal account, so there's nothing to sign in to. Re-create the customer from the Platform view."
            />
          </Note>
        )}

        {creds.status === "error" && (
          <Note>
            <Alert
              variant="critical"
              title="Couldn't load existing sign-in methods"
              description={creds.message}
            />
          </Note>
        )}

        <LoginKeyEncodingField />

        {/* 1. Existing credentials → per-credential sign-in. */}
        {!empty && (
          <Section>
            <SectionHead>
              <SectionTitle>Your sign-in methods</SectionTitle>
              <SectionHint>
                Authenticate with a credential already registered on this
                wallet.
              </SectionHint>
            </SectionHead>

            {creds.status === "loading" && (
              <MutedRow>Loading sign-in methods…</MutedRow>
            )}

            {creds.status === "ready" && credentials.length > 0 && (
              <CredList>
                {credentials.map((cred, i) => (
                  <CredentialRow
                    // A wallet may hold several credentials of the same type, so
                    // key on the id and fall back to the index for any (unusual)
                    // id-less row rather than collapsing duplicates away.
                    key={cred.id || `cred-${i}`}
                    accountId={accountId}
                    credential={cred}
                    onChanged={refreshCredentials}
                  />
                ))}
              </CredList>
            )}
          </Section>
        )}

        {/* 4. Empty state: only the add section shows. */}
        {empty && (
          <Note>
            <Alert
              variant="default"
              title="No sign-in methods yet"
              description="This wallet has no credentials. Add one below to sign in."
            />
          </Note>
        )}

        {/* 3. Add a sign-in method. */}
        <AddMethods
          accountId={accountId}
          canAddEmailOtp={canAddEmailOtp}
          loading={creds.status === "loading"}
          onChanged={refreshCredentials}
        />
      </Card.Body>
    </Card.Root>
  );
}

/**
 * Segmented control that flips which SEC1 encoding of the client session key the
 * OAuth/passkey sign-in flows send. Seeded from and persisted to the same
 * localStorage flag `flows/*` read at login call-time, so a flip takes effect on
 * the next sign-in with no reload. Built on Origin's Tabs to match the Mode
 * picker idiom.
 */
function LoginKeyEncodingField() {
  const [encoding, setEncoding] = useState<LoginKeyEncoding>(
    readLoginKeyEncoding(),
  );

  function select(value: string) {
    const next: LoginKeyEncoding = value === "legacy" ? "legacy" : "modern";
    setEncoding(next);
    persistLoginKeyEncoding(next);
  }

  return (
    <Section>
      <Field.Root>
        <Field.Label>Login session key</Field.Label>
        <Tabs.Root value={encoding} onValueChange={select}>
          <Tabs.List variant="default">
            <Tabs.Tab value="modern">Modern</Tabs.Tab>
            <Tabs.Tab value="legacy">Legacy</Tabs.Tab>
          </Tabs.List>
        </Tabs.Root>
        <Field.Description>
          Which client key OAuth/passkey sign-in registers: modern (compressed,
          client-held session key) or legacy (uncompressed, server HPKE bundle).
        </Field.Description>
      </Field.Root>
    </Section>
  );
}

/** Shared "run an action + surface error/busy + set session on success" hook. */
function useLoginAction() {
  const { reporter, platformAuth, setSession, activeCustomer } = useAppState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<unknown>) {
    if (!platformAuth) return;
    setBusy(true);
    setError(null);
    try {
      const session = await action();
      setSession(session ?? { loggedIn: true });
      reporter.status(
        `Signed in as ${activeCustomer?.name ?? "customer"}.`,
        "success",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Sign in failed.", "error");
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, setError, run, reporter, platformAuth };
}

/** One existing-credential row: a labeled header plus the method-specific
 *  authenticate UI. Renders for EVERY credential the wallet returns. */
function CredentialRow({
  accountId,
  credential,
  onChanged,
}: {
  accountId: string | null;
  credential: ExistingCredential;
  onChanged: () => Promise<void> | void;
}) {
  const { debugOn } = useAppState();
  const method = methodForCredential(credential);

  return (
    <Row>
      <RowHead>
        <RowHeadLeft>
          <Badge variant={method ? METHOD_BADGE[method] : "gray"}>
            {method ? METHOD_LABEL[method] : credential.type ?? "Credential"}
          </Badge>
          <RowText>
            <RowName>
              {credential.nickname ||
                (method ? METHOD_LABEL[method] : "Credential")}
            </RowName>
            {debugOn && credential.id && (
              <RowId title={credential.id}>{credential.id}</RowId>
            )}
          </RowText>
        </RowHeadLeft>
        {credential.status && (
          <Badge variant={credential.status === "ACTIVE" ? "green" : "gray"}>
            {credential.status}
          </Badge>
        )}
      </RowHead>

      <RowBody>
        {method === "email_otp" && (
          <EmailOtpSignIn credential={credential} onChanged={onChanged} />
        )}
        {method === "oauth" && (
          <OauthSignIn
            accountId={accountId}
            credential={credential}
            onChanged={onChanged}
          />
        )}
        {method === "passkey" && (
          <PasskeySignIn
            accountId={accountId}
            credential={credential}
            onChanged={onChanged}
          />
        )}
        {!method && (
          <MutedRow>
            Unrecognized credential type — no sign-in handler available.
          </MutedRow>
        )}
      </RowBody>
    </Row>
  );
}

/** Holds the two-step OTP state for a single credential row. `targetBundle` is
 *  null until the explicit Send fires the challenge. */
type OtpUi =
  | { phase: "idle" }
  | { phase: "awaiting_code"; targetBundle: string };

function EmailOtpSignIn({
  credential,
  onChanged,
}: {
  credential: ExistingCredential;
  onChanged: () => Promise<void> | void;
}) {
  const { busy, error, setError, run, reporter, platformAuth } =
    useLoginAction();
  const sandbox = platformAuth?.mode !== "production";
  const [ui, setUi] = useState<OtpUi>({ phase: "idle" });
  const [sending, setSending] = useState(false);
  const [otp, setOtp] = useState("");

  // Step 1 — explicit Send / Resend: this is the ONLY thing that fires the
  // challenge (and thus sends the OTP email). It never verifies.
  async function send() {
    if (!platformAuth) return;
    setSending(true);
    setError(null);
    try {
      const next = await sendOtpChallenge(
        reporter,
        platformAuth,
        credential.id,
      );
      setUi({ phase: "awaiting_code", targetBundle: next.targetBundle });
      // Sandbox may pre-fill the magic code AFTER the challenge — but never
      // auto-submit; the user still clicks Verify.
      if (sandbox)
        setOtp((prev) => prev || (sandboxMagicFor("email_otp-v3-code") ?? ""));
      reporter.status("One-time code sent.", "info");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      reporter.status("Couldn't send the code.", "error");
    } finally {
      setSending(false);
    }
  }

  // Step 2 — verify against the bundle the challenge produced. Never challenges.
  async function verify() {
    if (ui.phase !== "awaiting_code") return;
    await run(async () => {
      const session = await verifyOtpStep(
        reporter,
        platformAuth!,
        credential.id,
        ui.targetBundle,
        otp,
      );
      await onChanged();
      return session;
    });
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        if (ui.phase === "awaiting_code") void verify();
        else void send();
      }}
    >
      {error && (
        <DismissibleAlert
          variant="critical"
          title="Couldn't sign in"
          description={error}
          onClose={() => setError(null)}
        />
      )}
      <Lede>
        We email a one-time code, then verify it inside the enclave — the code
        never leaves the device in plaintext.
      </Lede>

      {ui.phase === "idle" && (
        <Button type="submit" variant="filled" loading={sending}>
          Send code &amp; sign in
        </Button>
      )}

      {ui.phase === "awaiting_code" && (
        <>
          <Field.Root>
            <Field.Label>One-time code</Field.Label>
            <Input
              value={otp}
              inputMode="numeric"
              placeholder="123456"
              autoComplete="one-time-code"
              onChange={(e) => setOtp(e.target.value)}
            />
            {sandbox && (
              <Field.Description>
                Sandbox accepts the magic code <Mono>000000</Mono>.
              </Field.Description>
            )}
          </Field.Root>
          <Actions>
            <Button type="submit" variant="filled" loading={busy}>
              Verify &amp; sign in
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="compact"
              loading={sending}
              onClick={() => void send()}
            >
              Resend code
            </Button>
          </Actions>
        </>
      )}
    </Form>
  );
}

/** One-click Google LOGIN against an existing OAuth credential: bind the OIDC
 *  nonce to the compressed session key, fetch a Google id_token, verify. */
function GoogleSignIn({
  credId,
  onChanged,
}: {
  credId: string;
  onChanged: () => Promise<void> | void;
}) {
  const { busy, error, setError, run, reporter, platformAuth } =
    useLoginAction();

  if (!GOOGLE_OAUTH_CLIENT_ID) {
    return (
      <MutedRow>
        Set <Mono>VITE_GOOGLE_CLIENT_ID</Mono> to enable one-click Google
        sign-in.
      </MutedRow>
    );
  }

  async function submit() {
    await run(async () => {
      // Google is modern-only: the enclave binds the nonce to the COMPRESSED
      // session key, so send that regardless of the legacy/modern toggle.
      const kp = generateClientKeyPair();
      const clientPublicKey = kp.publicKey;
      const nonce = await oidcNonceForPublicKey(clientPublicKey);
      const oidcToken = await requestGoogleIdToken(
        GOOGLE_OAUTH_CLIENT_ID,
        nonce,
      );
      const data = await runOauthVerify(
        reporter,
        platformAuth!,
        credId,
        oidcToken,
        clientPublicKey,
      );
      await onChanged();
      return data;
    });
  }

  return (
    <GoogleBlock>
      {error && (
        <DismissibleAlert
          variant="critical"
          title="Couldn't sign in with Google"
          description={error}
          onClose={() => setError(null)}
        />
      )}
      <Button
        type="button"
        variant="outline"
        loading={busy}
        onClick={() => void submit()}
      >
        Sign in with Google
      </Button>
    </GoogleBlock>
  );
}

function OauthSignIn({
  accountId,
  credential,
  onChanged,
}: {
  accountId: string | null;
  credential: ExistingCredential;
  onChanged: () => Promise<void> | void;
}) {
  const { busy, error, setError, run, reporter, platformAuth } =
    useLoginAction();
  const sandbox = platformAuth?.mode !== "production";
  const [oidc, setOidc] = useState(
    sandbox ? sandboxMagicFor("oauth-verify-oidc") ?? "" : "",
  );

  async function submit() {
    await run(async () => {
      if (!accountId) throw new Error("No wallet account to sign in to.");
      // Authenticate against THIS credential id (existingCredId set → no create).
      const data = await signInOauth(
        reporter,
        platformAuth!,
        accountId,
        oidc,
        credential.id,
      );
      await onChanged();
      return data;
    });
  }

  return (
    <OauthOptions>
      <GoogleSignIn credId={credential.id} onChanged={onChanged} />
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        {error && (
          <DismissibleAlert
            variant="critical"
            title="Couldn't sign in"
            description={error}
            onClose={() => setError(null)}
          />
        )}
        <Lede>
          Or paste the provider's OpenID Connect ID token; Grid verifies it
          against this credential and issues a session.
        </Lede>
        <Field.Root>
          <Field.Label>OIDC ID token</Field.Label>
          <Input
            value={oidc}
            placeholder="eyJhbGciOiJSUzI1Ni…"
            autoComplete="off"
            onChange={(e) => setOidc(e.target.value)}
          />
          {sandbox && (
            <Field.Description>
              Pre-filled with a sandbox magic token.
            </Field.Description>
          )}
        </Field.Root>
        <Button type="submit" variant="filled" loading={busy}>
          Sign in with OAuth
        </Button>
      </Form>
    </OauthOptions>
  );
}

function PasskeySignIn({
  accountId,
  credential,
  onChanged,
}: {
  accountId: string | null;
  credential: ExistingCredential;
  onChanged: () => Promise<void> | void;
}) {
  const { busy, error, setError, run, reporter, platformAuth } =
    useLoginAction();
  const mode = platformAuth?.mode ?? "sandbox";
  const sandbox = mode !== "production";
  const [rpId, setRpId] = useState("");

  // Raw WebAuthn credential id for THIS passkey, if we registered it on this
  // browser (the Grid credential id is NOT the WebAuthn id). When unknown we
  // fall back to every raw id we have stored, so a wallet with several security
  // keys can still match one; if we have none, the assertion uses an empty
  // allowCredentials and lets the key present a discoverable credential.
  const ownRawId = getRawCredentialId(credential.id);
  const knownRawIds = ownRawId ? [ownRawId] : getRawCredentialIds();
  const rawIdKnown = !sandbox && knownRawIds.length > 0;

  async function submit() {
    await run(async () => {
      if (!accountId) throw new Error("No wallet account to sign in to.");
      // Authenticate against THIS existing passkey via the WebAuthn assertion
      // (security key in prod, seeded assertion in sandbox). existingCredId set
      // → `register` is never invoked.
      const data = await signInPasskey(reporter, platformAuth!, {
        accountId,
        nickname: credential.nickname || "Security key",
        existingCredId: credential.id,
        register: () =>
          Promise.reject(
            new Error("Passkey already exists — registration not needed."),
          ),
        loginParams: {
          mode,
          // Target the security key by its raw WebAuthn id(s) over USB/NFC.
          credentialIds: sandbox
            ? [sandboxMagicFor("passkey-create-cred-id-raw") ?? ""]
            : knownRawIds,
          rpId: rpId || undefined,
          sandboxAssertion: sandbox
            ? {
                credentialId:
                  sandboxMagicFor("passkey-create-cred-id-raw") ?? "",
                clientDataJson:
                  sandboxMagicFor("passkey-verify-client-data-json") ?? "",
                authenticatorData:
                  sandboxMagicFor("passkey-verify-auth-data") ?? "",
                signature: sandboxMagicFor("passkey-verify-signature") ?? "",
              }
            : undefined,
        },
      });
      await onChanged();
      return data;
    });
  }

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
    >
      {error && (
        <DismissibleAlert
          variant="critical"
          title="Couldn't sign in"
          description={error}
          onClose={() => setError(null)}
        />
      )}
      <Lede>
        {sandbox
          ? "Sandbox uses a seeded assertion — no authenticator prompt."
          : "Insert your security key (YubiKey) and sign the session challenge. We target the key over USB/NFC, not the platform passkey."}
      </Lede>
      {!sandbox && !rawIdKnown && (
        <Alert
          variant="warning"
          title="Security-key id not stored locally"
          description="This passkey wasn't registered in this browser, so we don't have its WebAuthn id. Your key will be asked to present a discoverable credential instead — insert it and follow the prompt."
        />
      )}
      {!sandbox && (
        <Field.Root>
          <Field.Label>Relying-party ID</Field.Label>
          <Input
            value={rpId}
            placeholder="localhost"
            autoComplete="off"
            onChange={(e) => setRpId(e.target.value)}
          />
          <Field.Description>
            Defaults to the page hostname; must match the sub-org's RP ID.
          </Field.Description>
        </Field.Root>
      )}
      <Button type="submit" variant="filled" loading={busy}>
        Sign in with security key
      </Button>
    </Form>
  );
}

/**
 * "Add a sign-in method" section. Passkey + OAuth are always available (a wallet
 * may hold several). Email OTP is offered only when the wallet has none yet.
 * Each add runs the real create + verify ceremony via the existing add flows
 * (issue 202 → signed retry); afterwards the credentials list refreshes so the
 * new method appears with its own per-credential sign-in (Email OTP still goes
 * through the explicit challenge → verify steps once added).
 */
function AddMethods({
  accountId,
  canAddEmailOtp,
  loading,
  onChanged,
}: {
  accountId: string | null;
  canAddEmailOtp: boolean;
  loading: boolean;
  onChanged: () => Promise<void> | void;
}) {
  const { reporter, platformAuth } = useAppState();
  const mode = platformAuth?.mode ?? "sandbox";
  const sandbox = mode !== "production";
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function add(key: string, action: () => Promise<unknown>, ok: string) {
    if (!platformAuth || !accountId) {
      setError("No wallet account to add a credential to.");
      return;
    }
    setBusy(key);
    setError(null);
    setNote(null);
    try {
      await action();
      setNote(ok);
      reporter.status(ok, "success");
      await onChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Couldn't add that method.", "error");
    } finally {
      setBusy(null);
    }
  }

  function sandboxPasskeyAttestation(): PasskeyAttestation {
    return {
      challenge: sandboxMagicFor("passkey-create-challenge") ?? "",
      credentialId: sandboxMagicFor("passkey-create-cred-id-raw") ?? "",
      clientDataJson: sandboxMagicFor("passkey-create-client-data-json") ?? "",
      attestationObject:
        sandboxMagicFor("passkey-create-attestation-object") ?? "",
    };
  }

  async function addPasskey() {
    await add(
      "add-passkey",
      async () => {
        const nickname = "Security key (YubiKey)";
        const attestation =
          mode === "production"
            ? await registerRealPasskey(reporter, nickname)
            : sandboxPasskeyAttestation();
        const { requestId, payloadToSign } = await addPasskeyIssue(
          reporter,
          platformAuth!,
          accountId!,
          nickname,
          attestation,
        );
        if (!requestId)
          throw new Error("Add security key: no requestId in the 202.");
        return addPasskeyRetry(
          reporter,
          platformAuth!,
          accountId!,
          nickname,
          attestation,
          requestId,
          payloadToSign,
        );
      },
      "Security key added.",
    );
  }

  async function addOauth() {
    await add(
      "add-oauth",
      async () => {
        const oidc = sandboxMagicFor("oauth-add-oidc") ?? "";
        const { requestId, payloadToSign } = await addOauthIssue(
          reporter,
          platformAuth!,
          accountId!,
          oidc,
        );
        if (!requestId) throw new Error("Add OAuth: no requestId in the 202.");
        return addOauthRetry(
          reporter,
          platformAuth!,
          accountId!,
          oidc,
          requestId,
          payloadToSign,
        );
      },
      "OAuth credential added.",
    );
  }

  async function addEmailOtp() {
    await add(
      "add-email-otp",
      async () => {
        const { requestId } = await addEmailOtpIssue(
          reporter,
          platformAuth!,
          accountId!,
        );
        if (!requestId)
          throw new Error("Add Email OTP: no requestId in the 202.");
        return addEmailOtpRetry(reporter, platformAuth!, accountId!, requestId);
      },
      "Email OTP method added — sign in with it above.",
    );
  }

  const disabled = !accountId || loading;

  return (
    <Section>
      <SectionHead>
        <SectionTitle>Add a sign-in method</SectionTitle>
        <SectionHint>
          Register another way to unlock this wallet. Adding a security key
          prompts for a roaming hardware key (YubiKey) over USB/NFC, not the
          platform passkey. Security keys and OAuth identities can be added more
          than once.
          {sandbox && " Sandbox uses seeded ceremony material."}
        </SectionHint>
      </SectionHead>

      {error && (
        <DismissibleAlert
          variant="critical"
          title="Couldn't add method"
          description={error}
          onClose={() => setError(null)}
        />
      )}
      {note && (
        <DismissibleAlert
          variant="default"
          title={note}
          onClose={() => setNote(null)}
        />
      )}

      <AddRow>
        <Button
          variant="outline"
          size="compact"
          disabled={disabled}
          loading={busy === "add-passkey"}
          onClick={() => void addPasskey()}
        >
          + Add security key
        </Button>
        <Button
          variant="outline"
          size="compact"
          disabled={disabled}
          loading={busy === "add-oauth"}
          onClick={() => void addOauth()}
        >
          + Add OAuth
        </Button>
        {canAddEmailOtp && (
          <Button
            variant="outline"
            size="compact"
            disabled={disabled}
            loading={busy === "add-email-otp"}
            onClick={() => void addEmailOtp()}
          >
            + Add Email OTP
          </Button>
        )}
      </AddRow>
    </Section>
  );
}

const EyebrowRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs, 6px);
  margin-bottom: var(--spacing-2xs, 6px);
`;

const Note = styled.div`
  margin-bottom: var(--spacing-md, 16px);
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);

  & + & {
    margin-top: var(--spacing-xl, 32px);
    padding-top: var(--spacing-lg, 24px);
    border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  }
`;

const SectionHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3xs, 4px);
`;

const SectionTitle = styled.h3`
  margin: 0;
  font-size: var(--font-size-base, 15px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--text-primary, #1a1a1a);
`;

const SectionHint = styled.p`
  margin: 0;
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary, #555);
  line-height: 1.5;
`;

const CredList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  border-radius: var(--corner-radius-lg, 12px);
  background: var(--surface-base, #fff);
`;

const RowHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm, 12px);
`;

const RowHeadLeft = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  min-width: 0;
`;

const RowText = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const RowName = styled.span`
  font-size: var(--font-size-sm, 13px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--text-primary, #1a1a1a);
`;

const RowId = styled.span`
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary, #8a8a8a);
  font-variant-numeric: tabular-nums;
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RowBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const OauthOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
`;

const GoogleBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-sm, 12px);
`;

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  flex-wrap: wrap;
`;

const AddRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  flex-wrap: wrap;
`;

const Lede = styled.p`
  margin: 0;
  font-size: var(--font-size-sm, 13px);
  color: var(--text-secondary, #555);
  line-height: 1.5;
`;

const MutedRow = styled.div`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary, #8a8a8a);
`;

const Mono = styled.code`
  font-family: var(--font-family-mono, ui-monospace, monospace);
  background: var(--surface-base, #f5f5f7);
  border-radius: var(--corner-radius-sm, 6px);
  padding: 1px 5px;
  font-size: 0.92em;
`;
