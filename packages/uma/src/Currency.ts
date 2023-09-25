import { z } from "zod";

export const CurrencySchema = z.object({
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  multiplier: z.number(), // millisatoshi per unit
  minSendable: z.number(),
  maxSendable: z.number(),
});

export type Currency = z.infer<typeof CurrencySchema>;
