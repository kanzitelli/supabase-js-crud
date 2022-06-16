import {SupabaseClient} from '@supabase/supabase-js';

// ==========
// | SYSTEM |
// ==========
export type ValOrArr<T> = T | T[];
export type DataType<T> = Partial<T>;
type CommonValue = string | number | null | undefined;
type SpecialRecord<Type, Value> = Type extends string
  ? Partial<{
      [x: string]: CommonValue | Value;
    }>
  : Partial<{
      [Key in keyof Type]: Type[Key] | Value;
    }>;
type StringWithAutocomplete<T> = T | (string & Record<never, never>);

// ===========
// | FILTERS |
// ===========
type FilterOperator = // taken from Supabase

    | 'eq'
    | 'neq'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'ilike'
    | 'is'
    | 'in'
    | 'cs'
    | 'cd'
    | 'sl'
    | 'sr'
    | 'nxl'
    | 'nxr'
    | 'adj'
    | 'ov'
    | 'fts'
    | 'plfts'
    | 'phfts'
    | 'wfts'
    | 'not.eq'
    | 'not.neq'
    | 'not.gt'
    | 'not.gte'
    | 'not.lt'
    | 'not.lte'
    | 'not.like'
    | 'not.ilike'
    | 'not.is'
    | 'not.in'
    | 'not.cs'
    | 'not.cd'
    | 'not.sl'
    | 'not.sr'
    | 'not.nxl'
    | 'not.nxr'
    | 'not.adj'
    | 'not.ov'
    | 'not.fts'
    | 'not.plfts'
    | 'not.phfts'
    | 'not.wfts';
type FilterValue = CommonValue;
type FilterValueCondition = {
  cond: FilterOperator;
  value: FilterValue;
};
type Filters = {
  or?: ValOrArr<FilterValueCondition>;
  not?: ValOrArr<FilterValueCondition>;
  eq?: ValOrArr<FilterValue>;
  neq?: ValOrArr<FilterValue>;
  gt?: ValOrArr<number>;
  gte?: ValOrArr<number>;
  lt?: ValOrArr<number>;
  lte?: ValOrArr<number>;
  like?: ValOrArr<string>;
  ilike?: ValOrArr<string>;
  in?: FilterValue[];
  contains?: FilterValue[] | string; // string is for 'range' cases
  containedBy?: FilterValue[] | string; // string is for 'range' cases
  rangeLt?: ValOrArr<string>;
  rangeGt?: ValOrArr<string>;
  rangeLte?: ValOrArr<string>;
  rangeGte?: ValOrArr<string>;
  rangeAdjacent?: ValOrArr<string>;
  textSearch?: ValOrArr<{
    query: string;
    params: any;
  }>;
  filter?: ValOrArr<FilterValueCondition>;
};
export const filtersRegular = [
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'rangeLt',
  'rangeLte',
  'rangeGt',
  'rangeGte',
  'rangeAdjacent',
];
export const filtersDirect = ['in', 'contains', 'containedBy'];
export const filtersWithConditions = ['not', 'filter'];
export const filtersComplex = ['or', 'textSearch'];

// Data
type DataOne<T> = {
  data: DataType<T>;
};
type Data<T> = {
  data: DataType<T> | DataType<T>[];
};

// Values
export type WhereValue<T> = SpecialRecord<T, Filters>;
export type InnerWhereValue = SpecialRecord<string, Filters>;
export type AllWhereValues<T> = WhereValue<T> | InnerWhereValue;

// CRUD params
type Include = {
  include?: string | string[];
};
type Where<T> = {
  where?: WhereValue<T>;
  innerWhere?: InnerWhereValue;
};

// =============
// | MODIFIERS |
// =============
// Order
type OrderOptions = {
  ascending?: boolean; // taken from Supabase .order()
  foreignTable?: string;
};
type OrderValue<T> = {
  by: keyof T | string;
} & OrderOptions;
export type Order<T> = {
  order?: ValOrArr<OrderValue<T>>;
};

// Limit
type LimitOptions = {
  foreignTable?: string;
};
type LimitValue = {
  count: number;
} & LimitOptions;
export type Limit = {
  limit?: ValOrArr<LimitValue>;
};

// Pagination
export type Pagination = {
  take?: number;
  skip?: number;
};

// ==========
// | PARAMS |
// ==========
export type CreateParams<T> = Data<T>;
export type CreateOneParams<T> = DataOne<T>;
export type UpdateParams<T> = DataOne<T> & Where<T>;
export type UpdateOneParams<T> = DataOne<T> & Where<T>;
export type FindParams<T> = Where<T> & Include & Order<T> & Pagination & Limit;
export type FindOneParams<T> = Where<T> & Include;
export type DeleteParams<T> = Where<T>;
export type CountParams<T> = Where<T> & Include;

// ========
// | HELP |
// ========
type DBTableMethod =
  | 'create'
  | 'createOne'
  | 'find'
  | 'findOne'
  | 'update'
  | 'updateOne'
  | 'delete'
  | 'count';

export type DBTableCheckErrorOptions = {
  silent?: boolean;
  method?: StringWithAutocomplete<DBTableMethod>;
  dbName?: string;
};

export type DBTableMethodOptions = Pick<DBTableCheckErrorOptions, 'silent'> & {
  client?: SupabaseClient;
};

export type DBTableError = {
  message: string;
  error: any;
  hint: string;
};

export type DBTableActions = {
  onError?: (error: DBTableError) => void;
};

export type DBTableConstants = {
  take?: number;
};
