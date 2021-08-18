import { CollectionParams } from "@deboxsoft/module-core";
import { z } from "@deboxsoft/zod";
import { TransactionSchema, TransactionInput } from "@deboxsoft/accounting-api";

export const CashierEvent = {
  created: "cashierCreated",
  updated: "cashierUpdated",
  removed: "cashierRemoved"
};

export type CashierInput = z.infer<typeof CashierInputSchema>;

export type Cashier = CashierInput & {
  id: string;
};

export type CashierFilter = {
  date?: Date;
};
export type CashierParams = CollectionParams<CashierFilter>;
export const CashierInputSchema = z.object({
  date: z.union([z.date(), z.number()]).nullish(),
  student: z.string(),
  programId: z.string(),
  description: z.string(),
  amount: z.number(),
  debitAccount: z.string(),
  creditAccounts: TransactionSchema.shape.creditAccounts,
  userId: z.string()
});

export const transformCashierToTransactionInput = CashierInputSchema.transform(
  (input: CashierInput): TransactionInput => {
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
