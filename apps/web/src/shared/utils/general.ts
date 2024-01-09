export function check<T>(value?: T, varName = 'not Defined'): T {
  if (value === undefined || value === null || value === '') {
    throw new Error(`Required Value is missing. VarName:${varName}`);
  }
  return value;
}
