export const getSeparateCamelCase = (stringCamelCase: string): string =>
  stringCamelCase?.length ? stringCamelCase.replace(/([a-z0-9])([A-Z])/g, '$1 $2') : ''

export const getSeparateSnakeCase = (stringSnakeCase: string): string =>
  stringSnakeCase?.length ? stringSnakeCase.replaceAll('_', ' ').toLowerCase() : ''