import { DeboxError, getConfig } from "@deboxsoft/module-core";
import Mustache from "mustache";

export type CashierCodeError = keyof typeof codeMessageDefault;
const codeMessageDefault = {
  CASHIER_DUPLICATE: "cashier id `{{id}}` already exist.",
  CASHIER_NOT_FOUND: "cashier id `{{id}} not found.`",
  CASHIER_CREATE_FAILED: "create cashier id `{{id}}` failed.",
  CASHIER_UPDATE_FAILED: "update cashier id `{{id}}` failed.",
  CASHIER_REMOVE_FAILED: "remove cashier id `{{id}}` failed."
};

export class CashierError extends DeboxError {
  indexes: number[];
  constructor(code: CashierCodeError, args: Record<string, any> = {}) {
    super();
    try {
      const messages = { ...codeMessageDefault, ...(getConfig().get("app::errors") || {}) };
      this.message = Mustache.render(messages[code], { id: args.id });
      this.code = code;
      this.indexes = args.indexes;
    } catch (ignore) {}
  }
}
