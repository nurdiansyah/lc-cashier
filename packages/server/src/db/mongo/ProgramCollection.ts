import { Collection, Db } from "mongodb";
import { ProgramRepo } from "../ProgramRepo";
import { PROGRAM_REPO_KEY } from "../ProgramRepo";
import { Program, ProgramError, ProgramInput, ProgramParams } from "@deboxsoft/lc-cashier-api";

import { Container, PageCursorResult } from "@deboxsoft/module-core";
import { BaseRepository, getMongoDb, paginationCursor } from "@deboxsoft/module-mongo";

export const createProgramRepo = () => {
  const db = getMongoDb();
  const programRepo = new ProgramCollection(db);
  Container.set(PROGRAM_REPO_KEY, programRepo);
  return programRepo;
};

export class ProgramCollection extends BaseRepository implements ProgramRepo {
  collection: Collection;
  constructor(db: Db) {
    super();
    this.collection = db.collection("Program");
  }

  async create(input: ProgramInput) {
    try {
      const metadata = await this.collection.insertOne(this._parseDataInput(input));
      if (metadata.result.ok === 1) {
        return { metadata, data: metadata.insertedId };
      }
      throw new ProgramError("PROGRAM_CREATE_FAILED");
    } catch (e) {
      if (e.code === 11000) {
        throw new ProgramError("PROGRAM_DUPLICATE", e.keyValue._id);
      }
      throw e;
    }
  }

  async update(id, input: ProgramInput) {
    const metadata = await this.collection.updateOne({ _id: id }, { $set: input });
    return { metadata, data: metadata.result.ok === 1 };
  }

  async remove(id: string | string[]) {
    try {
      if (Array.isArray(id)) {
        const metadata = await this.collection.deleteMany({ _id: { $in: id } });
        return { metadata, data: metadata.result.ok === 1 };
      }
      const metadata = await this.collection.deleteOne({ _id: id });
      return { metadata, data: metadata.result.ok === 1 };
    } catch (e) {
      throw e;
    }
  }

  find(query): Promise<Program[]> {
    return this.collection
      .find(query, { sort: { _id: 1 } })
      .map(this._parseDataOutput)
      .toArray();
  }

  findPage(
    params: ProgramParams = { filter: {}, pageCursor: {} },
    options?: Record<string, any>
  ): Promise<PageCursorResult<Program>> {
    const query = params.filter;
    return paginationCursor.find(this.collection, {
      query,
      paginatedField: "date",
      sortAscending: false,
      ...params.pageCursor
    });
  }

  findById(id: string): Promise<Program | undefined> {
    return this.collection.findOne({ _id: id }).then(this._parseDataOutput);
  }
}
