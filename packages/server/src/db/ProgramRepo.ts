import {
  Program,
  ProgramFilter,
  ProgramCreateDataInput,
  ProgramParams,
  ProgramUpdateDataInput
} from "@deboxsoft/lc-cashier-api";
import { Container, PageCursorResult } from "@deboxsoft/module-core";
import { ModifiedResult } from "@deboxsoft/module-server";

export const PROGRAM_REPO_KEY = Symbol("program-repo-key");
export const getProgramRepo = () => Container.get<ProgramRepo>(PROGRAM_REPO_KEY);
export interface ProgramRepo {
  create(input: ProgramCreateDataInput): Promise<ModifiedResult<string>>;
  update(id: string, input: ProgramUpdateDataInput): Promise<ModifiedResult<boolean>>;
  remove(id: string | string[]): Promise<ModifiedResult<boolean>>;
  findById(id: string): Promise<Program | undefined>;
  find(query?: ProgramFilter, options?: Record<string, any>): Promise<Program[]>;
  findPage(params?: ProgramParams, options?: Record<string, any>): Promise<PageCursorResult<Program>>;
}
