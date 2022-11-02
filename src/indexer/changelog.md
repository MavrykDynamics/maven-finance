# Changelog

## Information

### Deployment

- DEV: 0.20
- PROD: 0.20
- PROD2: 0.20

### Updated ERD Model

[Link](https://lucid.app/lucidchart/33d39042-b931-400c-b116-1523cb8dc128/edit?invitationId=inv_1918cbe0-83ec-4535-b842-f9e789b8ee69&page=0_0#)

## Version 0.20

### What's new

- LendingControllerMockTime contract indexed
- TokenPoolReward contract removed

## Version 0.19

### What's new

- GovernanceProposalData
  - Column CodeDescription added
- GovernancePaymentData
  - Column TokenId added
- GovernanceSatelliteOracleAggregator
  - Table added

### Breaking changes

- Aggregator
  - Token0Symbol and Token1Symbol columns removed
- GovernanceProposalData
  - RecordInternalId column renamed to InternalId
  - Bytes column renamed to EncodedCode
- GovernancePaymentData
  - RecordInternalId column renamed to InternalId
- GovernanceSatelliteAggregator
  - Table removed entirely
- GovernanceSatelliteAggregatorOracle
  - Table removed entirely
- GovernanceSatelliteSatelliteOracle
  - Table renamed to GovernanceSatelliteOracle
  - AggregatorsSubscribed column removed
  - Oracle column related name renamed from governance_satellite_satellite_oracles to governance_satellite_oracles (relation GovernanceSatelliteOracle->MavrykUser)
- GovernanceSatelliteSatelliteOracleAggregatorPair
  - Table removed entirely
- TokenSaleBuyOption
  - BuyOptionInternalId column renamed to InternalId

## Version 0.17/0.18

### What's new

- Doorman
  - OnVaultDepositSMvkPaused
  - OnVaultWithdrawSMvkPaused
  - OnVaultLiquidateSMvkPaused
- StakeHistoryData
  - VAULT_DEPOSIT_SMVK = 5
  - VAULT_WITHDRAW_SMVK = 6
  - VAULT_LIQUIDATE_SMVK = 6
- LendingControllerVault
  - LiquidationEndLevel
- LendingControllerCollateralToken
  - Protected

### Breaking changes

- Aggregator
  - LastCompletedPrice* columns refactored to LastCompletedData*
- LendingController
  - UpdateCollateralTokenPaused renamed to SetCollateralTokenPaused
  - VaultLiquidateSMvkPaused renamed to VaultOnLiquidateSMvkPaused
- LendingControllerVault
  - MarkedForLiquidationTimestamp renamed to MarkedForLiquidationLevel
- LendingControllerLoanToken
  - OracleType removed
  - IsPaused removed
- LendingControllerCollateralToken
  - OracleType removed

## Version 0.16

### What's new

- Oracle V2 Indexed
- Lending Indexed
  - Liquidation on vault not tracked yet

### Breaking changes

- Token table removed and replaced by dipdup_token_metadata table (all FKs to the Token Table have been replaced by token contract addresses)
- CouncilActionParameter/BreakGlassActionParameter/GovernanceSatelliteActionParameter now contains hex bytes as values
- Table GovernanceSatelliteActionTransfer removed. Its content is now saved into GovernanceSatelliteActionParameter

### New tables

- Aggregator/AggregatorFactory tables + GovernanceSatellite/Council/BreakGlass tables refactored
- LendingController/Vault/VaultFactory/TokenPoolReward tables
- dipdup_token_metadata: Metadata of all tokens in the system
- dipdup_contract_metadata: Metadata of all contracts in the system (due to a BCD bug, some contracts don't have their metadata)

## Version 0.13

### Changes on all contract tables

- New attribute: last_updated_at for each contract
- Lambda tables added for each contract
- GeneralContract tables added for each contract
- WhitelistContract tables added for each contract

### Oracle V2

- Entirely new Aggregator*/Vault* tables

### Table name refactoring

| Old                                                    | New                                              |
| ------------------------------------------------------ | ------------------------------------------------ |
| MintHistoryData                                        | MVKMintHistoryData                               |
| AggregatorOracleRecord                                 | AggregatorOracle                                 |
| BreakGlassActionRecord                                 | BreakGlassAction                                 |
| BreakGlassActionRecordSigner                           | BreakGlassActionSigner                           |
| BreakGlassActionRecordParameter                        | BreakGlassActionParameter                        |
| CouncilActionRecord                                    | CouncilAction                                    |
| CouncilActionRecord                                    | CouncilAction                                    |
| CouncilActionRecordSigner                              | CouncilActionSigner                              |
| CouncilActionRecordParameter                           | CouncilActionParameter                           |
| SatelliteRewardsRecord                                 | SatelliteRewards                                 |
| SatelliteRecord                                        | Satellite                                        |
| GovernanceFinancialRequestRecord                       | GovernanceFinancialRequest                       |
| GovernanceFinancialRequestRecordVote                   | GovernanceFinancialRequestVote                   |
| GovernanceSatelliteActionRecord                        | GovernanceSatelliteAction                        |
| GovernanceSatelliteAggregatorRecord                    | GovernanceSatelliteAggregator                    |
| GovernanceSatelliteSatelliteOracleRecord               | GovernanceSatelliteSatelliteOracle               |
| GovernanceSatelliteSatelliteOracleAggregatorPairRecord | GovernanceSatelliteSatelliteOracleAggregatorPair |
| GovernanceSatelliteSnapshotRecord                      | GovernanceSatelliteSnapshot                      |
| GovernanceProposalRecord                               | GovernanceProposal                               |
| LendingControllerRewardRecord                          | LendingControllerReward                          |
| LendingControllerVaultRecord                           | LendingControllerVault                           |
| LendingControllerDepositorRecord                       | LendingControllerDepositor                       |
| LendingControllerCollateralTokenRecord                 | LendingControllerCollateralToken                 |
| LendingControllerLoanTokenRecord                       | LendingControllerLoanToken                       |
| TokenSaleBuyerRecord                                   | TokenSaleBuyer                                   |
| TokenSaleBuyerRecordOption                             | TokenSaleBuyerOption                             |
| VaultDepositorRecord                                   | VaultDepositor                                   |
| VestingVesteeRecord                                    | VestingVestee                                    |

### New Major Table: Token

- Contains info about tokens for the entire system
- Table refactored accordingly (attributes removed and replaced by a single foreign key | the Token table):
  - Farm
  - GovernanceProposalPayment
  - GovernanceFinancialRequest
  - GovernanceSatelliteActionTransfer
  - LendingControllerCollateralToken
  - LendingControllerLoanToken
  - TreasuryTransferHistoryData

### GovernanceFinancialRequestVote/GovernanceSatelliteActionVote:

- New attribute: satellite_snapshot

### Action tables (GovernanceProposal/GovernanceSatelliteAction/GovernanceFinancialRequest/CouncilAction/EmergencyGovernanceRecord/BreakGlassAction)

- New attribute: execution_datetime

### Dipdup 6.0.0 breaking changes:

- Attribute name refactoring:
  | Table | Old | New |
  | ----- | --- | --- |
  | GovernanceProposalData | governance_proposal_record | governance_proposal |
  | GovernanceProposalPayment | governance_proposal_record | governance_proposal |
  | GovernanceProposalVote | governance_proposal_record | governance_proposal |
  | LendingControllerVaultHandle | lending_controller_vault_record | lending_controller_vault |
  | LendingControllerVaultCollateralBalance | lending_controller_vault_record | lending_controller_vault |
  | TokenSaleBuyerOption | buyer_record | buyer |
- Foreign key name refactoring :
  | Relation | Old | New |
  | ----- | --- | --- |
  | MVKToken &rarr; Governance | mvk_token | mvk_tokens |
  | Doorman &rarr; MavrykUser | doorman_stake_account | doorman_stake_accounts |
  | Delegation &rarr; MavrykUser | satellite_record | satellite |
  | Council &rarr; MavrykUser | council_council_member | council_council_members |
  | CouncilActionParameter &rarr; CouncilAction | council_action_record_parameters | parameters |
  | CouncilCouncilMember &rarr; Council | council_council_member | member |
  | CouncilCouncilMember &rarr; MavrykUser | council_council_member | council_council_members |
  | CouncilAction &rarr; Council | council_action_records | actions |
  | VestingVestee &rarr; Vesting | vesting_vestee_records | vestees |
  | BreakGlassCouncilMember &rarr; MavrykUser | break_glass_council_member | break_glass_council_members |
  | BreakGlassCouncilMember &rarr; BreakGlass | break_glass_council_members | council_members |
  | BreakGlassAction &rarr; BreakGlass | break_glass_action_records | actions |
  | BreakGlassActionSigner &rarr; MavrykUser | break_glass_actions_signer | break_glass_action_signers |
  | BreakGlassActionParameter &rarr; BreakGlass | break_glass_action_parameters | parameters |
  | GovernanceProposal &rarr; Governance | governance_proposal_records | proposals |
  | GovernanceProposalData &rarr; GovernanceProposalo | proposal_data | data |
  | GovernanceProposalPayment &rarr; GovernanceProposal | proposal_payments | payments |
  | GovernanceSatelliteSnapshot &rarr; Governance | governance_satellite_snapshot_records | satellite_snapshots |
  | GovernanceSatelliteSnapshot &rarr; MavrykUser | governance_satellite_snapshot_records_votes | governance_satellite_snapshots |
  | GovernanceFinancialRequest &rarr; GovernanceFinancial | governance_financial_request_records | requests |
  | GovernanceSatelliteAction &rarr; GovernanceSatellite | governance_satellite_action_records | actions |
  | GovernanceSatelliteActionParameter &rarr; GovernanceSatelliteAction | governance_satellite_action_parameters | parameters |
  | GovernanceSatelliteActionTransfer &rarr; GovernanceSatelliteAction | governance_satellite_action_transfers | transfers |
  | GovernanceSatelliteAggregator &rarr; GovernanceSatellite | governance_satellite_aggregator_records | aggregators |
  | GovernanceSatelliteAggregatorOracle &rarr; GovernanceSatelliteAggregator | governance_satellite_satellite_oracle_records | oracles |
  | GovernanceSatelliteSatelliteOracle &rarr; GovernanceSatellite | governance_satellite_satellite_oracle_records | oracles |
  | MVKTransferHistoryData &rarr; MVKToken | mvk_transfer_history_data | transfer_history_data |
  | SMVKHistoryData &rarr; Doorman | smvk_history_data | staked_mvk_history_data |
  | StakeHistoryData &rarr; Doorman | stake_record | stake_history_data |
  | StakeHistoryData &rarr; MavrykUser | stake_record | stake_history_data |
  | LendingControllerReward &rarr; LendingController | reward_records | rewards |
  | LendingControllerLoanToken &rarr; LendingController | loan_token_records | loan_tokens |
  | LendingControllerLoanToken &rarr; Token #1 | lending_controller_loan_loan_token_records | lending_controller_loan_token |
  | LendingControllerLoanToken &rarr; Token #2 | lending_controller_loan_loan_token_records | lending_controller_loan_token |
  | TokenSaleBuyer &rarr; TokenSale | token_sale_buyer_records | token_sale_buyers |
  | TokenSaleBuyer &rarr; MavrykUser | token_sale_buyer_records | token_sale_buyers |
  | TokenSaleBuyerOption &rarr; TokenSaleBuyOption | buyer_record_options | buyer_options |
  | VaultDepositor &rarr; Vault | depositor_records | depositors |
  | VaultDepositor &rarr; MavrykUser | vault_depositor_records | vault_depositors |
  | VestingVestee &rarr; Vesting | vestee_records | vestees |
  | VestingVestee &rarr; MavrykUser | vesting_vestee_records | vesting_vestees |
