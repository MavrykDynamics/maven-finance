// type
import type { Aggregator, Aggregator_Factory, Aggregator_Oracle_Record } from '../generated/graphqlTypes'

export type AggregatorGraphQL = Omit<Aggregator, '__typename'>
export type AggregatorFactoryGraphQL = Omit<Aggregator_Factory, '__typename'>
export type AggregatorOracleRecordGraphQL = Omit<Aggregator_Oracle_Record, '__typename'>
