export function relations<TTable>(
  table: TTable,
  relationBuilder: (helpers: {
    one: (target: any, config?: { fields?: any[]; references?: any[]; relationName?: string }) => any;
    many: (target: any, config?: { relationName?: string }) => any;
  }) => Record<string, any>
) {
  const helpers = {
    one: (target: any, config?: { fields?: any[]; references?: any[]; relationName?: string }) => ({
      type: 'one',
      target,
      config,
    }),
    many: (target: any, config?: { relationName?: string }) => ({
      type: 'many',
      target,
      config,
    }),
  };
  return {
    table,
    config: relationBuilder(helpers),
  };
}

export function eq(left: any, right: any) {
  return { op: 'eq', left, right };
}

export function ne(left: any, right: any) {
  return { op: 'ne', left, right };
}

export function and(...conditions: any[]) {
  return { op: 'and', conditions };
}

export function or(...conditions: any[]) {
  return { op: 'or', conditions };
}

export function desc(column: any) {
  return { op: 'desc', column };
}

export function asc(column: any) {
  return { op: 'asc', column };
}

export function sql(strings: TemplateStringsArray, ...values: any[]) {
  return { op: 'sql', strings, values };
}
