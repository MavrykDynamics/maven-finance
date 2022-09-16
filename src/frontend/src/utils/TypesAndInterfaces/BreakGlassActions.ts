import type { Break_Glass_Council_Member } from '../generated/graphqlTypes'
import { normalizeBreakGlassActions } from 'pages/BreakGlassActions/BreakGlassActions.helpers'

export type BreakGlassCouncilMember = ReturnType<typeof normalizeBreakGlassActions>
export type BreakGlassCouncilMemberGraphQL = Omit<Break_Glass_Council_Member, '__typename'>
