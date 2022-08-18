import type {
  Farm, Farm_Factory, Delegation, Doorman, Mvk_Token, 
  Governance, Emergency_Governance, Break_Glass,
  Council, Treasury_Factory, Vesting, Governance_Satellite,
  Usdm_Token, Usdm_Token_Controller, Vault, Aggregator, Aggregator_Factory
} from '../generated/graphqlTypes'
 
export type AddressesType = {
  farm: {address: Farm['address']}[]
  farm_factory: {address: Farm_Factory['address']}[]
  delegation: {address: Delegation['address']}[]
  doorman: {address: Doorman['address']}[]
  mvk_token: {address: Mvk_Token['address']}[]
  governance: {address: Governance['address']}[]
  emergency_governance: {address: Emergency_Governance['address']}[]
  break_glass: {address: Break_Glass['address']}[]
  council: {address: Council['address']}[]
  treasury_factory: {address: Treasury_Factory['address']}[]
  vesting: {address: Vesting['address']}[]
  governance_satellite: {address: Governance_Satellite['address']}[]
  usdm_token: {address: Usdm_Token['address']}[]
  usdm_token_controller: {address: Usdm_Token_Controller['address']}[]
  vault: {address: Vault['address']}[]
  aggregator: {address: Aggregator['address']}[]
  aggregator_factory: {address: Aggregator_Factory['address']}[]
}