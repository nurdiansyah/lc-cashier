/* -- APPEND -- */
import { createProgramRepo } from "./ProgramCollection";
import { createCashierRepo } from "./CashierCollection";

export const registerLcCashierRepo = async () => {
  /* -- APPEND-REGISTER -- */
  await createProgramRepo();
  await createCashierRepo();
};

/* -- APPEND-COLLECTION -- */
export { ProgramCollection, createProgramRepo } from "./ProgramCollection";
export { CashierCollection, createCashierRepo } from "./CashierCollection";
