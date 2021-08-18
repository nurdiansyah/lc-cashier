import type { Logger } from "@deboxsoft/module-core";
import type { MQEmitter } from "mqemitter";

export interface LcCashierModuleOptions {
  errors: Record<string, string>;
  logger: Logger;
  event: MQEmitter;
}
