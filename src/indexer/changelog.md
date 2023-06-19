# Changelog

## Information

### Deployment

- DEV: 0.43
- STAGING: 0.42
- PROD: 0.42
- PROD2: 0.42

### Updated ERD Model

[Link](https://lucid.app/lucidchart/33d39042-b931-400c-b116-1523cb8dc128/edit?invitationId=inv_1918cbe0-83ec-4535-b842-f9e789b8ee69&page=0_0#)

## Next

### What's new

- Doorman exit
- MVK Burn
- contracts map update

<details><summary>Previous versions</summary>

<details><summary>0.44</summary>

## 0.44

### What's new

- LendingController
  - Column LiquidationMaxDuration added

### Breaking changes

- AggregatorFactory
  - Column LastUpdatedAt now non-nullable

- AggregatorFactoryLambda
  - Column LastUpdatedAt now non-nullable

- AggregatorFactoryAggregatorLambda
  - Column LastUpdatedAt now non-nullable

- Aggregator
  - Column Governance now non-nullable
  - Column CreationTimestamp now non-nullable
  - Column LastCompletedDataLastUpdatedAt now non-nullable
  - Column LastUpdatedAt now non-nullable

- AggregatorLambda
  - Column LastUpdatedAt now non-nullable

- BreakGlass
  - Column LastUpdatedAt now non-nullable

- BreakGlassAction
  - Column StartDatetime now non-nullable
  - Column ExecutionDatetime now non-nullable
  - Column ExpirationDatetime now non-nullable

- BreakGlassLambda
  - Column LastUpdatedAt now non-nullable

- Council
  - Column LastUpdatedAt now non-nullable

- CouncilAction
  - Column StartDatetime now non-nullable
  - Column ExecutionDatetime now non-nullable
  - Column ExpirationDatetime now non-nullable

- CouncilLambda
  - Column LastUpdatedAt now non-nullable

- Satellite
  - Column RegistrationTimestamp now non-nullable

- Delegation
  - Column LastUpdatedAt now non-nullable

- DelegationRecord
  - Column Satellite now non-nullable
  - Column SatelliteRegistrationTimestamp now non-nullable

- DelegationLambda
  - Column LastUpdatedAt now non-nullable

- Doorman
  - Column FarmClaimedPaused renamed to FarmClaimPaused
  - Column LastUpdatedAt now non-nullable

- DoormanStakeAccount
  - Column Doorman now non-nullable

- DoormanLambda
  - Column LastUpdatedAt now non-nullable

- EmergencyGovernance
  - Column LastUpdatedAt now non-nullable

- EmergencyGovernanceRecord
  - Column StartDatetime now non-nullable
  - Column ExecutionDatetime now non-nullable
  - Column ExpirationDatetime now non-nullable

- EmergencyGovernanceVote
  - Column Timestamp now non-nullable

- EmergencyGovernanceLambda
  - Column LastUpdatedAt now non-nullable

- FarmFactory
  - Column LastUpdatedAt now non-nullable

- FarmFactoryLambda
  - Column LastUpdatedAt now non-nullable

- FarmFactoryFarmLambda
  - Column LastUpdatedAt now non-nullable

- FarmFactoryMFarmLambda
  - Column LastUpdatedAt now non-nullable

- Farm
  - Column Governance now non-nullable
  - Column LPToken now non-nullable
  - Column CreationTimestamp now non-nullable
  - Column LastUpdatedAt now non-nullable

- FarmLambda
  - Column LastUpdatedAt now non-nullable

- GovernanceProposal
  - Column StartDatetime now non-nullable
  - Column ExecutionDatetime now non-nullable

- GovernanceProposalVote
  - Column GovernanceProposal now non-nullable
  - Column Timestamp now non-nullable

- GovernanceFinancial
  - Column LastUpdatedAt now non-nullable

- GovernanceFinancialWhitelistTokenContract
  - Column Token now non-nullable

- GovernanceFinancialRequest
  - Column RequestedDatetime now non-nullable
  - Column ExecutionDatetime now non-nullable
  - Column ExpirationDatetime now non-nullable

- GovernanceFinancialRequestVote
  - Column SatelliteSnapshot now non-nullable
  - Column Timestamp now non-nullable

- GovernanceFinancialLambda
  - Column LastUpdatedAt now non-nullable

- GovernanceProxy
  - Column LastUpdatedAt now non-nullable

- GovernanceProxyLambda
  - Column LastUpdatedAt now non-nullable

- GovernanceSatellite
  - Column LastUpdatedAt now non-nullable

- GovernanceSatelliteAction
  - Column StartDatetime now non-nullable
  - Column ExecutionDatetime now non-nullable
  - Column ExpirationDatetime now non-nullable

- GovernanceSatelliteActionVote
  - Column SatelliteSnapshot now non-nullable
  - Column Timestamp now non-nullable

- GovernanceSatelliteOracleAggregator
  - Column StartTimestamp now non-nullable

- GovernanceSatelliteLambda
  - Column LastUpdatedAt now non-nullable

- Governance
  - Column Active removed
  - Column LastUpdatedAt now non-nullable

- GovernanceLambda
  - Column LastUpdatedAt now non-nullable

- LiquidityBaking
  - Column LastUpdatedAt now non-nullable

- LendingController
  - Column Governance now non-nullable
  - Column LastUpdatedAt now non-nullable

- LendingControllerWhitelistTokenContract
  - Column Token now non-nullable

- LendingControllerVault
  - Column LendingController now non-nullable
  - Column Owner now non-nullable
  - Column LoanToken now non-nullable
  - Column LastUpdatedTimestamp now non-nullable

- LendingControllerVaultCollateralBalance
  - Column LendingControllerVault now non-nullable
  - Column Token now non-nullable and renamed to CollateralToken

- LendingControllerCollateralToken
  - Column LendingController now non-nullable
  - Column Oracle now non-nullable
  - Column CollateralToken now non-nullable and renamed to Token

- LendingControllerLoanToken
  - Column LendingController now non-nullable
  - Column MToken now non-nullable
  - Column Oracle now non-nullable
  - Column LoanToken now non-nullable and renamed to Token

- LendingControllerLambda
  - Column LastUpdatedAt now non-nullable

- MToken
  - Column Governance now non-nullable
  - Column Token now non-nullable
  - Column LastUpdatedAt now non-nullable

- MVKToken
  - Column Token now non-nullable
  - Column NextInflationTimestamp now non-nullable
  - Column LastUpdatedAt now non-nullable

- TokenSale
  - Contract removed
  - Tables removed:
    - TokenSale
    - TokenSaleBuyOption
    - TokenSaleWhitelistedUser
    - TokenSaleBuyer
    - TokenSaleBuyerOption

- TreasuryFactory
  - Column LastUpdatedAt now non-nullable

- TreasuryFactoryLambda
  - Column LastUpdatedAt now non-nullable

- TreasuryFactoryTreasuryLambda
  - Column LastUpdatedAt now non-nullable

- TreasuryFactoryWhitelistTokenContract
  - Column Token now non-nullable

- Treasury
  - Column Governance now non-nullable
  - Column CreationTimestamp now non-nullable
  - Column LastUpdatedAt now non-nullable

- TreasuryBalance
  - Column Token now non-nullable
  - Column TZKTTokenID now non-nullable

- TreasuryLambda
  - Column LastUpdatedAt now non-nullable

- TreasuryWhitelistTokenContract
  - Column Token now non-nullable

- TreasuryTransferHistoryData
  - Column To_ now non-nullable

- VaultFactory
  - Column Governance now non-nullable
  - Column LastUpdatedAt now non-nullable

- VaultFactoryLambda
  - Column LastUpdatedAt now non-nullable

- VaultFactoryVaultLambda
  - Column LastUpdatedAt now non-nullable

- Vault
  - Column Factory now non-nullable
  - Column CreationTimestamp now non-nullable
  - Column LastUpdatedAt now non-nullable

- VaultDepositor
  - Column Vault now non-nullable
  - Column Depositor now non-nullable

- Vesting
  - Column LastUpdatedAt now non-nullable

- VaultLambda
  - Column LastUpdatedAt now non-nullable

- VestingLambda
  - Column LastUpdatedAt now non-nullable

- VestingVestee
  - Column StartTimestamp now non-nullable
  - Column EndCliffTimestamp now non-nullable
  - Column EndVestingTimestamp now non-nullable
  - Column NextRedemptionTimestamp now non-nullable
  - Column LastClaimedTimestamp now non-nullable

</details>

<details><summary>0.43</summary>

## 0.43

### What's new

- All contract tables:
  - Column ID added
  - Column Address is not a Primary Key anymore. The new Primary Key is the column ID
  - Column Metadata added
  - Column Network added
  - Tables affected by the changes:
    - AggregatorFactory
    - Aggregator
    - BreakGlass
    - Council
    - Delegation
    - Doorman
    - EmergencyGovernance
    - FarmFactory
    - Farm
    - GovernanceFinancial
    - GovernanceProxy
    - GovernanceSatellite
    - Governance
    - LendingController
    - LiquidityBaking
    - MToken
    - TreasuryFactory
    - Treasury
    - VaultFactory
    - Vault
    - Vesting

- MavrykUser
  - Column ID added
  - Column Address is not a Primary Key anymore. The new Primary Key is the column ID
  - Column Network added

- MVKFaucet
  - Column ID added
  - Column Address is not a Primary Key anymore. The new Primary Key is the column ID
  - Column Network added

- Token
  - Column TokenStandard added
  - Metadata column as now a Default value:
  ```json
  {
    "name": null,
    "symbol": null,
    "icon": null,
    "decimals": null,
    "shouldPreferSymbol": null,
    "thumbnailUri": null
  }
  ```

- TreasuryBalance
  - Column Whitelisted added

### Breaking changes

- DipdupContractMetadata
  - Table deprecated

- GovernanceFinancialWhitelistTokenContract
  - Column TokenContractStandard removed

- LendingControllerWhitelistTokenContract
  - Column TokenContractStandard removed

- LendingControllerCollateralToken
  - Column TokenContractStandard removed

- LendingControllerLoanToken
  - Column LoanTokenContractStandard removed

- TreasuryWhitelistTokenContract
  - Column TokenContractStandard removed

- TreasuryFactoryWhitelistTokenContract
  - Column TokenContractStandard removed

</details>

<details><summary>0.42</summary>

## 0.42

### What's new

- Token
  - Table added

- GovernanceFinancialWhitelistTokenContract
  - Column Token added

- LendingControllerWhitelistTokenContract
  - Column Token added

- MToken
  - Column Token added

- MVKToken
  - Column Token added

- TreasuryWhitelistTokenContract
  - Column Token added

- TreasuryFactoryWhitelistTokenContract
  - Column Token added

### Breaking changes

- DipdupTokenMetadata
  - Table Deprecated. It was kept but it's not filled anymore. You should use the table Token instead. This new Token table is linked to several other tables with foreign keys

- Farm
  - Column LpTokenAddress removed and replaced with a foreign key to the table Token called LpToken
  - Column Token0Address removed and replaced with a foreign key to the table Token called Token0
  - Column Token1Address removed and replaced with a foreign key to the table Token called Token1

- GovernanceProposalPayment
  - Column TokenAddress and TokenId removed and replaced with a foreign key to the table Token called Token

- GovernanceFinancialRequest
  - Column TokenAddress removed and replaced with a foreign key to the table Token called Token

- LendingControllerCollateralToken
  - Column TokenAddress removed and replaced with a foreign key to the table Token called CollateralToken

- LendingControllerLoanToken
  - Column LoanTokenAddress removed and replaced with a foreign key to the table Token called LoanToken

- TreasuryBalance
  - Column TokenAddress TokenId and Metadata removed and replaced with a foreign key to the table Token called Token

</details>

<details><summary>0.41</summary>

## 0.41

### What's new

- BreakGlassAction
  - Column CouncilSizeSnapshot added

- CouncilAction
  - Column CouncilSizeSnapshot added

</details>

<details><summary>0.40</summary>

## 0.40

### What's new

- DipdupException
  - Table added

- LendingControllerHistoryData
  - Column CollateralToken added

</details>

<details><summary>0.39</summary>

## 0.39

### What's new

- DoormanStakeAccount
  - Column TotalExitFeeRewardsClaimed added
  - Column TotalSatelliteRewardsClaimed added
  - Column TotalFarmRewardsClaimed added

- MVKFaucet
  - Table added

- MVKFaucetRequester
  - Table added

- SMVKHistoryData
  - Column Level added

- MVKTokenMintHistoryData
  - Column Level added

</details>

<details><summary>0.38</summary>

## 0.38

### Breaking changes

- BreakGlassAction
  - Column internalID added, it replaces the old ID column (ID is still used but for a more traditionnal purpose)

- CouncilAction
  - Column internalID added, it replaces the old ID column (ID is still used but for a more traditionnal purpose)

- EmergencyGovernanceRecord
  - Column internalID added, it replaces the old ID column (ID is still used but for a more traditionnal purpose)

- GovernanceProposal
  - Column internalID added, it replaces the old ID column (ID is still used but for a more traditionnal purpose)

- GovernanceFinancialRequest
  - Column internalID added, it replaces the old ID column (ID is still used but for a more traditionnal purpose)

- GovernanceSatelliteAction
  - Column internalID added, it replaces the old ID column (ID is still used but for a more traditionnal purpose)

### What's new

- SMVKHistoryData
  - Column MVKTotalSupply added

</details>

<details><summary>0.37</summary>

## 0.37

### What's new

- MToken

  - Column TotalSupply added

- Satellite

  - Column RegistrationTimestamp added

- DelegationRecord

  - Column SatelliteRegistrationTimestamp added

</details>

<details><summary>0.36</summary>

## 0.36

### What's new

- TreasuryBalance

  - Table added

</details>

<details><summary>0.35</summary>

## 0.35

### What's new

- GovernanceProposalVote

  - Column VotingRewardClaimed added

- FarmFactory

  - Column CreateFarmMTokenPaused added

- Farm

  - Column LoanTokenName added
  - Column IsMFarm added

- FarmAccount

  - Column TokenRewardIndex added

- FarmFactoryMFarmLambda

  - Table added

- TreasuryBalance

  - Table added but not filled yet (https://github.com/dipdup-io/dipdup/issues/636)

- Treasury

  - Column Baker added

- Vault

  - Column Baker added

### Breaking changes

- GovernanceProxyProxyLambda

  - Table removed

- GovernanceProxyGeneralContract

  - Table removed

- GovernanceProxyWhitelistContract

  - Table removed

- GovernanceProxyWhitelistTokenContract

  - Table removed

- AggregatorFactoryProductLambda

  - Table renamed to AggregatorFactoryAggregatorLambda

- FarmFactoryProductLambda

  - Table renamed to FarmFactoryFarmLambda

- TreasuryFactoryProductLambda

  - Table renamed to TreasuryFactoryTreasuryLambda

- VaultFactoryProductLambda

  - Table renamed to VaultFactoryVaultLambda

</details>

<details><summary>0.34</summary>

## Version 0.34

### What's new

- Vault
  - Column Name added

### Breaking changes

- Vault

  - Column Governance removed

</details>

<details><summary>0.33</summary>

## Version 0.33

### What's new

- LiquidityBakinge5MCandle

  - View added

- LiquidityBakinge15MCandle

  - View added

- LiquidityBakinge1HCandle

  - View added

- LiquidityBakinge1DCandle

  - View added

- LiquidityBakinge1WCandle
  - View added

</details>

<details><summary>0.32</summary>

## Version 0.32

### Breaking changes

- LendingControllerLoanToken
  - Column LPTokenTotal renamed to MTokensTotal
  - Column LPTokenAddress removed and replaced by a FK to the MToken table called MToken

</details>

<details><summary>0.31</summary>

## Version 0.31

### Breaking changes

- Doorman
  - Column on_vault_deposit_smvk_paused renamed to on_vault_deposit_stake_paused
  - Column on_vault_withdraw_smvk_paused renamed to on_vault_withdraw_stake_paused
  - Column on_vault_liquidate_smvk_paused renamed to on_vault_liquidate_stake_paused
- LendingController
  - Column vault_deposit_smvk_paused renamed to vault_deposit_staked_token_paused
  - Column vault_withdraw_smvk_paused renamed to vault_withdraw_staked_token_paused

### What's new

- LendingControllerCollateralToken
  - Column is_staked_token added
  - Column staking_contract_address added
  - Column total_deposited added
  - Column max_deposit_amount added
  - Column paused added
- LendingControllerLoanToken
  - Column paused added

</details>

<details><summary>0.29</summary>

## Version 0.29

### What's new

- MTokenAccountHistoryData
  - Table added

</details>

<details><summary>0.28</summary>

## Version 0.28

### What's new

- LendingControllerCollateralToken
  - Column token_name added
  - Column token_contract_standard added
- LendingControllerLoanToken
  - Column loan_token_contract_standard added

</details>

<details><summary>0.27</summary>

## Version 0.27

### What's new

- MTokenAccount
  - Column RewardsEarned added

</details>

<details><summary>0.26</summary>

## Version 0.27

### What's new

- MTokenAccount
  - Column RewardsEarned added

## Version 0.26

### Breaking changes

- MavrykUserOperator:
  - Table renamed to MVKTokenOperator
  - Owner column related name renamed from UsersOwner to MvkTokenUserOwners
  - Operator column related name renamed from UserOperator to MvkTokenUserOperators
- MVKTransferHistoryData:
  - Table renamed to MVKTokenTransferHistoryData
- MVKMintHistoryData:
  - Table renamed to MVKTokenMintHistoryData

### What's new

- MToken
  - Table added
- MTokenWhitelistContracts
  - Table added
- MTokenOperator
  - Table added
- MTokenAccount
  - Table added
- LendingControllerHistoryData
  - Column LoanToken added

</details>

<details><summary>0.25</summary>

## Version 0.25

### What's new

- Satellite:
  - Colmuns PublicKey and PeerId added
- LendingControllerCollateralToken:
  - Column IsScaledToken added

</details>

<details><summary>0.24</summary>

## Version 0.24

### What's new

- LendingControllerHistoryData:
  - Table added: tracks all operations made to vault contracts and to the lending controller contract

</details>

<details><summary>0.23</summary>

## Version 0.23

### Breaking changes

- LiquidityBakingHistoryData:

  - Values in the TokenPriceUSD column are now fetched asynchronously to speed up the initial indexing process. While
    the data is not sync, a null value will appear.

- LiquidityBaking:

  - Column SharePriceUSD removed (USD price should be the most updated one so it should be calculated in frontend with
    the formula: `SharePriceUSD = SharePrice * XTZUSDPrice`)

- LiquidityBakingPosition:
  - Column AvgPriceUSD removed (USD price should be the most updated one so it should be calculated in frontend with
    the formula: `AvgPriceUSD = AvgPriceq * XTZUSDPrice`)

</details>

<details><summary>0.22</summary>

## Version 0.22

### What's new

- MavrykUser:

  - Table is now cached (no impact on queries)

- GovernanceProposalData:

  - Table now shows null values

- GovernancePaymentData:

  - Table now shows null values

- LiquidityBaking:

  - Column SharePriceUSD added

- LiquidityBakingPosition:

  - Column AvgSharePriceUSD added

- LiquidityBakingHistoryData:
  - Column TokenPriceUSD added

### Breaking changes

- LiquidityBakingHistoryData:
  - Column Price renamed to TokenPrice

</details>

<details><summary>0.21</summary>

## Version 0.21

### What's new

- AggregatorOracle:
  - Column InitEpoch added: always equal to the epoch that was currently set when the oracle joined an Aggregator
  - Column InitRound added: always equal to the round that was currently set when the oracle joined an Aggregator
- AggregatorOracleObservation:
  - Table added: tracks all observations made by an AggregatorOracle for each round/epoch it participated
- LiquidityBaking:
  - Column SharePrice added
- LiquidityBakingPosition:
  - Table added
- LiquidityBakingHistoryData:
  - Column Trader added: you can now fetch all operations made by a trader through this foreign key
  - Column Level added
  - Column XTZQty added
  - Column TokenQty added
  - Column LqtQty added
  - Column Slippage added

### Breaking changes

- LiquidityBakingHistoryData:
  - Column XTZTokenPrice and TokenXTZPrice replaced by Price (BTC price in XTZ)

</details>

<details><summary>0.20</summary>

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
  - Oracle column related name renamed from governance_satellite_satellite_oracles to governance_satellite_oracles (
    relation GovernanceSatelliteOracle->MavrykUser)
- GovernanceSatelliteSatelliteOracleAggregatorPair
  - Table removed entirely
- TokenSaleBuyOption
  - BuyOptionInternalId column renamed to InternalId

</details>

<details><summary>0.17/0.18</summary>

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

</details>

<details><summary>0.16</summary>

## Version 0.16

### What's new

- Oracle V2 Indexed
- Lending Indexed
  - Liquidation on vault not tracked yet

### Breaking changes

- Token table removed and replaced by dipdup_token_metadata table (all FKs to the Token Table have been replaced by
  token contract addresses)
- CouncilActionParameter/BreakGlassActionParameter/GovernanceSatelliteActionParameter now contains hex bytes as values
- Table GovernanceSatelliteActionTransfer removed. Its content is now saved into GovernanceSatelliteActionParameter

### New tables

- Aggregator/AggregatorFactory tables + GovernanceSatellite/Council/BreakGlass tables refactored
- LendingController/Vault/VaultFactory/TokenPoolReward tables
- dipdup_token_metadata: Metadata of all tokens in the system
- dipdup_contract_metadata: Metadata of all contracts in the system (due to a BCD bug, some contracts don't have their
  metadata)

</details>

<details><summary>0.13</summary>

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
  | Table | Old | New | | ----- | --- | --- | | GovernanceProposalData | governance_proposal_record |
  governance_proposal | | GovernanceProposalPayment | governance_proposal_record | governance_proposal | |
  GovernanceProposalVote | governance_proposal_record | governance_proposal | | LendingControllerVaultHandle |
  lending_controller_vault_record | lending_controller_vault | | LendingControllerVaultCollateralBalance |
  lending_controller_vault_record | lending_controller_vault | | TokenSaleBuyerOption | buyer_record | buyer |
- Foreign key name refactoring :
  | Relation | Old | New | | ----- | --- | --- | | MVKToken &rarr; Governance | mvk_token | mvk_tokens | | Doorman
  &rarr; MavrykUser | doorman_stake_account | doorman_stake_accounts | | Delegation &rarr; MavrykUser | satellite_record
  | satellite | | Council &rarr; MavrykUser | council_council_member | council_council_members | |
  CouncilActionParameter &rarr; CouncilAction | council_action_record_parameters | parameters | | CouncilCouncilMember
  &rarr; Council | council_council_member | member | | CouncilCouncilMember &rarr; MavrykUser | council_council_member |
  council_council_members | | CouncilAction &rarr; Council | council_action_records | actions | | VestingVestee &rarr;
  Vesting | vesting_vestee_records | vestees | | BreakGlassCouncilMember &rarr; MavrykUser | break_glass_council_member
  | break_glass_council_members | | BreakGlassCouncilMember &rarr; BreakGlass | break_glass_council_members |
  council_members | | BreakGlassAction &rarr; BreakGlass | break_glass_action_records | actions | |
  BreakGlassActionSigner &rarr; MavrykUser | break_glass_actions_signer | break_glass_action_signers | |
  BreakGlassActionParameter &rarr; BreakGlass | break_glass_action_parameters | parameters | | GovernanceProposal &rarr;
  Governance | governance_proposal_records | proposals | | GovernanceProposalData &rarr; GovernanceProposalo |
  proposal_data | data | | GovernanceProposalPayment &rarr; GovernanceProposal | proposal_payments | payments | |
  GovernanceSatelliteSnapshot &rarr; Governance | governance_satellite_snapshot_records | satellite_snapshots | |
  GovernanceSatelliteSnapshot &rarr; MavrykUser | governance_satellite_snapshot_records_votes |
  governance_satellite_snapshots | | GovernanceFinancialRequest &rarr; GovernanceFinancial |
  governance_financial_request_records | requests | | GovernanceSatelliteAction &rarr; GovernanceSatellite |
  governance_satellite_action_records | actions | | GovernanceSatelliteActionParameter &rarr; GovernanceSatelliteAction
  | governance_satellite_action_parameters | parameters | | GovernanceSatelliteActionTransfer &rarr;
  GovernanceSatelliteAction | governance_satellite_action_transfers | transfers | | GovernanceSatelliteAggregator &rarr;
  GovernanceSatellite | governance_satellite_aggregator_records | aggregators | | GovernanceSatelliteAggregatorOracle
  &rarr; GovernanceSatelliteAggregator | governance_satellite_satellite_oracle_records | oracles | |
  GovernanceSatelliteSatelliteOracle &rarr; GovernanceSatellite | governance_satellite_satellite_oracle_records |
  oracles | | MVKTransferHistoryData &rarr; MVKToken | mvk_transfer_history_data | transfer_history_data | |
  SMVKHistoryData &rarr; Doorman | smvk_history_data | staked_mvk_history_data | | StakeHistoryData &rarr; Doorman |
  stake_record | stake_history_data | | StakeHistoryData &rarr; MavrykUser | stake_record | stake_history_data | |
  LendingControllerReward &rarr; LendingController | reward_records | rewards | | LendingControllerLoanToken &rarr;
  LendingController | loan_token_records | loan_tokens | | LendingControllerLoanToken &rarr; Token #1 |
  lending_controller_loan_loan_token_records | lending_controller_loan_token | | LendingControllerLoanToken &rarr; Token
  # 2 | lending_controller_loan_loan_token_records | lending_controller_loan_token | | TokenSaleBuyer &rarr; TokenSale |
  token_sale_buyer_records | token_sale_buyers | | TokenSaleBuyer &rarr; MavrykUser | token_sale_buyer_records |
  token_sale_buyers | | TokenSaleBuyerOption &rarr; TokenSaleBuyOption | buyer_record_options | buyer_options | |
  VaultDepositor &rarr; Vault | depositor_records | depositors | | VaultDepositor &rarr; MavrykUser |
  vault_depositor_records | vault_depositors | | VestingVestee &rarr; Vesting | vestee_records | vestees | |
  VestingVestee &rarr; MavrykUser | vesting_vestee_records | vesting_vestees |

</details>

</details>
