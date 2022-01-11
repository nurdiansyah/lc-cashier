import { GraphqlSchemaModule } from "@deboxsoft/module-graphql";
import { ProgramEvent } from "@deboxsoft/lc-cashier-api";
import { gql } from "@deboxsoft/module-graphql";
import { getProgramServiceServer } from "../services";

export const createProgramSchema: GraphqlSchemaModule = () => {
  const programService = getProgramServiceServer();
  return {
    typeDef: gql`
      type Program {
        id: ID!
        name: String
      }

      input ProgramInput {
        name: String
      }

      type ProgramPageResult {
        data: [Program]
        pageInfo: PageCursorInfo
      }

      input ProgramFilter {
        name: String
      }

      input ProgramParams {
        filter: ProgramFilter
        pageCursor: PageCursorParams
      }

      extend type Query {
        findProgram: [Program]
        findProgramPage(params: ProgramParams): ProgramPageResult
        findProgramById(id: ID!): Program
      }

      extend type Mutation {
        createProgram(input: ProgramInput!): String
        updateProgram(id: ID!, input: ProgramInput!): Boolean
        removeProgram(id: ID!): Boolean
      }

      extend type Subscription {
        programCreated: Program
        programUpdated: Program
        programRemoved: ID!
      }
    `,
    resolvers: {
      Query: {
        findProgram: () => {
          return programService.find();
        },
        findProgramPage: (_, { params }) => {
          return programService.findPage(params);
        },
        findProgramById: (_, { id }) => {
          return programService.findById(id);
        }
      },
      Mutation: {
        createProgram: (_, { input }) => {
          return programService.create(input);
        },
        updateProgram: (_, { id, input }) => {
          return programService.update(id, input);
        },
        removeProgram: (_, { id }) => {
          return programService.remove(id);
        }
      },
      Subscription: {
        programCreated: {
          subscribe: (_, __, { pubsub }) => {
            return pubsub.subscribe(ProgramEvent.created);
          }
        },
        programUpdated: {
          subscribe: (_, __, { pubsub }) => {
            return pubsub.subscribe(ProgramEvent.updated);
          }
        },
        programRemoved: {
          subscribe: (_, __, { pubsub }) => {
            return pubsub.subscribe(ProgramEvent.removed);
          }
        }
      }
    }
  };
};
