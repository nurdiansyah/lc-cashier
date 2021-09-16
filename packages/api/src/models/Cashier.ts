import { CollectionParams } from "@deboxsoft/module-core";
import { z } from "@deboxsoft/zod";
import { TransactionSchema, TransactionInput } from "@deboxsoft/accounting-api";

//*********************************** Event **********************************
export const CashierEvent = {
  created: "cashierCreated",
  updated: "cashierUpdated",
  removed: "cashierRemoved"
};

//*********************************** Schema **********************************
export const CashierSchema = z.object({
  id: z.string(),
  date: z.union([z.date(), z.number()]).nullish(),
  student: z.string().min(1),
  programId: z.string().nullish(),
  description: z.string().nullish(),
  amount: z.number(),
  debitAccount: z.string(),
  creditAccounts: TransactionSchema.shape.creditAccounts
});
export const CashierCreateSchema = CashierSchema.omit({ id: true }).extend({
  userId: z.string()
});
export const CashierCreateDataSchema = CashierCreateSchema.omit({
  creditAccounts: true,
  debitAccount: true,
  userId: true
});
export const CashierUpdateSchema = CashierCreateSchema.pick({
  student: true,
  programId: true,
  description: true
});
export const CashierUpdateDataSchema = CashierCreateDataSchema.partial();

//*********************************** Type **********************************
export type Cashier = z.infer<typeof CashierSchema>;
export type CashierCreateInput = z.infer<typeof CashierCreateSchema>;
export type CashierCreateDataInput = z.infer<typeof CashierCreateDataSchema>;
export type CashierUpdateInput = z.infer<typeof CashierUpdateSchema>;
export type CashierUpdateDataInput = z.infer<typeof CashierUpdateDataSchema>;
export type CashierFilter = {
  date?: Date;
  userId?: string;
};
export type CashierParams = CollectionParams<CashierFilter>;

export const transformCashierToDataInput = CashierCreateSchema.transform((_): CashierCreateDataInput => {
  const date = _.date || new Date();
  return {
    date,
    description: _.description,
    student: _.student,
    amount: _.amount,
    programId: _.programId
  };
});

export const transformCashierToTransactionInput = CashierCreateSchema.transform(
  (input: CashierCreateInput): TransactionInput => {
    const date = input.date || new Date();
    const amount = input.amount;
    return {
      date: date,
      dateTransaction: date,
      type: "CASHIER",
      accountId: input.debitAccount,
      amount,
      userId: input.userId,
      creditAccounts: input.creditAccounts
    };
  }
);
