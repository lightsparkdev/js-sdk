import styled from "@emotion/styled";
import { Alert, Badge, Button, Card } from "@lightsparkdev/origin";
import { useCallback, useEffect, useState } from "react";

import { sandboxMagicFor } from "../../mode";
import { addOauthIssue, addOauthRetry } from "../../flows/oauth";
import {
  addPasskeyIssue,
  addPasskeyRetry,
  registerRealPasskey,
  type PasskeyAttestation,
} from "../../flows/passkey";
import {
  deleteCredential,
  deleteSession,
  exportWallet,
  listCredentials,
  listSessions,
} from "../../flows/manage";
import { getSessionId } from "../../session";
import { useAppState } from "../../state/store";
import { DismissibleAlert } from "../../components/DismissibleAlert";
import type { AccountBalance } from "./WalletHome";

interface Credential {
  id: string;
  type?: string;
  nickname?: string;
  status?: string;
}
interface Session {
  id: string;
  status?: string;
  expiresAt?: string;
}

/**
 * Settings — manage the active customer's wallet credentials & sessions, plus
 * wallet export. Every action runs the real guided flow in `flows/manage`
 * (issue 202 -> sign -> retry) or the credential add flows; in sandbox the
 * magic signature/attestation is used, in production a live session stamp.
 */
