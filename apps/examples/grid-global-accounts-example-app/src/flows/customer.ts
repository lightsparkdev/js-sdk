// Shared setup: create customer, platform config (OTP + branding), balance.

import { apiGet, apiPatch, apiPost } from "../api-client";
import { addLog, bindClick, el, maybeEl } from "../ui";
import { setCtxAccount } from "./context";

// ----- Create customer + Fetch balance -----

export function wireCustomerFlows(): void {
  const createPlatformCustomerId = el<HTMLInputElement>(
    "create-platform-customer-id",
  );
  const createCustomerName = el<HTMLInputElement>("create-customer-name");
  const createCustomerEmail = el<HTMLInputElement>("create-customer-email");
  const balanceCustomerId = el<HTMLInputElement>("balance-customer-id");

  bindClick(
    "btn-create-customer",
    "create-customer-status",
    "Create Customer",
    "Creating customer...",
    async () => {
      const platformCustomerId =
        createPlatformCustomerId.value.trim() || `test-${Date.now()}`;
      const fullName = createCustomerName.value.trim() || "Test User";
      const email = createCustomerEmail.value.trim();
      const body: Record<string, unknown> = {
        customerType: "BUSINESS",
        platformCustomerId,
        region: "US",
        currencies: ["USDB"],
        businessInfo: {
          legalName: fullName,
          taxId: "12-3456789",
          incorporatedOn: "2020-01-01",
        },
      };
      if (email) body.email = email;
      const { data: customer } = await apiPost("/customers", body);
      addLog("Create Customer", customer);
      const customerId = (customer as Record<string, unknown>).id as string;
      if (!balanceCustomerId.value) balanceCustomerId.value = customerId;
      const accounts = (await apiGet(
        `/customers/internal-accounts?customerId=${customerId}&currency=USDB`,
      )) as { data: Array<{ id: string }> };
      addLog("Internal Accounts", accounts);
      if (accounts.data && accounts.data.length > 0) {
        setCtxAccount(accounts.data[0].id);
        return `Customer: ${customerId}\nAccount: ${accounts.data[0].id}\nEmbedded wallet pre-created at customer-create time.`;
      }
      return `Customer: ${customerId}\nNo USDB account found yet — wallet provisioning may be in progress.`;
    },
  );

  bindClick(
    "btn-fetch-balance",
    "balance-status",
    "Fetch Balance",
    "Fetching balance...",
    async () => {
      const customerId = balanceCustomerId.value.trim();
      if (!customerId) throw new Error("Customer ID is required.");
      const data = (await apiGet(
        `/customers/internal-accounts?customerId=${encodeURIComponent(customerId)}`,
      )) as { data: Array<Record<string, unknown>> };
      addLog("Fetch Balance", data);
      return JSON.stringify(
        data.data?.map((a) => ({
          id: a.id,
          currency: a.currency,
          balance: a.balance,
        })) ?? [],
        null,
        2,
      );
    },
  );

  wirePlatformConfigFlows();
}

// ----- Platform config (OTP + branding) — GET to populate, PATCH to save -----

function wirePlatformConfigFlows(): void {
  const cfgAppName = maybeEl<HTMLInputElement>("cfg-app-name");
  const cfgOtpLength = maybeEl<HTMLInputElement>("cfg-otp-length");
  const cfgAlphanumeric = maybeEl<HTMLInputElement>("cfg-alphanumeric");
  const cfgExpirationSeconds = maybeEl<HTMLInputElement>(
    "cfg-expiration-seconds",
  );
  const cfgSendFromEmail = maybeEl<HTMLInputElement>("cfg-send-from-email");
  const cfgSendFromName = maybeEl<HTMLInputElement>("cfg-send-from-name");
  const cfgReplyToEmail = maybeEl<HTMLInputElement>("cfg-reply-to-email");
  const cfgLogoUrl = maybeEl<HTMLInputElement>("cfg-logo-url");

  function readConfigForm(): Record<string, unknown> {
    // Only include fields the user touched (non-empty) so we PATCH a real partial.
    const ewc: Record<string, unknown> = {};
    if (cfgAppName?.value.trim()) ewc.appName = cfgAppName.value.trim();
    if (cfgOtpLength?.value.trim())
      ewc.otpLength = parseInt(cfgOtpLength.value, 10);
    if (cfgAlphanumeric) ewc.alphanumeric = cfgAlphanumeric.checked;
    if (cfgExpirationSeconds?.value.trim())
      ewc.expirationSeconds = parseInt(cfgExpirationSeconds.value, 10);
    if (cfgSendFromEmail?.value.trim())
      ewc.sendFromEmailAddress = cfgSendFromEmail.value.trim();
    if (cfgSendFromName?.value.trim())
      ewc.sendFromEmailSenderName = cfgSendFromName.value.trim();
    if (cfgReplyToEmail?.value.trim())
      ewc.replyToEmailAddress = cfgReplyToEmail.value.trim();
    if (cfgLogoUrl?.value.trim()) ewc.logoUrl = cfgLogoUrl.value.trim();
    return { embeddedWalletConfig: ewc };
  }

  function applyConfigToForm(cfg: unknown): void {
    const ewc = (cfg as { embeddedWalletConfig?: Record<string, unknown> })
      ?.embeddedWalletConfig;
    if (!ewc) return;
    if (cfgAppName && typeof ewc.appName === "string")
      cfgAppName.value = ewc.appName;
    if (cfgOtpLength && typeof ewc.otpLength === "number")
      cfgOtpLength.value = String(ewc.otpLength);
    if (cfgAlphanumeric && typeof ewc.alphanumeric === "boolean")
      cfgAlphanumeric.checked = ewc.alphanumeric;
    if (cfgExpirationSeconds && typeof ewc.expirationSeconds === "number")
      cfgExpirationSeconds.value = String(ewc.expirationSeconds);
    if (cfgSendFromEmail && typeof ewc.sendFromEmailAddress === "string")
      cfgSendFromEmail.value = ewc.sendFromEmailAddress;
    if (cfgSendFromName && typeof ewc.sendFromEmailSenderName === "string")
      cfgSendFromName.value = ewc.sendFromEmailSenderName;
    if (cfgReplyToEmail && typeof ewc.replyToEmailAddress === "string")
      cfgReplyToEmail.value = ewc.replyToEmailAddress;
    if (cfgLogoUrl && typeof ewc.logoUrl === "string")
      cfgLogoUrl.value = ewc.logoUrl;
  }

  bindClick("btn-cfg-load", "cfg-status", "Load Config", "Loading…", async () => {
    const cfg = await apiGet("/config");
    addLog("GET /config", cfg);
    applyConfigToForm(cfg);
    return "Config loaded into form.";
  });

  bindClick("btn-cfg-save", "cfg-status", "Save Config", "Saving…", async () => {
    const body = readConfigForm();
    const { data } = await apiPatch("/config", body);
    addLog("PATCH /config", data);
    return "Config saved.";
  });
}
