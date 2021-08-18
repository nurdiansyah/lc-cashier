import { Cashier, CashierFilter, CashierInput, CashierParams } from "@deboxsoft/lc-cashier-api";
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
import { PageCursorResult } from "@deboxsoft/module-client";

interface Options extends LcCashierClientConfig {}

const createInputDefault: Partial<CashierInput> = {};
let cashierService: CashierServiceClient;

export const createCashierService = (options: Options) => {
  if (!cashierService) {
    cashierService = new CashierServiceClient(options);
  }
  return cashierService;
};

export const getCashierService = () => cashierService;
export class CashierServiceClient implements CashierServiceClient {
  fetchGraphqlWS: SubscriptionClient;
  fetchGraphql: FetchGraphql;
  subscribers: any = {};

  constructor({ fetchGraphql, fetchGraphqlWS }: Options) {
    this.fetchGraphql = fetchGraphql;
    this.fetchGraphqlWS = fetchGraphqlWS;
  }

  create(input: CashierInput) {
    input = { ...createInputDefault, ...input };
    return this.fetchGraphql(CreateCashierMutation, { variables: { input } }).then((result) => {
      return result.createCashier;
    });
  }

  update(id: string, input: CashierInput) {
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
      (result) => result.findPageCashier || []
    );
  }

  onCashierCreated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.created) {
      this.subscribers.created = this.fetchGraphqlWS
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
      this.subscribers.updated = this.fetchGraphqlWS
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
      this.subscribers.removed = this.fetchGraphqlWS
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
