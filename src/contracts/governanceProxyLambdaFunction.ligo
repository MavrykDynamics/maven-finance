// ------------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------------

type setLambdaType is [@layout:comb] record [
    name                  : string;
    func_bytes            : bytes;
]
type farmTypeType is 
        Farm    of unit
    |   MFarm   of unit
type setFarmLambdaType is [@layout:comb] record [
    name                  : string;
    func_bytes            : bytes;
    farmType              : farmTypeType;
]

type updateMetadataType is [@layout:comb] record [
    metadataKey      : string;
    metadataHash     : bytes; 
]

type updateType is 
    |   Update of unit
    |   Remove of unit

type updateWhitelistContractsType is [@layout:comb] record [
    whitelistContractAddress  : address;
    updateType                : updateType;
]

type updateGeneralContractsType is [@layout:comb] record [
    generalContractName     : string;
    generalContractAddress  : address;
    updateType              : updateType;
]

type updateWhitelistTokenContractsType is [@layout:comb] record [
    tokenContractAddress  : address;
    updateType            : updateType;
]

type aggregatorUpdateConfigActionType is 
        ConfigDecimals                      of unit
    |   ConfigAlphaPercentPerThousand       of unit

    |   ConfigPercentOracleThreshold        of unit
    |   ConfigHeartbeatSeconds              of unit

    |   ConfigRewardAmountStakedMvn         of unit
    |   ConfigRewardAmountXtz               of unit

type aggregatorUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : nat; 
    updateConfigAction    : aggregatorUpdateConfigActionType;
]

type aggregatorFactoryUpdateConfigActionType is 
    | ConfigAggregatorNameMaxLength   of unit
    | Empty                           of unit

type aggregatorFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : nat; 
    updateConfigAction    : aggregatorFactoryUpdateConfigActionType;
]

type breakGlassUpdateConfigActionType is 
        ConfigThreshold               of unit
    |   ConfigActionExpiryDays        of unit
    |   ConfigCouncilNameMaxLength    of unit
    |   ConfigCouncilWebsiteMaxLength of unit
    |   ConfigCouncilImageMaxLength   of unit

type breakGlassUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : nat; 
    updateConfigAction    : breakGlassUpdateConfigActionType;
]

type councilUpdateConfigActionType is 
        ConfigThreshold                       of unit
    |   ConfigActionExpiryDays                of unit
    |   ConfigCouncilNameMaxLength            of unit
    |   ConfigCouncilWebsiteMaxLength         of unit
    |   ConfigCouncilImageMaxLength           of unit
    |   ConfigRequestTokenNameMaxLength       of unit
    |   ConfigRequestPurposeMaxLength         of unit

type councilUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue        : nat; 
    updateConfigAction          : councilUpdateConfigActionType;
]

type delegationUpdateConfigActionType is 
        ConfigMinimumStakedMvnBalance of unit
    |   ConfigDelegationRatio         of unit
    |   ConfigMaxSatellites           of unit
    |   ConfigSatNameMaxLength        of unit
    |   ConfigSatDescMaxLength        of unit
    |   ConfigSatImageMaxLength       of unit
    |   ConfigSatWebsiteMaxLength     of unit

type delegationUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : delegationUpdateConfigActionType;
]

type doormanUpdateConfigActionType is 
        ConfigMinMvnAmount          of unit
    |   Empty                       of unit

type doormanUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : doormanUpdateConfigActionType;
]

type emergencyUpdateConfigActionType is 
        ConfigDurationInMinutes         of unit
    |   ConfigRequiredFeeMumav          of unit
    |   ConfigStakedMvnPercentRequired  of unit
    |   ConfigMinStakedMvnForVoting     of unit
    |   ConfigMinStakedMvnToTrigger     of unit
    |   ConfigProposalTitleMaxLength    of unit
    |   ConfigProposalDescMaxLength     of unit

type emergencyUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : nat; 
    updateConfigAction    : emergencyUpdateConfigActionType;
]

type farmUpdateConfigActionType is 
        ConfigForceRewardFromTransfer of unit
    |   ConfigRewardPerBlock of unit
type farmUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : farmUpdateConfigActionType;
]

type farmFactoryUpdateConfigActionType is 
        ConfigFarmNameMaxLength of unit
    |   Empty                   of unit

type farmFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : farmFactoryUpdateConfigActionType;
]

