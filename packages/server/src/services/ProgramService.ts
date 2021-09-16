import { MQEmitter } from "mqemitter";
import { LcCashierModuleOptions } from "../types";
import {
  ProgramError,
  ProgramEvent,
  ProgramCreateInput,
  ProgramUpdateInput,
  ProgramParams,
  ProgramService,
  Program,
  ProgramFilter,
  ProgramCreateSchema,
  ProgramUpdateSchema
} from "@deboxsoft/lc-cashier-api";
import { Container, Logger } from "@deboxsoft/module-core";
import { getProgramRepo, ProgramRepo } from "../db";

interface Options extends LcCashierModuleOptions {}

const KEY = Symbol("program-service-server");
export const getProgramServiceServer = () => Container.get<ProgramServiceServer>(KEY);
export const createProgramServiceServer = (options: Options) => {
  const programRepo = getProgramRepo();
  const programService = new ProgramServiceServer(programRepo, options);
  Container.set(KEY, programService);
  return programService;
};

export class ProgramServiceServer implements ProgramService {
  event: MQEmitter;
  logger: Logger;
  constructor(private programRepo: ProgramRepo, options: Options) {
    this.logger = options.logger;
    this.event = options.event;
  }

  async create(input: ProgramCreateInput) {
    try {
      input = ProgramCreateSchema.parse(input);
      const { data } = await this.programRepo.create(input);
      return this.findById(data).then((program) => {
        if (program) {
          this.event.emit({ topic: ProgramEvent.created, data: program });
          return data;
        } else {
          throw new ProgramError("PROGRAM_CREATE_FAILED");
        }
      });
    } catch (e) {
      this.logger.error("[ProgramServiceServer] %o", e);
      throw e;
    }
  }

  async update(id: string, input: ProgramUpdateInput) {
    try {
      input = ProgramUpdateSchema.parse(input);
      const { data } = await this.programRepo.update(id, input);
      return this.findById(id, { detail: false }).then((program) => {
        if (program) {
          this.event.emit({ topic: ProgramEvent.updated, data: program });
          return data;
        } else {
          throw new ProgramError("PROGRAM_UPDATE_FAILED", { id });
        }
      });
    } catch (e) {
      this.logger.error("[ProgramServiceServer] %o", e);
      throw e;
    }
  }

  async remove(id: string) {
    try {
      const { data } = await this.programRepo.remove(id);
      data && this.event.emit({ topic: ProgramEvent.removed, data: id });
      return data;
    } catch (e) {
      this.logger.error("[ProgramServiceServer] %o", e);
      throw new ProgramError("PROGRAM_REMOVE_FAILED", { id });
    }
  }

  findById(id: string, { detail = true }: { detail?: boolean } = {}): Promise<Program> {
    return this.programRepo.findById(id);
  }

  findPage(params: ProgramParams = { pageCursor: {}, filter: {} }) {
    return this.programRepo.findPage(params);
  }

  find(filter?: ProgramFilter) {
    return this.programRepo.find(filter);
  }
}
