import { SecretInput } from "../src";

<SecretInput autoComplete="current-password" />;

// @ts-expect-error Polymorphic rendering is intentionally not supported.
<SecretInput render={<textarea />} />;

// @ts-expect-error Callers cannot override the managed input type.
<SecretInput type="text" />;
