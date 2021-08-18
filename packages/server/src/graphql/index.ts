/* -- APPEND -- */
import { createProgramSchema } from "./Programschema";
import { createCashierSchema } from "./Cashierschema";

export const registerLcCashierSchema = () => {
  const cashierSchema = createCashierSchema();
  const programSchema = createProgramSchema();
  return {
    typedefs: `
      ${programSchema.typeDef}
      ${cashierSchema.typeDef}
    `,
    resolvers: [programSchema.resolvers, cashierSchema.resolvers]
  };
};
