import type { Break_Glass_Council_Member, Break_Glass_Action } from '../generated/graphqlTypes'
import { normalizeBreakGlassCouncilMember, normalizeBreakGlassAction } from 'pages/BreakGlassActions/BreakGlassActions.helpers'

export type BreakGlassCouncilMember = ReturnType<typeof normalizeBreakGlassCouncilMember>
export type BreakGlassCouncilMemberGraphQL = Omit<Break_Glass_Council_Member, '__typename'>

export type BreakGlassAction = ReturnType<typeof normalizeBreakGlassAction>
export type BreakGlassActionGraphQL = Omit<Break_Glass_Action, '__typename'>
