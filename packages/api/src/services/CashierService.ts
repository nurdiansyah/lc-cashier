import { PageCursorResult } from "@deboxsoft/module-core";
import { Cashier, CashierFilter, CashierInput, CashierParams } from "../models";

export interface CashierService {
  create(input: CashierInput): Promise<string>;
  update(id: string, input: Partial<CashierInput>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  findById(id: string): Promise<Cashier | undefined>;
  findPage(params?: CashierParams): Promise<PageCursorResult<Cashier>>;
  find(filter?: CashierFilter): Promise<Cashier[]>;
}
