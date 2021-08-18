/* -- APPEND -- */
import { createProgramRepo } from "./ProgramCollection";
import { createCashierRepo } from "./CashierCollection";

export const registerLcCashierRepo = () => {
  /* -- APPEND-REGISTER -- */
  createProgramRepo();
  createCashierRepo();
};

/* -- APPEND-COLLECTION -- */
export { ProgramCollection, createProgramRepo } from "./ProgramCollection";
export { CashierCollection, createCashierRepo } from "./CashierCollection";
