import type { Mvk_Token } from '../generated/graphqlTypes'
import { normalizeMvkToken } from '../../pages/Doorman/Doorman.converter'

export type MvkTokenStorage = ReturnType<typeof normalizeMvkToken>

export type MvkTokenGraphQL = Omit<Mvk_Token, '__typename'>
