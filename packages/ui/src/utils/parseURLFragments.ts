export function parseURLFragments(url: string) {
  const hash = url.slice(1);
  const pairs = hash.split("&"); // Split by '&' to get each key-value pair

  if (!hash || !pairs.length) {
    return null;
  }

  const params = {} as Record<string, string>;

  pairs.forEach((pair) => {
    const [key, value] = pair.split("="); // Split each pair by '=' to separate keys and values
    params[key] = decodeURIComponent(value || ""); // Decode and assign to the params object
  });

  return params;
}
