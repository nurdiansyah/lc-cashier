import { LcCashierModuleOptions } from "../types";

/* -- APPEND -- */
import { createProgramServiceServer } from "./ProgramService";
import { createCashierServiceServer } from "./CashierService";

export const registerLcCashierModule = async (options: LcCashierModuleOptions) => {
  /* -- APPEND-REGISTER -- */
  createProgramServiceServer(options);
  createCashierServiceServer(options);
};

/* -- APPEND-EXPORT -- */
export { getProgramServiceServer, ProgramServiceServer, createProgramServiceServer } from "./ProgramService";
export { getCashierServiceServer, CashierServiceServer, createCashierServiceServer } from "./CashierService";
