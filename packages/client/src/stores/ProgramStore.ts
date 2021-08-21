import type { PageCursorInfo } from "@deboxsoft/module-core";
import type { Program, ProgramFilter, ProgramInput, ProgramParams } from "@deboxsoft/lc-cashier-api";
import type { LcCashierClientConfig, ItemDataOptions, FindOptions } from "../types";

import { createProgramService } from "../services";
import { writable, get, Readable, Writable } from "svelte/store";
import { getContext, setContext } from "svelte";

interface Options extends LcCashierClientConfig {}

export interface ProgramContext {
  create(input: ProgramInput): Promise<void>;
  update(id: string, input: ProgramInput, options?: ItemDataOptions): Promise<void>;
  remove(id: string, options?: ItemDataOptions): Promise<void>;
  findById(id: string): Promise<Program | undefined>;
  find(filter?: ProgramFilter): Promise<Program[]>;
  findPage(params?: ProgramParams, options?: FindOptions): Promise<void>;
  getProgram(id: string): Program | undefined;
  programStore: Writable<Program[]>;
  programPageInfo: Readable<PageCursorInfo>;
}
const KEY = Symbol("program-context");
export const createProgramContext = (options: Options): ProgramContext => {
  const programService = createProgramService(options);
  const programStore = writable<Program[]>([]);
  const programPageInfo = writable<PageCursorInfo>({});

  // subscription
  programService.onProgramCreated({
    next: (program) => {
      programStore.update((_) => {
        return [program, ..._];
      });
    }
  });

  programService.onProgramUpdated({
    next: (program) => {
      programStore.update(($programStore) => {
        const i = $programStore.findIndex((_) => _.id === program.id);
        if (i > -1) {
          $programStore[i] = { ...$programStore[i], ...program };
        }
        return $programStore;
      });
    }
  });

  programService.onProgramRemoved({
    next: (id) => {
      programStore.update(($programStore) => {
        const i = $programStore.findIndex((_) => _.id === id);
        if (i > -1) {
          $programStore.splice(i, 1);
        }
        return $programStore;
      });
    }
  });
  const programContext: ProgramContext = {
    programStore,
    programPageInfo,
    create: (input: ProgramInput): Promise<void> => {
      return programService.create(input).catch((reason) => {
        if (reason?.response?.errors[0]?.message) {
          const message = reason.response.errors[0].message;
          throw new Error(message);
        }
        console.error(reason);
      });
    },
    update: (id: string, input: ProgramInput, { index }: { index?: number } = {}): Promise<void> => {
      return programService.update(id, input).catch((reason) => {
        if (reason?.response?.errors[0]?.message) {
          const message = reason.response.errors[0].message;
          throw new Error(message);
        }
        console.error(reason);
      });
    },
    remove: (id: string, { index }: { index?: number } = {}): Promise<void> => {
      return programService.remove(id).catch((reason) => {
        if (reason?.response?.errors[0]?.message) {
          const message = reason.response.errors[0].message;
          throw new Error(message);
        }
        console.error(reason);
      });
    },
    find: (filter) => programService.find(filter),
    findPage: (params: ProgramParams, { more, backward }) =>
      programService.findPage(params).then((result) => {
        const data = result.data || [];
        const pageInfo = result.pageInfo;
        programStore.update(($programStore) => {
          if (more) {
            if (backward) {
              return [...data, ...$programStore];
            }
            return [...$programStore, ...data];
          }
          return data;
        });
        programPageInfo.set(pageInfo);
      }),
    findById: (id: string) => {
      return programService.findById(id);
    },
    getProgram: (id: string): Program | undefined => {
      const programArr = get(programStore);
      const i = programArr.findIndex((_) => _.id === id);
      return programArr[i];
    }
  };
  setContext<ProgramContext>(KEY, programContext);
  return programContext;
};

export const getProgramContext = () => getContext<ProgramContext>(KEY);
