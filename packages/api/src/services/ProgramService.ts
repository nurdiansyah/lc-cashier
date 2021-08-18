import { PageCursorResult } from "@deboxsoft/module-core";
import { Program, ProgramFilter, ProgramInput, ProgramParams } from "../models";

export interface ProgramService {
  create(input: ProgramInput): Promise<string>;
  update(id: string, input: Partial<ProgramInput>): Promise<boolean>;
  remove(id: string): Promise<boolean>;
  findById(id: string): Promise<Program | undefined>;
  findPage(params?: ProgramParams): Promise<PageCursorResult<Program>>;
  find(filter?: ProgramFilter): Promise<Program[]>;
}