type governanceUpdateConfigActionType is 
        ConfigSuccessReward               of unit
    |   ConfigCycleVotersReward           of unit
    |   ConfigMinProposalRoundVotePct     of unit
    |   ConfigMinQuorumPercentage         of unit
    |   ConfigMinYayVotePercentage        of unit
    |   ConfigProposeFeeMumav             of unit
    |   ConfigMaxProposalsPerSatellite    of unit
    |   ConfigBlocksPerProposalRound      of unit
    |   ConfigBlocksPerVotingRound        of unit
    |   ConfigBlocksPerTimelockRound      of unit
    |   ConfigDataTitleMaxLength          of unit
    |   ConfigProposalTitleMaxLength      of unit
    |   ConfigProposalDescMaxLength       of unit
    |   ConfigProposalInvoiceMaxLength    of unit
    |   ConfigProposalCodeMaxLength       of unit

type governanceUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : governanceUpdateConfigActionType;
]

type governanceFinancialUpdateConfigActionType is
    |   ConfigApprovalPercentage          of unit
    |   ConfigFinancialReqDurationDays    of unit

type governanceFinancialUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : governanceFinancialUpdateConfigActionType;
]

type governanceSatelliteUpdateConfigActionType is 
        ConfigApprovalPercentage          of unit
    |   ConfigActionDurationInDays        of unit
    |   ConfigPurposeMaxLength            of unit
    |   ConfigMaxActionsPerSatellite      of unit

type governanceSatelliteUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue  : nat; 
    updateConfigAction    : governanceSatelliteUpdateConfigActionType;
]

type lendingControllerUpdateConfigActionType is 
        ConfigCollateralRatio           of unit
    |   ConfigLiquidationRatio          of unit
    |   ConfigLiquidationFeePercent     of unit
    |   ConfigAdminLiquidationFee       of unit
    |   ConfigMinimumLoanFeePercent     of unit
    |   ConfigMinLoanFeeTreasuryShare   of unit
    |   ConfigInterestTreasuryShare     of unit
    |   ConfigLastCompletedDataMaxDelay of unit
    |   ConfigMaxVaultLiqPercent        of unit
    |   ConfigLiquidationDelayInMins    of unit
    |   ConfigLiquidationMaxDuration    of unit

type lendingControllerUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat;  
    updateConfigAction      : lendingControllerUpdateConfigActionType;
]

type treasuryFactoryUpdateConfigActionType is 
        ConfigTreasuryNameMaxLength of unit
    |   Empty                       of unit
type treasuryFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : treasuryFactoryUpdateConfigActionType;
]

type vaultFactoryUpdateConfigActionType is 
    |   ConfigVaultNameMaxLength of unit
    |   Empty                    of unit

type vaultFactoryUpdateConfigParamsType is [@layout:comb] record [
    updateConfigNewValue    : nat; 
    updateConfigAction      : vaultFactoryUpdateConfigActionType;
]

type aggregatorPausableEntrypointType is
        UpdateData                    of bool
    |   WithdrawRewardXtz             of bool
    |   WithdrawRewardStakedMvn       of bool

type aggregatorTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : aggregatorPausableEntrypointType;
    empty             : unit
];

type aggregatorFactoryPausableEntrypointType is
        CreateAggregator            of bool
    |   UntrackAggregator           of bool
    |   TrackAggregator             of bool
    |   DistributeRewardXtz         of bool
    |   DistributeRewardStakedMvn   of bool

type aggregatorFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint      : aggregatorFactoryPausableEntrypointType;
    empty                 : unit
];

type delegationPausableEntrypointType is
        DelegateToSatellite             of bool
    |   UndelegateFromSatellite         of bool
    |   RegisterAsSatellite             of bool
    |   UnregisterAsSatellite           of bool
    |   UpdateSatelliteRecord           of bool
    |   DistributeReward                of bool
    |   TakeSatellitesSnapshot          of bool

type delegationTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : delegationPausableEntrypointType;
    empty             : unit
];

type doormanPausableEntrypointType is
        StakeMvn                      of bool
    |   UnstakeMvn                    of bool
    |   Exit                          of bool
    |   Compound                      of bool
    |   FarmClaim                     of bool
    |   OnVaultDepositStake           of bool
    |   OnVaultWithdrawStake          of bool
    |   OnVaultLiquidateStake         of bool

type doormanTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : doormanPausableEntrypointType;
    empty             : unit
];

type farmPausableEntrypointType is
        Deposit     of bool
    |   Withdraw    of bool
    |   Claim       of bool

type farmTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : farmPausableEntrypointType;
    empty             : unit
];

type farmFactoryPausableEntrypointType is
        CreateFarm         of bool
    |   CreateFarmMToken   of bool
    |   UntrackFarm        of bool
    |   TrackFarm          of bool

type farmFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : farmFactoryPausableEntrypointType;
    empty             : unit
];

