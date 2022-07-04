export const getSeparateCamelCase = (stringCamelCase: string): string =>
  stringCamelCase?.length ? stringCamelCase.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : ''