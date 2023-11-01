import { z } from "zod";

export const NonUmaLnurlpResponseSchema = z.object({
  tag: z.string(),
  callback: z.string(),
  minSendable: z.number(),
  maxSendable: z.number(),
  metadata: z.string(),
});

export type NonUmaLnurlpResponse = z.infer<typeof NonUmaLnurlpResponseSchema>;
