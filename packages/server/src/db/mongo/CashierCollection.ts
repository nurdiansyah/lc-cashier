import { Collection, Db } from "mongodb";
import { CashierRepo, CASHIER_REPO_KEY } from "../CashierRepo";
import {
  Cashier,
  CashierError,
  CashierCreateDataInput,
  CashierUpdateDataInput,
  CashierParams
} from "@deboxsoft/lc-cashier-api";

import { Container, PageCursorResult } from "@deboxsoft/module-core";
import { BaseRepository, getMongoDb, paginationCursor, IDGeneratorNumberDate } from "@deboxsoft/module-mongo";

export const createCashierRepo = async () => {
  const db = getMongoDb();
  const cashierRepo = new CashierCollection(db);
  const lastId = await cashierRepo.getLastId();
  const idStrategy = new IDGeneratorNumberDate(lastId);
  cashierRepo.setIdGeneratorStrategy(idStrategy);
  Container.set(CASHIER_REPO_KEY, cashierRepo);
  return cashierRepo;
};

export class CashierCollection extends BaseRepository implements CashierRepo {
  collection: Collection;
  constructor(db: Db) {
    super();
    this.collection = db.collection("Cashier");
  }

  async create(input: CashierCreateDataInput) {
    try {
      const metadata = await this.collection.insertOne(this._parseDataInput(input));
      if (metadata.result.ok === 1) {
        return { metadata, data: metadata.insertedId };
      }
      throw new CashierError("CASHIER_CREATE_FAILED");
    } catch (e) {
      if (e.code === 11000) {
        throw new CashierError("CASHIER_DUPLICATE", e.keyValue._id);
      }
      throw e;
    }
  }

  async update(id, input: CashierUpdateDataInput) {
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

  find(query): Promise<Cashier[]> {
    return this.collection
      .find(query, { sort: { _id: 1 } })
      .map(this._parseDataOutput)
      .toArray();
  }

  findPage(
    params: CashierParams = { filter: {}, pageCursor: {} },
    options?: Record<string, any>
  ): Promise<PageCursorResult<Cashier>> {
    const query = params.filter;
    return paginationCursor.find(this.collection, {
      query,
      paginatedField: "date",
      sortAscending: false,
      ...params.pageCursor
    });
  }

  findById(id: string): Promise<Cashier | undefined> {
    return this.collection.findOne({ _id: id }).then(this._parseDataOutput);
  }
}
