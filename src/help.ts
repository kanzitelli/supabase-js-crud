import {PostgrestFilterBuilder} from '@supabase/postgrest-js';
import {PostgrestError} from '@supabase/supabase-js';
import {
  filtersWithConditions,
  filtersDirect,
  filtersRegular,
  Limit,
  Order,
  Pagination,
  filtersComplex,
  ValOrArr,
  DBTableCheckErrorOptions,
  DBTableError,
  DBTableActions,
  AllWhereValues,
  DBTableConstants,
} from './types';

// System
let _actions: DBTableActions = {};
export const registerActions = (actions: DBTableActions) => {
  _actions = {
    ..._actions,
    ...actions,
  };
};

const DEFAULT_TAKE = 50;
let _constants: DBTableConstants = {
  take: DEFAULT_TAKE,
};
export const registerConstants = (constants: DBTableConstants) => {
  _constants = {
    ..._constants,
    ...constants,
  };
};

// Main
export const addWhere = <T>(
  pfb: PostgrestFilterBuilder<T>,
  data: ValOrArr<AllWhereValues<T> | undefined>,
) => {
  if (!data) return pfb;

  // -- merging where values in one object if array
  let where_all: AllWhereValues<T> = {};
  if (Array.isArray(data))
    for (const w of data)
      where_all = {
        ...where_all,
        ...w,
      };
  else where_all = data;

  /**
   * example of where_all = {
   *   id: 'some-value',
   *   status: {
   *      in: ['ACTIVE', 'IN_REVIEW'],
   *   },
   *   'shop.website_url': {
   *      neq: ['', null, undefined],
   *   }
   * }
   */

  // -- taking care of possible cases
  for (const key of Object.keys(where_all)) {
    const where_key = key as keyof T;
    const where_value = (where_all as any)[key]; // "as any" for ts

    if (typeof where_value === 'object') {
      for (const wKey of Object.keys(where_value)) {
        const wValue = where_value[wKey];

        if (filtersRegular.includes(wKey)) {
          if (Array.isArray(wValue))
            for (const wV of wValue) pfb = (pfb as any)[wKey](where_key, wV); // "as any" for ts
          else pfb = (pfb as any)[wKey](where_key, wValue);
        }

        if (filtersDirect.includes(wKey)) {
          pfb = (pfb as any)[wKey](where_key, wValue);
        }

        if (filtersWithConditions.includes(wKey)) {
          if (Array.isArray(wValue))
            for (const wV of wValue) pfb = (pfb as any)[wKey](where_key, wV.cond, wV.value);
          else pfb = (pfb as any)[wKey](where_key, wValue.cond, wValue.value);
        }

        if (filtersComplex.includes(wKey)) {
          if (wKey === 'or') {
            let orStr = '';
            if (Array.isArray(wValue))
              orStr = wValue.map(wV => `${String(where_key)}.${wV.cond}.${wV.value}`).join(',');
            else orStr = `${String(where_key)}.${wValue.cond}.${wValue.value}`;

            pfb = pfb.or(orStr);
          }

          if (wKey === 'textSearch') {
            if (Array.isArray(wValue))
              for (const wV of wValue) pfb = (pfb as any)[wKey](where_key, wV.query, wV.params);
            else pfb = (pfb as any)[wKey](where_key, wValue.query, wValue.params);
          }
        }
      }
    } else {
      pfb = pfb.eq(where_key, where_value);
    }
  }

  return pfb;
};

export const addOrder = <T>(pfb: PostgrestFilterBuilder<T>, data: Order<T>) => {
  if (!data || !data.order) return pfb;

  const {order} = data;

  if (Array.isArray(order)) {
    for (const o of order) {
      pfb = pfb.order(o.by as keyof T, o);
    }
  } else {
    pfb = pfb.order(order.by as keyof T, order);
  }

  return pfb;
};

export const addLimit = <T>(pfb: PostgrestFilterBuilder<T>, data: Limit) => {
  if (!data || !data.limit) return pfb;

  const {limit} = data;

  if (Array.isArray(limit)) {
    for (const l of limit) {
      pfb = pfb.limit(l.count, l);
    }
  } else {
    pfb = pfb.limit(limit.count, limit);
  }

  return pfb;
};

export const addPagination = <T>(pfb: PostgrestFilterBuilder<T>, data: Pagination) => {
  const {take = _constants.take ?? DEFAULT_TAKE, skip = 0} = data;

  return pfb.range(skip, skip + take - 1);
};

// DB Error
export const checkError = (error: PostgrestError | null, options: DBTableCheckErrorOptions) => {
  if (error) {
    const {silent = false, dbName, method} = options;

    const errorObj: DBTableError = {
      message: 'DB Error',
      error: error,
      hint: `${dbName}.${method}`,
    };

    if (silent) console.error('silent error:', errorObj);
    else if (_actions.onError) _actions.onError(errorObj);
    else throw errorObj;
  }
};

// Help
export const joinIncludes = (strs: string | string[]) =>
  typeof strs === 'string' ? strs : strs.join(',');
