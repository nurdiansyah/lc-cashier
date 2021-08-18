import { z } from "@deboxsoft/zod";
import { CollectionParams } from "@deboxsoft/module-core";

export const ProgramEvent = {
  created: "programCreated",
  updated: "programUpdated",
  removed: "programRemoved"
};

export type ProgramInput = z.infer<typeof ProgramInputSchema> & {};

export type Program = ProgramInput & {
  id: string;
};

export type ProgramFilter = {};

export type ProgramParams = CollectionParams<ProgramFilter>;

export const ProgramInputSchema = z.object({
  name: z.string(),
  discount: z.number(),
  price: z.number()
});
