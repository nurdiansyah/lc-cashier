import {
  Cashier,
  CashierFilter,
  CashierCreateDataInput,
  CashierUpdateDataInput,
  CashierParams
} from "@deboxsoft/lc-cashier-api";
import { Container, PageCursorResult } from "@deboxsoft/module-core";
import { ModifiedResult } from "@deboxsoft/module-server";

export const CASHIER_REPO_KEY = Symbol("cashier-repo-key");
export const getCashierRepo = () => Container.get<CashierRepo>(CASHIER_REPO_KEY);
export interface CashierRepo {
  create(input: CashierCreateDataInput): Promise<ModifiedResult<string>>;
  update(id: string, input: CashierUpdateDataInput): Promise<ModifiedResult<boolean>>;
  remove(id: string | string[]): Promise<ModifiedResult<boolean>>;
  findById(id: string): Promise<Cashier | undefined>;
  find(query?: CashierFilter, options?: Record<string, any>): Promise<Cashier[]>;
  findPage(params?: CashierParams, options?: Record<string, any>): Promise<PageCursorResult<Cashier>>;
}
