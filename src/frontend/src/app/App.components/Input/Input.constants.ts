export const INPUT_PRIMARY = 'primary'
export const INPUT_SEARCH = 'search'
export const INPUT_STATUS_SUCCESS = 'success'
export const INPUT_STATUS_ERROR = 'error'

export type InputStatusType = typeof INPUT_STATUS_SUCCESS | typeof INPUT_STATUS_ERROR | '' | undefined
export type InputKind = typeof INPUT_PRIMARY |typeof INPUT_SEARCH