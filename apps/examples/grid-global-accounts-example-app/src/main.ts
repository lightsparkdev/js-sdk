// Grid Global Accounts — Example App
//
// Tabbed lifecycle per credential type (EMAIL_OTP / OAUTH / PASSKEY) +
// shared customer / external account / quote / execute sections.
// Signed-retry flows are two-step: issue (returns 202 challenge) then retry
// (forwards with `Grid-Wallet-Signature`).
//
// Thin bootstrap: wire tabs, then each flow module. Behavior lives in the
// `flows/` tree + the `config / turnkey / webauthn / api-client / ui` modules.

import { renderChip } from "./session";
import { wireTabs } from "./ui";
import { wireCustomerFlows } from "./flows/customer";
import { wireEmailOtpFlows } from "./flows/email-otp";
import { wireOauthFlows } from "./flows/oauth";
import { wirePasskeyFlows } from "./flows/passkey";
import { wireManageFlows } from "./flows/manage";
import { wireMoneyFlows } from "./flows/money";

wireTabs();
wireCustomerFlows();
wireEmailOtpFlows();
wireOauthFlows();
wirePasskeyFlows();
wireManageFlows();
wireMoneyFlows();

// Paint the initial session chip (empty session) once the DOM + flow gates are
// wired. Flows re-render it as ids / signing keys land.
renderChip();

console.log("Grid Global Accounts example app loaded.");
