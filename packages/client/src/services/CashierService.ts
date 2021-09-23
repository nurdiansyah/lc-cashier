import {
  Cashier,
  CashierFilter,
  CashierCreateInput,
  CashierParams,
  CashierUpdateInput
} from "@deboxsoft/lc-cashier-api";
import { FetchGraphql } from "@deboxsoft/module-graphql";
import { SubscriptionClient } from "graphql-subscriptions-client";
import { LcCashierClientConfig, ObserverSubscription } from "../types";

import {
  CreateCashierMutation,
  RemoveCashierMutation,
  UpdateCashierMutation,
  FindCashierQuery,
  FindCashierPageQuery,
  FindCashierByIdQuery,
  CashierCreatedSubs,
  CashierUpdatedSubs,
  CashierRemovedSubs
} from "../graphql";
import { Container, PageCursorResult } from "@deboxsoft/module-client";

interface Options extends LcCashierClientConfig {}

const createInputDefault: Partial<CashierCreateInput> = {};

const key = Symbol("cashier-service-client");
export const createCashierService = (options: Options) => {
  if (Container.has(key)) {
    return getCashierService();
  }
  const cashierService = new CashierServiceClient(options);
  Container.set(key, cashierService);
  return cashierService;
};

export const getCashierService = () => Container.get<CashierServiceClient>(key);
export class CashierServiceClient implements CashierServiceClient {
  subscriptionClient: SubscriptionClient;
  fetchGraphql: FetchGraphql;
  subscribers: any = {};

  constructor({ fetchGraphql, createSubscriptionClient }: Options) {
    this.fetchGraphql = fetchGraphql;
    this.subscriptionClient = createSubscriptionClient();
  }

  create(input: CashierCreateInput) {
    input = { ...createInputDefault, ...input };
    return this.fetchGraphql(CreateCashierMutation, { variables: { input } }).then((result) => {
      return result.createCashier;
    });
  }

  update(id: string, input: CashierUpdateInput) {
    return this.fetchGraphql(UpdateCashierMutation, { variables: { id, input } }).then(
      (result) => result.updateCashier
    );
  }

  remove(id: string) {
    const variables = { id };
    return this.fetchGraphql(RemoveCashierMutation, { variables }).then((result) => result.removeCashier);
  }

  findById(id: string): Promise<Cashier | undefined> {
    return this.fetchGraphql(FindCashierByIdQuery, { variables: { id } }).then((result) => result.findCashierById);
  }

  find(filter?: CashierFilter): Promise<Cashier[]> {
    return this.fetchGraphql(FindCashierQuery, { variables: { filter } }).then((result) => result.findCashier || []);
  }

  findPage(params?: CashierParams): Promise<PageCursorResult<Cashier>> {
    return this.fetchGraphql(FindCashierPageQuery, { variables: { params } }).then(
      (result) => result.findCashierPage || []
    );
  }

  onCashierCreated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.created) {
      this.subscribers.created = this.subscriptionClient
        .request({
          query: CashierCreatedSubs
        })
        .subscribe({
          next: ({ data }) => next(data.cashierCreated),
          error,
          complete
        });
    }
    return () => {
      this.subscribers.created.unsubscribe();
      this.subscribers.created = undefined;
    };
  }

  onCashierUpdated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.updated) {
      this.subscribers.updated = this.subscriptionClient
        .request({
          query: CashierUpdatedSubs
        })
        .subscribe({
          next: ({ data }) => next(data.cashierUpdated),
          error,
          complete
        });
    }
    return () => {
      this.subscribers.updated.unsubscribe();
      this.subscribers.updated = undefined;
    };
  }

  onCashierRemoved({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.removed) {
      this.subscribers.removed = this.subscriptionClient
        .request({
          query: CashierRemovedSubs
        })
        .subscribe({
          next: ({ data }) => next(data.cashierRemoved),
          error,
          complete
        });
    }
    return () => {
      this.subscribers.removed.unsubscribe();
      this.subscribers.removed = undefined;
    };
  }
}
