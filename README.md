# ⚡️ CRUDify [Supabase](https://github.com/supabase) Tables ⚡️

This is a wrapper around [@supabase/supabase-js](https://github.com/supabase/supabase-js) that generates CRUD actions (like [Prisma](https://github.com/prisma/prisma)) to manage tables' data.

## Quickstart

1. Install libraries

```sh
yarn add @supabase/supabase-js supabase-js-crud
```

2. Create supabase client

```ts
import {createClient} from '@supabase/supabase-js';

const supabase = createClient('https://xyzcompany.supabase.co', 'public-anon-key');
```

3. CRUDify your tables

```ts
import {DBTable} from 'supabase-js-crud';

const db = {
  shop: new DBTable(supabase, 'shop'),
  product: new DBTable(supabase, 'product'),
};

const shops = await db.shop.find();
const oneProduct = await db.product.findOne({where: {id: '123456789'}});
```

## CRUD methods

- `create: (params: CreateParams<T>, options?: DBTableMethodOptions) => Promise<T[] | null>;`
- `createOne: (params: CreateOneParams<T>, options?: DBTableMethodOptions) => Promise<T | null>;`
- `find: (params?: FindParams<T>, options?: DBTableMethodOptions) => Promise<T[]>;`
- `findOne: (params?: FindOneParams<T>, options?: DBTableMethodOptions) => Promise<T | null>;`
- `update: (params: UpdateParams<T>, options?: DBTableMethodOptions) => Promise<T[] | null>;`
- `updateOne: (params: UpdateOneParams<T>, options?: DBTableMethodOptions) => Promise<T | null>;`
- `delete: (params: DeleteParams<T>, options?: DBTableMethodOptions) => Promise<T[] | null>;`
- `count: (params?: CountParams<T>, options?: DBTableMethodOptions) => Promise<number>;`

_TODO:_ add more detailed description for `params` and `options` types. For now, you can check them in types and they are mostly intuitive.

## Global methods

- `registerActions(...)` lets you register handlers for global actions such as `onError` that might be useful if you develop separate API server.

```ts
import {registerActions} from 'supabase-js-crud/dist/help';

registerActions({
  onError: error => {
    throw new InternalServerErrorException(error);
  },
});
```

- `registerConstants(...)` lets you register global constants which are used in CRUD actions such as default value for `take`. By default, it's 25.

```ts
import {registerConstants} from 'supabase-js-crud/dist/help';

registerConstants({
  take: 50,
});
```

## Models

You can also provide a model class to `DBTable` so IDEs will help with autocompletion.

```ts
type Shop = {
  id: string;
  created_at: Date;
  updated_at: Date;
  name?: string;
};

const shopTable = new DBTable<Shop>(supabase, 'shop');
const oneShop = await shopTable.findOne({where: {name: {like: '%Supa%'}}});
```

For types generation, check out [Supabase docs](https://supabase.com/docs/guides/api/generating-types).

## Examples

- Create a new shop with name `SupaShop`:

```ts
await db.shop.createOne({data: {name: 'SupaShop'}});
```

- Get active products and a related shop:

```ts
await db.product.find({
  where: {status: 'ACTIVE'},
  include: ['*', 'shop:shop_id (id, name, status)'],
});
```

- Get 20 active products with category name `Bags` ordered by `created_at` (descending):

```ts
await db.product.find({
  where: {status: 'ACTIVE'},
  include: ['*', 'shop:shop_id (id, name, status)', 'category:category_id!inner (name)'],
  innerWhere: {
    'category.name': 'Bags',
  },
  order: {by: 'created_at', ascending: false},
  take: 20,
});
```

## Enhancements

- [ ] Better docs and more examples
- [ ] Article with the library usage?

Feel free to [open an issue](https://github.com/kanzitelli/supabase-js-crud/issues) for suggestions as the library is in the beginning stages.

## Troubleshooting

If you face any issues with the library, please, [open an issue](https://github.com/kanzitelli/supabase-js-crud/issues) with the detailed explanation.

## Credits

Credits go to the amazing team behind the awesome [Supabase](https://github.com/supabase) project!

## License

This project is [MIT licensed](/LICENSE.md)
