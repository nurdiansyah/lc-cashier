import { PageCursorResult } from "@deboxsoft/module-core";
import { Cashier, CashierFilter, CashierCreateInput, CashierParams, CashierUpdateInput } from "../models";

export interface CashierService {
  create(input: CashierCreateInput): Promise<string>;
  update(id: string, input: CashierUpdateInput): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  findById(id: string): Promise<Cashier | undefined>;
  findPage(params?: CashierParams): Promise<PageCursorResult<Cashier>>;
  find(filter?: CashierFilter): Promise<Cashier[]>;
}