type lendingControllerPausableEntrypointType is

        // Lending Controller Admin Entrypoints
    |   SetLoanToken                of bool
    |   SetCollateralToken          of bool

        // Lending Controller Token Pool Entrypoints
    |   AddLiquidity                of bool
    |   RemoveLiquidity             of bool

        // Lending Controller Vault Entrypoints
    |   RegisterVaultCreation       of bool
    |   CloseVault                  of bool
    |   RegisterDeposit             of bool
    |   RegisterWithdrawal          of bool
    |   MarkForLiquidation          of bool
    |   LiquidateVault              of bool
    |   Borrow                      of bool
    |   Repay                       of bool

        // Vault Entrypoints
    |   VaultDeposit                of bool
    |   VaultWithdraw               of bool
    |   VaultOnLiquidate            of bool

        // Vault Staked Token Entrypoints
    |   VaultDepositStakedToken     of bool
    |   VaultWithdrawStakedToken    of bool

type lendingControllerTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : lendingControllerPausableEntrypointType;
    empty             : unit
];

type treasuryPausableEntrypointType is
        Transfer                       of bool   
    |   MintMvnAndTransfer             of bool
    |   UpdateTokenOperators           of bool
    |   StakeTokens                    of bool
    |   UnstakeTokens                  of bool

type treasuryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : treasuryPausableEntrypointType;
    empty             : unit
];

type treasuryFactoryPausableEntrypointType is
        CreateTreasury         of bool
    |   TrackTreasury          of bool
    |   UntrackTreasury        of bool

type treasuryFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : treasuryFactoryPausableEntrypointType;
    empty             : unit
];

type vaultFactoryPausableEntrypointType is
    |   CreateVault         of bool  
    |   Empty               of unit 

type vaultFactoryTogglePauseEntrypointType is [@layout:comb] record [
    targetEntrypoint  : vaultFactoryPausableEntrypointType;
    empty             : unit
];

type lpStandardType is
        Fa12 of unit
    |   Fa2 of unit

type farmLpTokenType is [@layout:comb] record [
    tokenAddress             : address;
    tokenId                  : nat;
    tokenStandard            : lpStandardType;
]
type farmPlannedRewardsType is [@layout:comb] record[
    totalBlocks              : nat;
    currentRewardPerBlock    : nat;
]
type createFarmType is [@layout:comb] record[
    name                     : string;
    addToGeneralContracts    : bool;
    forceRewardFromTransfer  : bool;
    infinite                 : bool;
    plannedRewards           : farmPlannedRewardsType;
    metadata                 : bytes;
    lpToken                  : farmLpTokenType;
]
type createFarmMTokenType is [@layout:comb] record[
    name                     : string;
    loanToken                : string;
    addToGeneralContracts    : bool;
    forceRewardFromTransfer  : bool;
    infinite                 : bool;
    plannedRewards           : farmPlannedRewardsType;
    metadata                 : bytes;
    lpToken                  : farmLpTokenType;
]

type initFarmParamsType is [@layout:comb] record[
    totalBlocks                 : nat;
    currentRewardPerBlock       : nat;
    forceRewardFromTransfer     : bool;
    infinite                    : bool;
]

type createTreasuryType is [@layout:comb] record[
    baker                   : option(key_hash); 
    name                    : string;
    addToGeneralContracts   : bool;
    metadata                : bytes;
]

type mavType             is unit
type fa12TokenType       is address
type fa2TokenType        is [@layout:comb] record [
    tokenContractAddress    : address;
    tokenId                 : nat;
]
type tokenType is
    |   Mav    of mavType         // unit
    |   Fa12   of fa12TokenType   // address
    |   Fa2    of fa2TokenType    // record [ tokenContractAddress : address; tokenId : nat; ]

type transferDestinationType is [@layout:comb] record[
    to_       : address;
    amount    : nat;
    token     : tokenType;
]

type transferActionType is list(transferDestinationType);

type mintMvnAndTransferType is [@layout:comb] record [
    to_             : address;
    amt             : nat;
]

type operatorParameterType is [@layout:comb] record[
    owner       : address;
    operator    : address;
    token_id    : nat;
]
type updateOperatorVariantType is 
        Add_operator    of operatorParameterType
    |   Remove_operator of operatorParameterType
type updateOperatorsType is list(updateOperatorVariantType)
type updateTokenOperatorsType is [@layout:comb] record [
    tokenContractAddress    : address;
    updateOperators         : updateOperatorsType;
]
type stakeTokensType is [@layout:comb] record [
    contractAddress  : address;
    amount           : nat;
]
type unstakeTokensType is [@layout:comb] record [
    contractAddress  : address;
    amount           : nat;
]

type aggregatorConfigType is [@layout:comb] record [
    decimals                            : nat;
    alphaPercentPerThousand             : nat;

    percentOracleThreshold              : nat;
    heartbeatSeconds                    : nat;

    rewardAmountStakedMvn               : nat;
    rewardAmountXtz                     : nat;
];
type oracleInformationType is [@layout:comb] record [
    oraclePublicKey  : key;
    oraclePeerId     : string;
];
type oracleLedgerType            is map (address, oracleInformationType);
type createAggregatorParamsType is [@layout:comb] record[
    name                    : string;
    addToGeneralContracts   : bool;

    oracleLedger            : oracleLedgerType;
    
    aggregatorConfig        : aggregatorConfigType;
    metadata                : bytes;
];

