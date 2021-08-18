import { DeboxError, getConfig } from "@deboxsoft/module-core";
import Mustache from "mustache";

export type ProgramCodeError = keyof typeof codeMessageDefault;
const codeMessageDefault = {
  PROGRAM_DUPLICATE: "program id `{{id}}` already exist.",
  PROGRAM_NOT_FOUND: "program id `{{id}} not found.`",
  PROGRAM_CREATE_FAILED: "create program id `{{id}}` failed.",
  PROGRAM_UPDATE_FAILED: "update program id `{{id}}` failed.",
  PROGRAM_REMOVE_FAILED: "remove program id `{{id}}` failed."
};

export class ProgramError extends DeboxError {
  indexes: number[];
  constructor(code: ProgramCodeError, args: Record<string, any> = {}) {
    super();
    try {
      const messages = { ...codeMessageDefault, ...(getConfig().get("app::errors") || {}) };
      this.message = Mustache.render(messages[code], { id: args.id });
      this.code = code;
      this.indexes = args.indexes;
    } catch (ignore) {}
  }
}
