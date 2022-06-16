import {SupabaseClient} from '@supabase/supabase-js';
import {SupabaseQueryBuilder} from '@supabase/supabase-js/dist/module/lib/SupabaseQueryBuilder';

import {addLimit, addOrder, addPagination, addWhere, checkError, joinIncludes} from './help';
import {
  DBTableMethodOptions,
  CountParams,
  CreateOneParams,
  CreateParams,
  DeleteParams,
  FindOneParams,
  FindParams,
  UpdateOneParams,
  UpdateParams,
} from './types';

export class DBTable<T> {
  private dbName: string;
  private sbClient: SupabaseClient;

  constructor(sbClient: SupabaseClient, dbName: string) {
    this.sbClient = sbClient;
    this.dbName = dbName;
  }

  // crucial to have it as function, otherwise it was holding a pointer
  // to the old instance and was not returning empty data
  protected db = (client?: SupabaseClient): SupabaseQueryBuilder<T> =>
    (client ?? this.sbClient).from(this.dbName);

  // ================
  // | CRUD methods |
  // ================
  // [C] - Create
  create = async (params: CreateParams<T>, options?: DBTableMethodOptions) => {
    const {data: pData} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    const {data, error} = await db.insert(pData);
    checkError(error, {method: 'create', dbName: this.dbName, ...options});

    return data;
  };

  createOne = async (params: CreateOneParams<T>, options?: DBTableMethodOptions) => {
    const {data: pData} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    const {data, error} = await db.insert(pData).maybeSingle();
    checkError(error, {
      method: 'createOne',
      dbName: this.dbName,
      ...options,
    });

    return data;
  };

  // [R] - Read
  find = async (params: FindParams<T> = {}, options?: DBTableMethodOptions) => {
    const {where, innerWhere, include, order, take, skip, limit} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    const select = joinIncludes(include ?? '*');
    let q = db.select(select);
    q = addWhere(q, [where, innerWhere]);
    q = addOrder(q, {order});
    q = addPagination(q, {take, skip});
    q = addLimit(q, {limit});

    const {data, error} = await q;
    checkError(error, {method: 'find', dbName: this.dbName, ...options});

    return data ?? [];
  };

  findOne = async (params: FindOneParams<T> = {}, options?: DBTableMethodOptions) => {
    const {where, innerWhere, include} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    const select = joinIncludes(include ?? '*');
    let q = db.select(select);
    q = addWhere(q, [where, innerWhere]);

    const {data, error} = await q.maybeSingle();
    checkError(error, {
      method: 'findOne',
      dbName: this.dbName,
      ...options,
    });

    return data;
  };

  // [U] - Update
  update = async (params: UpdateParams<T>, options?: DBTableMethodOptions) => {
    const {where, data: pData} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    let q = db.update(pData);
    q = addWhere(q, where);

    const {data, error} = await q;
    checkError(error, {method: 'update', dbName: this.dbName, ...options});

    return data;
  };

  updateOne = async (params: UpdateOneParams<T>, options?: DBTableMethodOptions) => {
    const {where, data: pData} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    let q = db.update(pData);
    q = addWhere(q, where);

    const {data, error} = await q.maybeSingle();
    checkError(error, {
      method: 'updateOne',
      dbName: this.dbName,
      ...options,
    });

    return data;
  };

  // [D] - Delete
  delete = async (params: DeleteParams<T>, options?: DBTableMethodOptions) => {
    const {where} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    let q = db.delete();
    q = addWhere(q, where);

    const {data, error} = await q;
    checkError(error, {method: 'delete', dbName: this.dbName, ...options});

    return data;
  };

  // Other useful methods
  count = async (params: CountParams<T> = {}, options?: DBTableMethodOptions) => {
    const {where, innerWhere, include} = params;
    const {client} = options ?? {};
    const db = this.db(client);

    const select = joinIncludes(include ?? '*');
    let q = db.select(select, {count: 'exact'});
    q = addWhere(q, [where, innerWhere]);

    const {error, count} = await q;
    checkError(error, {method: 'count', dbName: this.dbName, ...options});

    return count ?? 0;
  };
}