export function Settings({ accounts }: { accounts: AccountBalance[] }) {
  const { activeCustomer, platformAuth, reporter, signOut } = useAppState();
  const mode = platformAuth?.mode ?? "sandbox";
  const accountId =
    activeCustomer?.accountId ?? (accounts[0] ? String(accounts[0].id) : "");

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [mnemonicRevealed, setMnemonicRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    if (!platformAuth || !accountId) return;
    try {
      const creds = (await listCredentials(
        reporter,
        platformAuth,
        accountId,
      )) as {
        data?: Credential[];
      };
      setCredentials(creds.data ?? []);
      const sess = (await listSessions(reporter, platformAuth, accountId)) as {
        data?: Session[];
      };
      setSessions(sess.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [platformAuth, accountId, reporter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function run(
    key: string,
    action: () => Promise<unknown>,
    ok: string,
    onSuccess?: () => void,
  ) {
    if (!platformAuth) return;
    setBusy(key);
    setError(null);
    setNote(null);
    try {
      await action();
      setNote(ok);
      reporter.status(ok, "success");
      onSuccess?.();
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      reporter.status("Action failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  // After a session is revoked server-side, decide whether it's the session
  // THIS client is signing with: compare the revoked row id to the active
  // session id (`getSessionId`). If it matches, the local signing key is now
  // dead, so sign out locally — `CustomerView` falls back to <Login/> and the
  // customer can re-authenticate. A different session leaves ours intact.
  function onSessionRevoked(revokedId: string) {
    // Compare on the uuid tail so "Session:<uuid>" and a bare "<uuid>" still match.
    const tail = (id: string) => id.split(":").pop() ?? id;
    const current = getSessionId();
    if (revokedId && current && tail(revokedId) === tail(current)) {
      signOut();
      reporter.status(
        "Your session was revoked — please sign in again.",
        "info",
      );
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
    await run(
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
          accountId,
          nickname,
          attestation,
        );
        if (!requestId)
          throw new Error("Add security key: no requestId in the 202.");
        return addPasskeyRetry(
          reporter,
          platformAuth!,
          accountId,
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
    await run(
      "add-oauth",
      async () => {
        const oidc = sandboxMagicFor("oauth-add-oidc") ?? "";
        const { requestId } = await addOauthIssue(
          reporter,
          platformAuth!,
          accountId,
          oidc,
        );
        if (!requestId) throw new Error("Add OAuth: no requestId in the 202.");
        return addOauthRetry(
          reporter,
          platformAuth!,
          accountId,
          oidc,
          requestId,
        );
      },
      "OAuth credential added.",
    );
  }

  // Export runs its own handler (not the generic `run`) so it can capture the
  // recovered mnemonic and reveal it in the card.
  async function exportAndReveal() {
    if (!platformAuth) return;
    setBusy("export");
    setError(null);
    setNote(null);
    setMnemonic(null);
    setMnemonicRevealed(false);
    setCopied(false);
    try {
      const { mnemonic: recovered } = await exportWallet(
        reporter,
        platformAuth,
        accountId,
      );
      setMnemonic(recovered);
      setNote("Wallet exported — your recovery phrase is shown below.");
      reporter.status("Wallet exported.", "success");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      reporter.status("Action failed.", "error");
    } finally {
      setBusy(null);
    }
  }

  async function copyMnemonic() {
    if (!mnemonic) return;
    try {
      await navigator.clipboard.writeText(mnemonic);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy to clipboard.");
    }
  }

  if (!accountId) {
    return (
      <Card.Root variant="structured">
        <Card.Body>
          <Alert
            variant="warning"
            title="No account"
            description="No wallet account to manage."
          />
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Stack>
      {error && (
        <DismissibleAlert
          variant="critical"
          title="Couldn't complete that"
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

      {/* Credentials */}
      <Card.Root variant="structured">
        <Card.Header>
          <HeaderLayout>
            <Card.TitleGroup>
              <Card.Title>Sign-in credentials</Card.Title>
              <Card.Subtitle>
                The security keys and identities that can unlock this wallet.
              </Card.Subtitle>
            </Card.TitleGroup>
            <Actions>
              <Button
                variant="outline"
                size="compact"
                loading={busy === "add-passkey"}
                onClick={() => void addPasskey()}
              >
                Add security key
              </Button>
              <Button
                variant="outline"
                size="compact"
                loading={busy === "add-oauth"}
                onClick={() => void addOauth()}
              >
                Add OAuth
              </Button>
            </Actions>
          </HeaderLayout>
        </Card.Header>
        <Card.Body fullwidth>
          {credentials.length === 0 ? (
            <EmptyRow>No credentials.</EmptyRow>
          ) : (
            <List>
              {credentials.map((c) => (
                <Row key={c.id}>
                  <RowLeft>
                    <Badge variant="blue">{c.type ?? "CREDENTIAL"}</Badge>
                    <RowText>
                      <RowName>{c.nickname || c.type || "Credential"}</RowName>
                      <RowId title={c.id}>{c.id}</RowId>
                    </RowText>
                  </RowLeft>
                  <Button
                    variant="ghost"
                    size="compact"
                    loading={busy === `del-cred-${c.id}`}
                    onClick={() =>
                      void run(
                        `del-cred-${c.id}`,
                        () => deleteCredential(reporter, platformAuth!, c.id),
                        "Credential removed.",
                      )
                    }
                  >
                    Remove
                  </Button>
                </Row>
              ))}
            </List>
          )}
        </Card.Body>
      </Card.Root>

      {/* Sessions */}
      <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Active sessions</Card.Title>
            <Card.Subtitle>
              Revoke a session to sign it out everywhere.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        <Card.Body fullwidth>
          {sessions.length === 0 ? (
            <EmptyRow>No active sessions.</EmptyRow>
          ) : (
            <List>
              {sessions.map((s) => (
                <Row key={s.id}>
                  <RowLeft>
                    <Badge variant={s.status === "ACTIVE" ? "green" : "gray"}>
                      {s.status ?? "SESSION"}
                    </Badge>
                    <RowText>
                      <RowId title={s.id}>{s.id}</RowId>
                      {s.expiresAt && (
                        <RowSub>Expires {formatDate(s.expiresAt)}</RowSub>
                      )}
                    </RowText>
                  </RowLeft>
                  <Button
                    variant="ghost"
                    size="compact"
                    loading={busy === `del-sess-${s.id}`}
                    onClick={() =>
                      void run(
                        `del-sess-${s.id}`,
                        () => deleteSession(reporter, platformAuth!, s.id),
                        "Session revoked.",
                        () => onSessionRevoked(s.id),
                      )
                    }
                  >
                    Revoke
                  </Button>
                </Row>
              ))}
            </List>
          )}
        </Card.Body>
      </Card.Root>

      {/* Export */}
      <Card.Root variant="structured">
        <Card.Header>
          <Card.TitleGroup>
            <Card.Title>Export wallet</Card.Title>
            <Card.Subtitle>
              Export the wallet's private key material (HPKE-sealed to the
              client). Self-custody escape hatch — handle with care.
            </Card.Subtitle>
          </Card.TitleGroup>
        </Card.Header>
        {mnemonic && (
          <Card.Body fullwidth>
            <Alert
              variant="warning"
              title="Recovery phrase"
              description="This is your wallet's recovery phrase — anyone with it controls the funds. Never share it."
            />
            <MnemonicBox>
              <MnemonicText data-hidden={!mnemonicRevealed}>
                {mnemonicRevealed ? mnemonic : "•".repeat(48)}
              </MnemonicText>
              <MnemonicActions>
                <Button
                  variant="ghost"
                  size="compact"
                  onClick={() => setMnemonicRevealed((v) => !v)}
                >
                  {mnemonicRevealed ? "Hide" : "Reveal"}
                </Button>
                <Button
                  variant="ghost"
                  size="compact"
                  onClick={() => void copyMnemonic()}
                >
                  {copied ? "Copied" : "Copy"}
                </Button>
              </MnemonicActions>
            </MnemonicBox>
          </Card.Body>
        )}
        <Card.Footer>
          <Button
            variant="outline"
            loading={busy === "export"}
            onClick={() => void exportAndReveal()}
          >
            Export wallet
          </Button>
        </Card.Footer>
      </Card.Root>
    </Stack>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
`;

const HeaderLayout = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  width: 100%;
  flex-wrap: wrap;
`;

const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 12px) var(--spacing-md, 16px);
  border-top: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);

  &:first-of-type {
    border-top: none;
  }
`;

const RowLeft = styled.div`
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

const RowSub = styled.span`
  font-size: var(--font-size-xs, 11px);
  color: var(--text-tertiary, #8a8a8a);
`;

const EmptyRow = styled.div`
  font-size: var(--font-size-sm, 13px);
  color: var(--text-tertiary, #8a8a8a);
  padding: var(--spacing-md, 16px);
`;

const MnemonicBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  margin-top: var(--spacing-sm, 12px);
  padding: var(--spacing-md, 16px);
  border: var(--stroke-xs, 1px) solid var(--border-primary, #e6e6e9);
  border-radius: var(--corner-radius-md, 8px);
  background: var(--surface-secondary, #f0f0ee);
`;

const MnemonicText = styled.code`
  font-size: var(--font-size-sm, 13px);
  line-height: 1.5;
  word-break: break-word;
  flex: 1;
  min-width: 0;
  color: var(--text-primary, #1a1a1a);

  &[data-hidden="true"] {
    color: var(--text-tertiary, #8a8a8a);
    letter-spacing: 2px;
  }
`;

const MnemonicActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  flex-shrink: 0;
`;
