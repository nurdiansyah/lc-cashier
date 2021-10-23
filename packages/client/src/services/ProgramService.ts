import {
  Program,
  ProgramFilter,
  ProgramCreateInput,
  ProgramUpdateInput,
  ProgramParams
} from "@deboxsoft/lc-cashier-api";
import { FetchGraphql } from "@deboxsoft/module-graphql";
import { SubscriptionClient } from "graphql-subscriptions-client";
import { LcCashierClientConfig, ObserverSubscription } from "../types";

import {
  CreateProgramMutation,
  RemoveProgramMutation,
  UpdateProgramMutation,
  FindProgramQuery,
  FindProgramPageQuery,
  FindProgramByIdQuery,
  ProgramCreatedSubs,
  ProgramUpdatedSubs,
  ProgramRemovedSubs
} from "../graphql";
import { Container, PageCursorResult } from "@deboxsoft/module-client";

interface Options extends LcCashierClientConfig {}

const createInputDefault: Partial<ProgramCreateInput> = {};
const key = Symbol("cashier-service-client");
export const createProgramService = (options: Options) => {
  if (Container.has(key)) {
    return getProgramService();
  }
  const cashierService = new ProgramServiceClient(options);
  Container.set(key, cashierService);
  return cashierService;
};

export const getProgramService = () => Container.get<ProgramServiceClient>(key);
export class ProgramServiceClient implements ProgramServiceClient {
  subscriptionClient: SubscriptionClient;
  fetchGraphql: FetchGraphql;
  subscribers: any = {};

  constructor({ fetchGraphql, createSubscriptionClient }: Options) {
    this.fetchGraphql = fetchGraphql;
    this.subscriptionClient = createSubscriptionClient();
  }

  create(input: ProgramCreateInput) {
    input = { ...createInputDefault, ...input };
    return this.fetchGraphql(CreateProgramMutation, { variables: { input } }).then((result) => {
      return result.createProgram;
    });
  }

  update(id: string, input: ProgramUpdateInput) {
    return this.fetchGraphql(UpdateProgramMutation, { variables: { id, input } }).then(
      (result) => result.updateProgram
    );
  }

  remove(id: string) {
    const variables = { id };
    return this.fetchGraphql(RemoveProgramMutation, { variables }).then((result) => result.removeProgram);
  }

  findById(id: string): Promise<Program | undefined> {
    return this.fetchGraphql(FindProgramByIdQuery, { variables: { id } }).then((result) => result.findProgramById);
  }

  find(filter?: ProgramFilter): Promise<Program[]> {
    return this.fetchGraphql(FindProgramQuery, { variables: { filter } }).then((result) => result.findProgram || []);
  }

  findPage(params?: ProgramParams): Promise<PageCursorResult<Program>> {
    return this.fetchGraphql(FindProgramPageQuery, { variables: { params } }).then(
      (result) => result.findProgramPage || []
    );
  }

  onProgramCreated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.created) {
      this.subscribers.created = this.subscriptionClient
        .request({
          query: ProgramCreatedSubs
        })
        .subscribe({
          next: ({ data }) => next(data.programCreated),
          error,
          complete
        });
    }
    return () => {
      this.subscribers.created?.unsubscribe();
      this.subscribers.created = undefined;
    };
  }

  onProgramUpdated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.updated) {
      this.subscribers.updated = this.subscriptionClient
        .request({
          query: ProgramUpdatedSubs
        })
        .subscribe({
          next: ({ data }) => next(data.programUpdated),
          error,
          complete
        });
    }
    return () => {
      this.subscribers.updated?.unsubscribe();
      this.subscribers.updated = undefined;
    };
  }

  onProgramRemoved({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.removed) {
      this.subscribers.removed = this.subscriptionClient
        .request({
          query: ProgramRemovedSubs
        })
        .subscribe({
          next: ({ data }) => next(data.programRemoved),
          error,
          complete
        });
    }
    return () => {
      this.subscribers.removed?.unsubscribe();
      this.subscribers.removed = undefined;
    };
  }
}
