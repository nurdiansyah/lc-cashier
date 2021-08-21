import type { PageCursorInfo } from "@deboxsoft/module-core";
import type { Cashier, CashierFilter, CashierInput, CashierParams } from "@deboxsoft/lc-cashier-api";
import type { LcCashierClientConfig, ItemDataOptions, FindOptions } from "../types";

import { createCashierService } from "../services";
import { writable, get, Readable, Writable } from "svelte/store";
import { getContext, setContext } from "svelte";

interface Options extends LcCashierClientConfig {}

export interface CashierContext {
  create(input: CashierInput): Promise<void>;
  update(id: string, input: CashierInput, options?: ItemDataOptions): Promise<void>;
  remove(id: string, options?: ItemDataOptions): Promise<void>;
  findById(id: string): Promise<Cashier | undefined>;
  find(filter?: CashierFilter): Promise<Cashier[]>;
  findPage(params?: CashierParams, options?: FindOptions): Promise<void>;
  getCashier(id: string): Cashier | undefined;
  cashierStore: Writable<Cashier[]>;
  cashierPageInfo: Readable<PageCursorInfo>;
}
const KEY = Symbol("cashier-context");
export const createCashierContext = (options: Options): CashierContext => {
  const cashierService = createCashierService(options);
  const cashierStore = writable<Cashier[]>([]);
  const cashierPageInfo = writable<PageCursorInfo>({});

  // subscription
  cashierService.onCashierCreated({
    next: (cashier) => {
      cashierStore.update((_) => {
        return [cashier, ..._];
      });
    }
  });

  cashierService.onCashierUpdated({
    next: (cashier) => {
      cashierStore.update(($cashierStore) => {
        const i = $cashierStore.findIndex((_) => _.id === cashier.id);
        if (i > -1) {
          $cashierStore[i] = { ...$cashierStore[i], ...cashier };
        }
        return $cashierStore;
      });
    }
  });

  cashierService.onCashierRemoved({
    next: (id) => {
      cashierStore.update(($cashierStore) => {
        const i = $cashierStore.findIndex((_) => _.id === id);
        if (i > -1) {
          $cashierStore.splice(i, 1);
        }
        return $cashierStore;
      });
    }
  });
  const cashierContext: CashierContext = {
    cashierStore,
    cashierPageInfo,
    create: (input: CashierInput): Promise<void> => {
      return cashierService.create(input).catch((reason) => {
        if (reason?.response?.errors[0]?.message) {
          const message = reason.response.errors[0].message;
          throw new Error(message);
        }
        console.error(reason);
      });
    },
    update: (id: string, input: CashierInput, { index }: { index?: number } = {}): Promise<void> => {
      return cashierService.update(id, input).catch((reason) => {
        if (reason?.response?.errors[0]?.message) {
          const message = reason.response.errors[0].message;
          throw new Error(message);
        }
        console.error(reason);
      });
    },
    remove: (id: string, { index }: { index?: number } = {}): Promise<void> => {
      return cashierService.remove(id).catch((reason) => {
        if (reason?.response?.errors[0]?.message) {
          const message = reason.response.errors[0].message;
          throw new Error(message);
        }
        console.error(reason);
      });
    },
    find: (filter) => cashierService.find(filter),
    findPage: (params: CashierParams, { more, backward }) =>
      cashierService.findPage(params).then((result) => {
        const data = result.data || [];
        const pageInfo = result.pageInfo;
        cashierStore.update(($cashierStore) => {
          if (more) {
            if (backward) {
              return [...data, ...$cashierStore];
            }
            return [...$cashierStore, ...data];
          }
          return data;
        });
        cashierPageInfo.set(pageInfo);
      }),
    findById: (id: string) => {
      return cashierService.findById(id);
    },
    getCashier: (id: string): Cashier | undefined => {
      const cashierArr = get(cashierStore);
      const i = cashierArr.findIndex((_) => _.id === id);
      return cashierArr[i];
    }
  };
  setContext<CashierContext>(KEY, cashierContext);
  return cashierContext;
};

export const getCashierContext = () => getContext<CashierContext>(KEY);
