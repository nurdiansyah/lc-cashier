import { Program, ProgramFilter, ProgramInput, ProgramParams } from "@deboxsoft/lc-cashier-api";
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
import { PageCursorResult } from "@deboxsoft/module-client";

interface Options extends LcCashierClientConfig {}

const createInputDefault: Partial<ProgramInput> = {};
let programService: ProgramServiceClient;

export const createProgramService = (options: Options) => {
  if (!programService) {
    programService = new ProgramServiceClient(options);
  }
  return programService;
};

export const getProgramService = () => programService;
export class ProgramServiceClient implements ProgramServiceClient {
  fetchGraphqlWS: SubscriptionClient;
  fetchGraphql: FetchGraphql;
  subscribers: any = {};

  constructor({ fetchGraphql, fetchGraphqlWS }: Options) {
    this.fetchGraphql = fetchGraphql;
    this.fetchGraphqlWS = fetchGraphqlWS;
  }

  create(input: ProgramInput) {
    input = { ...createInputDefault, ...input };
    return this.fetchGraphql(CreateProgramMutation, { variables: { input } }).then((result) => {
      return result.createProgram;
    });
  }

  update(id: string, input: ProgramInput) {
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
      (result) => result.findPageProgram || []
    );
  }

  onProgramCreated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.created) {
      this.subscribers.created = this.fetchGraphqlWS
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
      this.subscribers.created.unsubscribe();
      this.subscribers.created = undefined;
    };
  }

  onProgramUpdated({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.updated) {
      this.subscribers.updated = this.fetchGraphqlWS
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
      this.subscribers.updated.unsubscribe();
      this.subscribers.updated = undefined;
    };
  }

  onProgramRemoved({ next, complete, error }: ObserverSubscription) {
    if (!this.subscribers.removed) {
      this.subscribers.removed = this.fetchGraphqlWS
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
      this.subscribers.removed.unsubscribe();
      this.subscribers.removed = undefined;
    };
  }
}
