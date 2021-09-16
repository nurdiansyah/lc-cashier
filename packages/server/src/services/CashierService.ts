import { MQEmitter } from "mqemitter";
import { LcCashierModuleOptions } from "../types";
import {
  CashierError,
  CashierEvent,
  CashierParams,
  CashierService,
  Cashier,
  CashierFilter,
  CashierUpdateSchema,
  CashierUpdateInput,
  CashierCreateInput,
  transformCashierToTransactionInput,
  transformCashierToDataInput
} from "@deboxsoft/lc-cashier-api";
import { Container, Logger } from "@deboxsoft/module-core";
import { getCashierRepo, CashierRepo } from "../db";
import { getTransactionServiceServer, TransactionServiceServer } from "@deboxsoft/accounting-server";

interface Options extends LcCashierModuleOptions {}

const KEY = Symbol("cashier-service-server");
export const getCashierServiceServer = () => Container.get<CashierServiceServer>(KEY);
export const createCashierServiceServer = (options: Options) => {
  const cashierRepo = getCashierRepo();
  const transactionService = getTransactionServiceServer();
  const cashierService = new CashierServiceServer(cashierRepo, transactionService, options);
  Container.set(KEY, cashierService);
  return cashierService;
};

export class CashierServiceServer implements CashierService {
  event: MQEmitter;
  logger: Logger;
  constructor(
    private cashierRepo: CashierRepo,
    private transactionService: TransactionServiceServer,
    options: Options
  ) {
    this.logger = options.logger;
    this.event = options.event;
  }

  async create(input: CashierCreateInput) {
    try {
      this.transactionService.startTransaction();
      const transactionId = await this.transactionService.getId();
      const transactionInput = transformCashierToTransactionInput.parse({
        ...input,
        transactionId
      });
      const dataInput = transformCashierToDataInput.parse({
        ...input,
        transactionId
      });
      const { data } = await this.cashierRepo.create(dataInput);
      await this.transactionService.create(transactionInput);
      await this.transactionService.commitTransaction();
      return this.findById(data).then((cashier) => {
        if (cashier) {
          this.event.emit({ topic: CashierEvent.created, data: cashier });
          return data;
        } else {
          throw new CashierError("CASHIER_CREATE_FAILED");
        }
      });
    } catch (e) {
      this.logger.error("[CashierServiceServer] %o", e);
      this.transactionService.rollbackTransaction();
      throw e;
    } finally {
      this.transactionService.endTransaction();
    }
  }

  async update(id: string, input: CashierUpdateInput) {
    try {
      input = CashierUpdateSchema.parse(input);
      const { data } = await this.cashierRepo.update(id, input);
      return this.findById(id, { detail: false }).then((cashier) => {
        if (cashier) {
          this.event.emit({ topic: CashierEvent.updated, data: cashier });
          return data;
        } else {
          throw new CashierError("CASHIER_UPDATE_FAILED", { id });
        }
      });
    } catch (e) {
      this.logger.error("[CashierServiceServer] %o", e);
      throw e;
    }
  }

  async remove(id: string) {
    try {
      const { data } = await this.cashierRepo.remove(id);
      data && this.event.emit({ topic: CashierEvent.removed, data: id });
      return data;
    } catch (e) {
      this.logger.error("[CashierServiceServer] %o", e);
      throw new CashierError("CASHIER_REMOVE_FAILED", { id });
    }
  }

  findById(id: string, { detail = true }: { detail?: boolean } = {}): Promise<Cashier> {
    return this.cashierRepo.findById(id);
  }

  findPage(params: CashierParams = { pageCursor: {}, filter: {} }) {
    return this.cashierRepo.findPage(params);
  }

  find(filter?: CashierFilter) {
    return this.cashierRepo.find(filter);
  }
}