type addVesteeType is [@layout:comb] record [
    vesteeAddress               : address;
    totalAllocatedAmount        : nat;
    cliffInMonths               : nat;
    vestingInMonths             : nat;
]

type updateVesteeType is [@layout:comb] record [
    vesteeAddress               : address;
    newTotalAllocatedAmount     : nat;
    newCliffInMonths            : nat;
    newVestingInMonths          : nat;
]

type createLoanTokenActionType is [@layout:comb] record [
    tokenName                               : string;
    tokenDecimals                           : nat;

    oracleAddress                           : address;

    mTokenAddress                           : address;

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink
    minRepaymentAmount                      : nat; 

    // variants at the end for taquito 
    tokenType                               : tokenType; 
]

type updateLoanTokenActionType is [@layout:comb] record [

    tokenName                               : string;

    oracleAddress                           : address;

    reserveRatio                            : nat;  // percentage of token pool that should be kept as reserves for liquidity 
    optimalUtilisationRate                  : nat;  // kink point
    baseInterestRate                        : nat;  // base interest rate
    maxInterestRate                         : nat;  // max interest rate
    interestRateBelowOptimalUtilisation     : nat;  // interest rate below kink
    interestRateAboveOptimalUtilisation     : nat;  // interest rate above kink
    minRepaymentAmount                      : nat; 

    isPaused                                : bool;
]

type setLoanTokenType is 
    |   CreateLoanToken      of createLoanTokenActionType
    |   UpdateLoanToken      of updateLoanTokenActionType

type setLoanTokenActionType is [@layout:comb] record [
    action      : setLoanTokenType;
    empty       : unit;
]

type createCollateralTokenActionType is [@layout:comb] record [
    tokenName               : string;
    tokenContractAddress    : address;
    tokenDecimals           : nat; 

    oracleAddress           : address;  
    protected               : bool;
    
    isScaledToken           : bool; // mToken
    
    // To extend functionality beyond sMVN to other staked tokens in future
    isStakedToken           : bool;
    stakingContractAddress  : option(address);

    maxDepositAmount        : option(nat);

    // variants at the end for taquito 
    tokenType               : tokenType; 
]

type updateCollateralTokenActionType is [@layout:comb] record [
    tokenName               : string;
    oracleAddress           : address;  
    isPaused                : bool;
    stakingContractAddress  : option(address);
    maxDepositAmount        : option(nat);
]

type setCollateralTokenType is 
    |   CreateCollateralToken      of createCollateralTokenActionType
    |   UpdateCollateralToken      of updateCollateralTokenActionType

type setCollateralTokenActionType is [@layout:comb] record [
    action      : setCollateralTokenType;
    empty       : unit;
]

type actionType is 
        // Default Entrypoint to Receive Mav
        Default                       of unit
    |   Empty                         of unit

const noOperations : list (operation) = nil;
type return is list (operation) * unit;

(* lamdda function *)
function lambdaFunction (const _ : unit) : list(operation) is
block {
    const contractOperation : operation = Mavryk.transaction(
        record[
            name                     = "mUSDT";
            loanToken                = "usdt";
            addToGeneralContracts    = True;
            forceRewardFromTransfer  = False;
            infinite                 = True;
            plannedRewards           = record[
                totalBlocks              = (100000000n: nat);
                currentRewardPerBlock    = 100000000n;
            ];
            metadata                 = ("[object Object]": bytes);
            lpToken                  = record[
                tokenAddress             = ("KT1EuLW9vTwU8KtBuf9v4TzWEsRqMQZtDTgw" : address);
                tokenId                  = 0n;
                tokenStandard            = (Fa2: lpStandardType);
            ];
        ],
        0mav,
        case (Mavryk.get_entrypoint_opt(
            "%createFarmMToken",
            ("KT1HHqP3swDpU4fQRZRquPN77aFSxAfrJVQM" : address)) : option(contract(createFarmMTokenType))) of [
                    Some(contr) -> contr
                |   None        -> (failwith("error_CREATE_FARM_M_TOKEN_THROUGH_PROXY_LAMBDA_FAIL"))
        ]
    );
} with list[contractOperation]

(* main entrypoint *)
function main (const action : actionType; const s : unit) : return is

    case action of [

            // Housekeeping Entrypoints
            Default (_parameters)                -> (lambdaFunction(), s)
        |   Empty (_parameters)                  -> ((nil : list(operation)), s)

    ]

;