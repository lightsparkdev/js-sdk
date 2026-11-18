// A signed STAMP_LOGIN registers its `publicKey` as a session key on the
// wallet, so a sign-in refuses to sign one that names any key but this
// browser's, or carries a parameter it doesn't expect.

const STAMP_LOGIN_ACTIVITY_TYPE = "ACTIVITY_TYPE_STAMP_LOGIN";

type Json = Record<string, unknown>;

function refuse(message: string): never {
  throw new Error(`Refusing to sign: ${message}`);
}

function requireKeys(
  value: unknown,
  required: readonly string[],
  optional: readonly string[] = [],
): Json {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    refuse("the sign-in request has an unexpected shape.");
  const allowed = new Set([...required, ...optional]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key))
      refuse(`the sign-in request carries an unexpected field: ${key}.`);
  }
  for (const key of required) {
    if (!(key in value)) refuse(`the sign-in request is missing ${key}.`);
  }
  return value as Json;
}

function parseJson(payload: string): unknown {
  try {
    return JSON.parse(payload) as unknown;
  } catch {
    refuse("the sign-in request is not valid JSON.");
  }
}

export function assertStampLoginPayload(
  payload: string,
  sessionPublicKey: string,
): void {
  const activity = requireKeys(parseJson(payload), [
    "type",
    "timestampMs",
    "organizationId",
    "parameters",
  ]);
  if (activity.type !== STAMP_LOGIN_ACTIVITY_TYPE)
    refuse(`the sign-in request is not a ${STAMP_LOGIN_ACTIVITY_TYPE}.`);
  if (typeof activity.timestampMs !== "string")
    refuse("the sign-in request has an invalid timestamp.");
  if (typeof activity.organizationId !== "string" || !activity.organizationId)
    refuse("the sign-in request names no wallet.");
  const parameters = requireKeys(
    activity.parameters,
    ["publicKey", "expirationSeconds"],
    ["invalidateExisting"],
  );
  if (parameters.publicKey !== sessionPublicKey)
    refuse("the sign-in request registers a key other than this browser's.");
  if (
    typeof parameters.expirationSeconds !== "string" ||
    !/^[1-9]\d*$/.test(parameters.expirationSeconds)
  )
    refuse("the sign-in request has an invalid session lifetime.");
  if (
    "invalidateExisting" in parameters &&
    parameters.invalidateExisting !== false
  )
    refuse("the sign-in request would end the user's other sessions.");
}
