export interface ColumnBuilder<T = any> {
  name: string;
  dataType: string;
  options?: Record<string, any>;
  isPrimaryKey?: boolean;
  isNotNull?: boolean;
  defaultValue?: any;
  defaultRandom(): ColumnBuilder<T>;
  primaryKey(): ColumnBuilder<T>;
  notNull(): ColumnBuilder<T>;
  default(val: any): ColumnBuilder<T>;
  defaultNow(): ColumnBuilder<T>;
  references(refFn: () => any, opts?: Record<string, any>): ColumnBuilder<T>;
  $type<U>(): ColumnBuilder<U>;
  unique(): ColumnBuilder<T>;
}

function createColumn<T = any>(name: string, dataType: string, options?: Record<string, any>): ColumnBuilder<T> {
  const col: ColumnBuilder<T> = {
    name,
    dataType,
    options,
    defaultRandom() {
      col.defaultValue = 'random_uuid()';
      return col;
    },
    primaryKey() {
      col.isPrimaryKey = true;
      return col;
    },
    notNull() {
      col.isNotNull = true;
      return col;
    },
    default(val: any) {
      col.defaultValue = val;
      return col;
    },
    defaultNow() {
      col.defaultValue = 'now()';
      return col;
    },
    references(_refFn: () => any, _opts?: Record<string, any>) {
      return col;
    },
    $type<U>() {
      return col as unknown as ColumnBuilder<U>;
    },
    unique() {
      return col;
    },
  };
  return col;
}

export function pgEnum<T extends readonly [string, ...string[]]>(enumName: string, values: T) {
  const enumFn = (colName: string) => createColumn<T[number]>(colName, 'enum', { enumName, values });
  return Object.assign(enumFn, {
    enumName,
    enumValues: values,
  });
}

export function pgTable<TCols extends Record<string, ColumnBuilder<any>>>(
  tableName: string,
  columns: TCols,
  extraConfig?: (table: TCols) => any[]
): TCols & { _tableName: string } {
  if (extraConfig) {
    try {
      extraConfig(columns);
    } catch {
      // ignore index builder errors in shim
    }
  }
  return Object.assign({ _tableName: tableName }, columns);
}

export const uuid = (name: string) => createColumn<string>(name, 'uuid');
export const varchar = (name: string, opts?: { length?: number }) => createColumn<string>(name, 'varchar', opts);
export const integer = (name: string) => createColumn<number>(name, 'integer');
export const boolean = (name: string) => createColumn<boolean>(name, 'boolean');
export const timestamp = (name: string, opts?: { withTimezone?: boolean; mode?: string }) =>
  createColumn<Date>(name, 'timestamp', opts);
export const date = (name: string, opts?: { mode?: string }) => createColumn<string>(name, 'date', opts);
export const text = (name: string) => createColumn<string>(name, 'text');
export const jsonb = (name: string) => createColumn<any>(name, 'jsonb');

export function index(name: string) {
  return {
    on: (...columns: any[]) => ({ type: 'index', name, columns }),
  };
}

export function uniqueIndex(name: string) {
  return {
    on: (...columns: any[]) => ({ type: 'uniqueIndex', name, columns }),
  };
}
