import { MQEmitter } from "mqemitter";
import { LcCashierModuleOptions } from "../types";
import {
  CashierError,
  CashierEvent,
  CashierInput,
  CashierParams,
  CashierService,
  Cashier,
  CashierFilter,
  CashierInputSchema
} from "@deboxsoft/lc-cashier-api";
import { Container, Logger } from "@deboxsoft/module-core";
import { getCashierRepo, CashierRepo } from "../db";

interface Options extends LcCashierModuleOptions {}

const KEY = Symbol("cashier-service-server");
export const getCashierServiceServer = () => Container.get<CashierServiceServer>(KEY);
export const createCashierServiceServer = (options: Options) => {
  const cashierRepo = getCashierRepo();
  const cashierService = new CashierServiceServer(cashierRepo, options);
  Container.set(KEY, cashierService);
  return cashierService;
};

export class CashierServiceServer implements CashierService {
  event: MQEmitter;
  logger: Logger;
  constructor(private cashierRepo: CashierRepo, options: Options) {
    this.logger = options.logger;
    this.event = options.event;
  }

  async create(input: CashierInput) {
    try {
      input = CashierInputSchema.parse(input);
      const { data } = await this.cashierRepo.create(input);
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
      throw e;
    }
  }

  async update(id: string, input: Partial<CashierInput>) {
    try {
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
