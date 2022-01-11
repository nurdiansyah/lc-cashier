import { z } from "@deboxsoft/zod";
import { CollectionParams } from "@deboxsoft/module-core";

//*********************************** Event **********************************
export const ProgramEvent = {
  created: "programCreated",
  updated: "programUpdated",
  removed: "programRemoved"
};

//*********************************** Schema **********************************
export const ProgramSchema = z.object({
  id: z.string(),
  name: z.string().min(1)
});
export const ProgramCreateSchema = ProgramSchema.omit({ id: true });
export const ProgramUpdateSchema = ProgramCreateSchema;

//*********************************** Type **********************************
export type Program = z.infer<typeof ProgramSchema>;
export type ProgramCreateInput = z.infer<typeof ProgramCreateSchema>;
export type ProgramCreateDataInput = ProgramCreateInput;
export type ProgramUpdateInput = z.infer<typeof ProgramUpdateSchema>;
export type ProgramUpdateDataInput = ProgramUpdateInput;
export type ProgramFilter = { name?: string };
export type ProgramParams = CollectionParams<ProgramFilter>;
