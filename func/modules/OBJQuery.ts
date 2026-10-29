export type QueryCondition = {
  [key: string]: any;
};

export type SelectedFields = string[];

export type ObjectQuery = Record<string, any>;

export function queryObjects(
  objects: Record<string, ObjectQuery>,
  query: QueryCondition,
  findOne?: true,
  selectedFields?: SelectedFields
): [string, any] | undefined;

export function queryObjects(
  objects: Record<string, ObjectQuery>,
  query: QueryCondition,
  findOne?: false,
  selectedFields?: SelectedFields
): [string, any][];

export function queryObjects(
  objects: Record<string, ObjectQuery>,
  query: QueryCondition,
  findOne: boolean = false,
  selectedFields: SelectedFields = []
): [string, any][] | [string, any] | undefined {
  function isPlainObject(obj: any): boolean {
    return (
      obj !== null &&
      typeof obj === "object" &&
      !Array.isArray(obj) &&
      obj.constructor === Object
    );
  }

  function matchCondition(value: any, condition: any): boolean {
    if (condition === undefined) return true;
    if (condition.$gt !== undefined) return value > condition.$gt;
    if (condition.$exists !== undefined)
      return condition.$exists === true
        ? value !== undefined && value !== null
        : value === undefined || value === null;
    if (condition.$lt !== undefined) return value < condition.$lt;
    if (condition.$gte !== undefined) return value >= condition.$gte;
    if (condition.$lte !== undefined) return value <= condition.$lte;
    if (condition.$ne !== undefined) return value !== condition.$ne;
    if (Array.isArray(condition.$in)) return condition.$in.includes(value);
    if (condition.$regex instanceof RegExp) return condition.$regex.test(value);
    return value === condition;
  }

  function getValueByPath(obj: ObjectQuery, path: string): any {
    return path
      .split(".")
      .reduce(
        (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
        obj
      );
  }

  function selectFields(
    obj: ObjectQuery,
    selectedFields: SelectedFields
  ): ObjectQuery {
    if (selectedFields.length === 0) return obj;
    const selectedObj: ObjectQuery = {};
    selectedFields.forEach((field) => {
      const value = getValueByPath(obj, field);
      if (value !== undefined) {
        selectedObj[field] = value;
      }
    });
    return selectedObj;
  }

  function matchObject(obj: ObjectQuery, query: QueryCondition): boolean {
    for (let key in query) {
      if (query.hasOwnProperty(key)) {
        const condition = query[key];

        if (key.startsWith("value.")) {
          const path = key.substring(6); // Remove 'value.' prefix
          const value = getValueByPath(obj, path);
          if (!matchCondition(value, condition)) return false;
        } else {
          const value = obj[key];
          if (!matchCondition(value, condition)) return false;
        }
      }
    }
    return true;
  }

  if (!isPlainObject(objects)) {
    throw new Error("Input must be a plain object.");
  }

  const results = Object.entries(objects).filter(([, obj]) =>
    matchObject(obj, query)
  );
  const selectedResults = results.map(([key, obj]) => [
    key,
    selectFields(obj, selectedFields),
  ]);

  if (findOne) {
    return (selectedResults.length > 0 ? selectedResults[0] : undefined) as
      | [string, any]
      | undefined;
  }
  return selectedResults as [string, any][];
}
