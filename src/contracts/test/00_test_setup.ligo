// Shared Types
#include "../partials/shared/sharedTypes.ligo"

// Delegation contract
#include "../contracts/partials/contractTypes/mvkTokenTypes.ligo"

// Governance contract
#include "../contracts/partials/contractTypes/governanceTypes.ligo"

// Delegation contract
#include "../contracts/partials/contractTypes/delegationTypes.ligo"

// User addresses
const _                     = Test.reset_state(4n,(list[]: list(tez)));
const alice: address        = Test.nth_bootstrap_account(0);
const bob: address          = Test.nth_bootstrap_account(1);
const eve: address          = Test.nth_bootstrap_account(2);
const mallory: address      = Test.nth_bootstrap_account(3);

// Log functions
function logContract(const contractName: string): unit is
    Test.log(String.concat("📃 ", contractName));

function logEntrypoint(const entrypointName: string): unit is
    Test.log(String.concat("    ✍️  ", entrypointName));

function logTest(const testName: string): unit is
    Test.log(String.concat("      ✅ ", testName));

// Time functions
const blockTime: nat        = 30n;
const blocksPerCycle: nat   = 12n;
const cycleTime: nat        = blockTime * blocksPerCycle;

function secToCycle(const sec: nat): nat is
    if sec mod cycleTime =/= 0n then failwith("Given seconds must be a multiple of cycleTime") else sec / cycleTime;

function passTime(const sec: nat): unit is
    Test.bake_until_n_cycle_end(secToCycle(sec));

// Contract storages
const storages = {
    const doormanInitialStorage = record[
        admin                 = alice;
        generalContracts      = (Map.empty: generalContractsType);    // map of contract addresses
        whitelistContracts    = (Map.empty: whitelistContractsType);  // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
        metadata              = (Big_map.empty: metadata);
        token_metadata        = (Big_map.empty: tokenMetadataType);
        totalSupply           = mvkTotalSupply;
        maximumSupply         = 1_000_000_000_000_000_000n;
        ledger                = Big_map.literal (list [
            (alice, mvkTotalSupply/4);
            (bob, mvkTotalSupply/4);
            (eve, mvkTotalSupply/4);
            (mallory, mvkTotalSupply/4);
        ]);
        operators             = (Big_map.empty: operatorsType);
    ];
    const (doormanAddress, _, _) = Test.originate_from_file("contracts/main/doorman.ligo", "main", (nil: list(string)), Test.compile_value(doormanStorageType), 0tez);


    // MVK Token storage and origination
    const mvkTotalSupply: nat   = 1_000_000n;
    const mvkTokenInitialStorage = record[
        admin                 = alice;
        generalContracts      = (Map.empty: generalContractsType);    // map of contract addresses
        whitelistContracts    = (Map.empty: whitelistContractsType);  // whitelist of contracts that can access mint / onStakeChange entrypoints - doorman / vesting contract
        metadata              = (Big_map.empty: metadata);
        token_metadata        = (Big_map.empty: tokenMetadataType);
        totalSupply           = mvkTotalSupply;
        maximumSupply         = 1_000_000_000_000_000_000n;
        ledger                = Big_map.literal (list [
            (alice, mvkTotalSupply/4);
            (bob, mvkTotalSupply/4);
            (eve, mvkTotalSupply/4);
            (mallory, mvkTotalSupply/4);
        ]);
        operators             = (Big_map.empty: operatorsType);
    ];
    const (mvkTokenAddress, _, _) = Test.originate_from_file("contracts/main/mvkToken.ligo", "main", (nil: list(string)), Test.compile_value(mvkTokenInitialStorage), 0tez);

    // Governance Storage
    const governanceConfig = record[
            successReward               = 10000n;

            minProposalRoundVotePercentage  = 1000n;
            minProposalRoundVotesRequired   = 10000n;

            minQuorumPercentage         = 1000n;
            minYayVotePercentage        = 5100n;
            
            proposalSubmissionFee       = 10000000n;
            maxProposalsPerSatellite    = 20n;
            
            newBlockTimeLevel           = 0n;
            
            blocksPerProposalRound      = 14400n;
            blocksPerVotingRound        = 14400n;
            blocksPerTimelockRound      = 5760n;

            financialRequestApprovalPercentage  = 6700n;
            financialRequestDurationInDays      = 3n;
        ];
    const governanceInitialStorage = record[
        admin                       = alice;
        mvkTokenAddress             = mvkTokenAddress;
        metadata                    = (Big_map.empty: metadata);

        config                      = governanceConfig;

        whitelistContracts          = (Map.empty: whitelistContractsType);
        whitelistTokenContracts     = (Map.empty: whitelistTokenContractsType);
        generalContracts            = (Map.empty: generalContractsType);
        
        proposalLedger              = (Big_map.empty: proposalLedgerType);
        snapshotLedger              = (Big_map.empty: snapshotLedgerType);

        startLevel                  = 0n;
        nextProposalId              = 0n;
        cycleCounter                = 0n;

        currentCycleInfo.round                = Proposal;
        currentCycleInfo.blocksPerProposalRound      = 0n;
        currentCycleInfo.blocksPerVotingRound        = 0n;
        currentCycleInfo.blocksPerTimelockRound      = 0n;
        currentCycleInfo.roundStartLevel      = 0n;
        currentCycleInfo.roundEndLevel        = 0n;
        currentCycleInfo.cycleEndLevel        = 0n;
        currentCycleInfo.roundProposals       = (Map.empty: map(nat, nat));
        currentCycleInfo.roundVotes           = (Map.empty: map(address, nat));

        cycleHighestVotedProposalId  = 0n;
        timelockProposalId                  = 0n;

        snapshotStakedMvkTotalSupply   = 0n;

        financialRequestLedger             = (Big_map.empty: financialRequestLedgerType);
        financialRequestCounter            = 0n;

        governanceLambdaLedger      = (Big_map.empty: governanceLambdaLedgerType);

        tempFlag = 0n;  
    ]; 

    // Delegation Storage
    const delegationConfig = record[
        minimumStakedMvkBalance = 100000000n;
        delegationRatio         = 1000n;
        maxSatellites           = 100n;
    ];
    const delegationBreakGlass = record[
        delegateToSatelliteIsPaused      = False; 
        undelegateFromSatelliteIsPaused  = False;

        registerAsSatelliteIsPaused      = False;
        unregisterAsSatelliteIsPaused    = False;

        updateSatelliteRecordIsPaused    = False;
    ];
    const delegationInitialStorage = record[
        admin                = alice;
        mvkTokenAddress      = mvkTokenAddress;
        metadata             = (Big_map.empty: metadata);
        
        config               = delegationConfig;

        whitelistContracts   = (Map.empty: whitelistContractsType);
        generalContracts     = (Map.empty: generalContractsType);

        breakGlassConfig     = delegationBreakGlass;
        delegateLedger       = (Big_map.empty: delegateLedgerType);
        satelliteLedger      = (Map.empty: satelliteLedgerType);
    ];

    // Doorman Storage

} with (governanceInitialStorage, delegationInitialStorage)
