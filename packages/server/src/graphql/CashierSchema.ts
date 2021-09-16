import type { GraphqlSchemaModule } from "@deboxsoft/module-graphql";
import { CashierEvent } from "@deboxsoft/lc-cashier-api";
import { gql } from "@deboxsoft/module-graphql";
import { getCashierServiceServer } from "../services";

export const createCashierSchema: GraphqlSchemaModule = () => {
  const cashierService = getCashierServiceServer();
  return {
    typeDef: gql`
      type Cashier {
        id: ID!
        date: Timestamp
        student: String
        programId: String
        description: String
        debitAccount: String
        amount: Float
        userId: String
        discount: Int
        creditAccounts: [AccountAmount]
      }

      input CashierInput {
        date: Timestamp
        student: String
        programId: String
        description: String
        debitAccount: String
        amount: Float
        discount: Int
        userId: String
        creditAccounts: [AccountAmountInput]
      }

      input CashierUpdateInput {
        student: String
        programId: String
        description: String
      }

      type CashierPageResult {
        data: [Cashier]
        pageInfo: PageCursorInfo
      }

      input CashierFilter {
        date: Timestamp
      }

      input CashierParams {
        filter: CashierFilter
        pageCursor: PageCursorParams
      }

      extend type Query {
        findCashier: [Cashier]
        findCashierPage(params: CashierParams): CashierPageResult
        findCashierById(id: ID!): Cashier
      }

      extend type Mutation {
        createCashier(input: CashierInput!): String
        updateCashier(id: ID!, input: CashierUpdateInput!): Boolean
        removeCashier(id: ID!): Boolean
      }

      extend type Subscription {
        cashierCreated: Cashier
        cashierUpdated: Cashier
        cashierRemoved: ID!
      }
    `,
    resolvers: {
      Query: {
        findCashier: () => {
          return cashierService.find();
        },
        findCashierPage: (_, { params }) => {
          return cashierService.findPage(params);
        },
        findCashierById: (_, { id }) => {
          return cashierService.findById(id);
        }
      },
      Mutation: {
        createCashier: (_, { input }) => {
          return cashierService.create(input);
        },
        updateCashier: (_, { id, input }) => {
          return cashierService.update(id, input);
        },
        removeCashier: (_, { id }) => {
          return cashierService.remove(id);
        }
      },
      Subscription: {
        cashierCreated: {
          subscribe: (_, __, { pubsub }) => {
            return pubsub.subscribe(CashierEvent.created);
          }
        },
        cashierUpdated: {
          subscribe: (_, __, { pubsub }) => {
            return pubsub.subscribe(CashierEvent.updated);
          }
        },
        cashierRemoved: {
          subscribe: (_, __, { pubsub }) => {
            return pubsub.subscribe(CashierEvent.removed);
          }
        }
      }
    }
  };
};
