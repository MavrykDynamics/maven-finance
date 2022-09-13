// type
import type { Aggregator, Aggregator_Factory, Aggregator_Oracle } from '../generated/graphqlTypes'

export type AggregatorGraphQL = Omit<Aggregator, '__typename'>
export type AggregatorFactoryGraphQL = Omit<Aggregator_Factory, '__typename'>
export type AggregatorOracleGraphQL = Omit<Aggregator_Oracle, '__typename'>
