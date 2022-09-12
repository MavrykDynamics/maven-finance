# Changelog

## Version 0.13.0

### Deployment

- DEV &#9745;
- PROD &#9746;

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

### New Major Table: Table

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
