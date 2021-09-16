import { PageCursorResult } from "@deboxsoft/module-core";
import { Program, ProgramCreateInput, ProgramFilter, ProgramParams, ProgramUpdateInput } from "../models";

export interface ProgramService {
  create(input: ProgramCreateInput): Promise<string>;
  update(id: string, input: ProgramUpdateInput): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  findById(id: string): Promise<Program | undefined>;
  findPage(params?: ProgramParams): Promise<PageCursorResult<Program>>;
  find(filter?: ProgramFilter): Promise<Program[]>;
}
