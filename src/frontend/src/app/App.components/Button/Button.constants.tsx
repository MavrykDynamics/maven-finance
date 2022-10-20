export const BUTTON = 'button'
export const SUBMIT = 'submit'
export const RESET = 'reset'
export type ButtonTypes = typeof BUTTON | typeof SUBMIT | typeof RESET | undefined

export const PRIMARY = 'primary'
export const SECONDARY = 'secondary'
export const TRANSPARENT = 'transparent'
export const ACTION_PRIMARY = 'actionPrimary'
export const ACTION_SECONDARY = 'actionSecondary'
export const ACTION_SIMPLE = 'actionSimple'
export type ButtonStyle =
  | typeof PRIMARY
  | typeof SECONDARY
  | typeof TRANSPARENT
  | 'votingFor'
  | 'votingAgainst'
  | 'votingAbstain'
  | typeof ACTION_PRIMARY
  | typeof ACTION_SECONDARY
  | typeof ACTION_SIMPLE
  | undefined
