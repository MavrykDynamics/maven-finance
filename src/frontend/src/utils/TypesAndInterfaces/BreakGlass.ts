// type
import type {
  Break_Glass,
  Aggregator,
  Aggregator_Factory,
  Delegation,
  Doorman,
  Farm,
  Farm_Factory,
  Treasury,
  Treasury_Factory,
} from '../generated/graphqlTypes'

import { normalizeBreakGlass, normalizeBreakGlassStatus } from '../../pages/BreakGlass/BreakGlass.helpers'

export type BreakGlassStorage = ReturnType<typeof normalizeBreakGlass>
export type BreakGlassStatusStorage = ReturnType<typeof normalizeBreakGlassStatus>

export type BreakGlassGraphQL = Omit<Break_Glass, '__typename'>

export type BreakGlassStatusGraphQL = {
  aggregator: Aggregator[]
  aggregator_factory: Aggregator_Factory[]
  delegation: Delegation[]
  doorman: Doorman[]
  farm: Farm[]
  farm_factory: Farm_Factory[]
  treasury: Treasury[]
  treasury_factory: Treasury_Factory[]
}
