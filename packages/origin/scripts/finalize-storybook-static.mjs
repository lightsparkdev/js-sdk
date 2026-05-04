import fs from "node:fs/promises";
import path from "node:path";

const staticDir = path.resolve("storybook-static");
// PR previews override this to /app/origin-storybook-pr-<number>/.
const basePath = normalizeBasePath(
  process.env.ORIGIN_STORYBOOK_BASE_PATH ?? "/app/origin-storybook/",
);

// Storybook static builds currently emit inline bootstrap scripts, which fail
// under our CSP. Track upstream support at:
// https://github.com/storybookjs/storybook/issues/24381
const inlineScriptPattern =
  /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g;

async function main() {
  await finalizeHtml("index.html", "storybook-manager-inline");
  await finalizeHtml("iframe.html", "storybook-preview-inline");

  console.log(`Finalized Storybook static output for ${basePath}`);
}

function normalizeBasePath(value) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash
    : `${withLeadingSlash}/`;
}

async function finalizeHtml(fileName, scriptPrefix) {
  const htmlPath = path.join(staticDir, fileName);
  let html = await fs.readFile(htmlPath, "utf8");
  const extractedScripts = [];

  html = html.replace(inlineScriptPattern, (_match, attributes, content) => {
    const outputFileName = `${scriptPrefix}-${extractedScripts.length + 1}.js`;
    extractedScripts.push({
      fileName: outputFileName,
      content: trimScriptContent(content),
    });

    return `<script${attributes} src="${basePath}${outputFileName}"></script>`;
  });

  html = ensureBaseHref(html, fileName);

  await Promise.all(
    extractedScripts.map(({ fileName: scriptFileName, content }) =>
      fs.writeFile(path.join(staticDir, scriptFileName), content, "utf8"),
    ),
  );
  await fs.writeFile(htmlPath, html, "utf8");
}

function trimScriptContent(content) {
  return `${content.replace(/^\n/, "").replace(/\n\s*$/, "")}\n`;
}

function ensureBaseHref(html, fileName) {
  if (/<base\b[^>]*>/i.test(html)) {
    // Storybook's iframe output currently includes target="_parent"; preserve
    // existing non-href base attributes while adding the deployment href.
    return html.replace(/<base\b[^>]*>/i, withBaseHref);
  }

  const baseTag = `<base href="${basePath}" />`;
  const htmlWithBase = html.replace(
    /(<meta\s+name=["']viewport["'][^>]*>\s*)/i,
    `$1\n    ${baseTag}\n`,
  );
  if (htmlWithBase === html) {
    throw new Error(`Unable to insert base tag in ${fileName}`);
  }

  return htmlWithBase;
}

function withBaseHref(baseTag) {
  const attributes = baseTag
    .replace(/\s+href=(["']).*?\1/i, "")
    .replace(/\s*\/?>$/i, "")
    .replace(/^<base\b/i, "");
  return `<base href="${basePath}"${attributes} />`;
}

await main();
