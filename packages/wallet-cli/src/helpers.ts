import fs from "fs";

export const getPackageVersion = (): string => {
  const packageJson = JSON.parse(
    fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"),
  ) as { version: string; [key: string]: string };
  return packageJson?.version;
};
