import { Octokit, App } from "octokit";
import { createActionAuth } from "@octokit/auth-action";
import { ensureReleasePR } from "./ensureReleasePR.mjs";

const auth = createActionAuth();
const authentication = await auth();

const github = new Octokit({
  authStrategy: createActionAuth,
  auth: authentication,
});

const ref = process.env.GITHUB_REF;
const pr = await ensureReleasePR({ github, ref, base: "main" });
process.stdout.write(`Release PR number: ${pr.number}`);
