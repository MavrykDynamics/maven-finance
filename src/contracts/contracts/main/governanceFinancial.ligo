// ------------------------------------------------------------------------------
// Error Codes
// ------------------------------------------------------------------------------

// Error Codes
#include "../partials/errors.ligo"

// ------------------------------------------------------------------------------
// Shared Helpers and Types
// ------------------------------------------------------------------------------

// Shared Helpers
#include "../partials/shared/sharedHelpers.ligo"

// Transfer Helpers
#include "../partials/shared/transferHelpers.ligo"

// Permission Helpers
#include "../partials/shared/permissionHelpers.ligo"

// Votes Helpers
#include "../partials/shared/voteHelpers.ligo"

// ------------------------------------------------------------------------------
// Contract Types
// ------------------------------------------------------------------------------

// MvkToken Types
#include "../partials/contractTypes/mvkTokenTypes.ligo"

// Treasury Type for mint and transfers
#include "../partials/contractTypes/treasuryTypes.ligo"

// Council Type for financial requests
#include "../partials/contractTypes/councilTypes.ligo"

// Delegation Types
#include "../partials/contractTypes/delegationTypes.ligo"

// Governance Types
#include "../partials/contractTypes/governanceTypes.ligo"

// Governance Financial Type
#include "../partials/contractTypes/governanceFinancialTypes.ligo"

// ------------------------------------------------------------------------------

type governanceFinancialAction is 

        // Housekeeping Entrypoints
    |   SetAdmin                        of (address)
    |   SetGovernance                   of (address)
    |   UpdateMetadata                  of updateMetadataType
    |   UpdateConfig                    of governanceFinancialUpdateConfigParamsType
    |   UpdateWhitelistContracts        of updateWhitelistContractsType
    |   UpdateGeneralContracts          of updateGeneralContractsType    
    |   UpdateWhitelistTokenContracts   of updateWhitelistTokenContractsType
    |   MistakenTransfer                of transferActionType

        // Financial Governance Entrypoints
    |   RequestTokens                   of councilActionRequestTokensType
    |   RequestMint                     of councilActionRequestMintType
    |   SetContractBaker                of councilActionSetContractBakerType
    |   DropFinancialRequest            of (nat)
    |   VoteForRequest                  of voteForRequestType

        // Lambda Entrypoints
    |   SetLambda                       of setLambdaType


const noOperations : list (operation) = nil;
type return is list (operation) * governanceFinancialStorageType

// governance contract methods lambdas
type governanceUnpackLambdaFunctionType is (governanceFinancialLambdaActionType * governanceFinancialStorageType) -> return



// ------------------------------------------------------------------------------
//
// Constants Begin
//
// ------------------------------------------------------------------------------

const maxRoundDuration : nat = 20_160n; // One week with blockTime = 30sec

// ------------------------------------------------------------------------------
//
// Constants End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Governance Contract
function checkSenderIsAllowed(var s : governanceFinancialStorageType) : unit is
    if (Tezos.get_sender() = s.admin or Tezos.get_sender() = s.governanceAddress) then unit
    else failwith(error_ONLY_ADMINISTRATOR_OR_GOVERNANCE_ALLOWED);
        


// Allowed Senders : Admin
function checkSenderIsAdmin(var s : governanceFinancialStorageType) : unit is
    if (Tezos.get_sender() = s.admin) then unit
    else failwith(error_ONLY_ADMINISTRATOR_ALLOWED);



// Allowed Senders : Admin, Governance Satellite Contract
function checkSenderIsAdminOrGovernanceSatelliteContract(var s : governanceFinancialStorageType) : unit is
block{

    if Tezos.get_sender() = s.admin then skip
    else {
        
        const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);

        if Tezos.get_sender() = governanceSatelliteAddress then skip
        else failwith(error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);

    }

} with unit



// Allowed Senders : Self
function checkSenderIsSelf(const _p : unit) : unit is
    if (Tezos.get_sender() = Tezos.get_self_address()) then unit
    else failwith(error_ONLY_SELF_ALLOWED);



// Allowed Senders : Doorman Contract
function checkSenderIsDoormanContract(var s : governanceFinancialStorageType) : unit is
block{
    
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);
    
    if (Tezos.get_sender() = doormanAddress) then skip
    else failwith(error_ONLY_DOORMAN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : Delegation Contract
function checkSenderIsDelegationContract(var s : governanceFinancialStorageType) : unit is
block{

    const delegationAddress : address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = delegationAddress) then skip
    else failwith(error_ONLY_DELEGATION_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : MVK Token Contract
function checkSenderIsMvkTokenContract(var s : governanceFinancialStorageType) : unit is
block{

    const mvkTokenAddress : address = s.mvkTokenAddress;

    if (Tezos.get_sender() = mvkTokenAddress) then skip
    else failwith(error_ONLY_MVK_TOKEN_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : Council Contract
function checkSenderIsCouncilContract(var s : governanceFinancialStorageType) : unit is
block{

  const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);
  
  if (Tezos.get_sender() = councilAddress) then skip
  else failwith(error_ONLY_COUNCIL_CONTRACT_ALLOWED);

} with unit



// Allowed Senders : Emergency Governance Contract
function checkSenderIsEmergencyGovernanceContract(var s : governanceFinancialStorageType) : unit is
block{

    const emergencyGovernanceAddress : address = getContractAddressFromGovernanceContract("emergencyGovernance", s.governanceAddress, error_EMERGENCY_GOVERNANCE_CONTRACT_NOT_FOUND);

    if (Tezos.get_sender() = emergencyGovernanceAddress) then skip
    else failwith(error_ONLY_EMERGENCY_GOVERNANCE_CONTRACT_ALLOWED);

} with unit



// Check that no Tezos is sent to the entrypoint
function checkNoAmount(const _p : unit) : unit is
    if (Tezos.get_amount() = 0tez) then unit
    else failwith(error_ENTRYPOINT_SHOULD_NOT_RECEIVE_TEZ);

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// governance proxy lamba helper function to get setAdmin entrypoint
function getSetAdminEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setAdmin",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_ADMIN_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];



// governance proxy lamba helper function to get setGovernance entrypoint
function getSetGovernanceEntrypoint(const contractAddress : address) : contract(address) is
    case (Tezos.get_entrypoint_opt(
        "%setGovernance",
        contractAddress) : option(contract(address))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_GOVERNANCE_ENTRYPOINT_NOT_FOUND) : contract(address))
        ];


      
// governance proxy lamba helper function to get executeGovernanceProposal entrypoint
function getExecuteGovernanceActionEntrypoint(const contractAddress : address) : contract(bytes) is
    case (Tezos.get_entrypoint_opt(
        "%executeGovernanceAction",
        contractAddress) : option(contract(bytes))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_EXECUTE_GOVERNANCE_ACTION_ENTRYPOINT_IN_GOVERNANCE_PROXY_CONTRACT_NOT_FOUND) : contract(bytes))
        ];



// helper function to send transfer operation to treasury
function sendTransferOperationToTreasury(const contractAddress : address) : contract(transferActionType) is
    case (Tezos.get_entrypoint_opt(
        "%transfer",
        contractAddress) : option(contract(transferActionType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(transferActionType))
        ];



// helper function to send mint MVK and transfer operation to treasury
function sendMintMvkAndTransferOperationToTreasury(const contractAddress : address) : contract(mintMvkAndTransferType) is
    case (Tezos.get_entrypoint_opt(
        "%mintMvkAndTransfer",
        contractAddress) : option(contract(mintMvkAndTransferType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_MINT_MVK_AND_TRANSFER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(mintMvkAndTransferType))
        ];



// helper function to set baker for treasury
function setTreasuryBaker(const contractAddress : address) : contract(setBakerType) is
    case (Tezos.get_entrypoint_opt(
        "%setBaker",
        contractAddress) : option(contract(setBakerType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_SET_BAKER_ENTRYPOINT_IN_TREASURY_CONTRACT_NOT_FOUND) : contract(setBakerType))
        ];



// helper function to %updateSatelliteSnapshot entrypoint on the Governance contract
function sendUpdateSatelliteSnapshotOperationToGovernance(const governanceAddress : address) : contract(updateSatelliteSnapshotType) is
    case (Tezos.get_entrypoint_opt(
        "%updateSatelliteSnapshot",
        governanceAddress) : option(contract(updateSatelliteSnapshotType))) of [
                Some(contr) -> contr
            |   None -> (failwith(error_UPDATE_SATELLITE_SNAPSHOT_ENTRYPOINT_IN_GOVERNANCE_CONTRACT_NOT_FOUND) : contract(updateSatelliteSnapshotType))
        ];

// ------------------------------------------------------------------------------
// Entrypoint Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Governance Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to check if a satellite can interact with an request
function checkRequestInteraction(const requestRecord : financialRequestRecordType) : unit is
block {

    // Check if financial request has been dropped
    if requestRecord.status    = False then failwith(error_FINANCIAL_REQUEST_DROPPED)  else skip;

    // Check if financial request has already been executed
    if requestRecord.executed  = True  then failwith(error_FINANCIAL_REQUEST_EXECUTED) else skip;

    // Check if financial request has expired
    if Tezos.get_now() > requestRecord.expiryDateTime then failwith(error_FINANCIAL_REQUEST_EXPIRED) else skip;

} with (unit)



// helper function to get a satellite total voting power from its snapshot on the governance contract
function getTotalVotingPowerAndUpdateSnapshot(const satelliteAddress : address; var operations : list(operation); const s : governanceFinancialStorageType): (nat * list(operation)) is 
block{

    // Get the current cycle from the governance contract to check if the snapshot is up to date
    const cycleIdView : option (nat) = Tezos.call_view ("getCycleCounter", unit, s.governanceAddress);
    const currentCycle: nat = case cycleIdView of [
            Some (_cycle)   -> _cycle
        |   None            -> failwith (error_GET_CYCLE_COUNTER_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Get the snapshot from the governance contract
    const snapshotOptView : option (option(governanceSatelliteSnapshotRecordType)) = Tezos.call_view ("getSnapshotOpt", (currentCycle,satelliteAddress), s.governanceAddress);
    const satelliteSnapshotOpt: option(governanceSatelliteSnapshotRecordType) = case snapshotOptView of [
            Some (_snapshotOpt) -> _snapshotOpt
        |   None                -> failwith (error_GET_SNAPSHOT_OPT_VIEW_IN_GOVERNANCE_CONTRACT_NOT_FOUND)
    ];

    // Check if a snapshot needs to be created
    const createSatelliteSnapshot: bool = case satelliteSnapshotOpt of [
        Some (_snapshot)    -> False
    |   None                -> True
    ];

    // Get the total voting power from the snapshot
    var totalVotingPower: nat   := case satelliteSnapshotOpt of [
        Some (_snapshot)    -> _snapshot.totalVotingPower
    |   None                -> 0n
    ];

    // Create or not a snapshot
    if createSatelliteSnapshot then{

        // Get the delegation address
        const delegationAddress: address = getContractAddressFromGovernanceContract("delegation", s.governanceAddress, error_DELEGATION_CONTRACT_NOT_FOUND);

        // Get the satellite record
        const satelliteOptView : option (option(satelliteRecordType))   = Tezos.call_view ("getSatelliteOpt", satelliteAddress, delegationAddress);
        const _satelliteRecord: satelliteRecordType                     = case satelliteOptView of [
                Some (value) -> case value of [
                        Some (_satellite) -> _satellite
                    |   None              -> failwith(error_SATELLITE_NOT_FOUND)
                ]
            |   None -> failwith (error_GET_SATELLITE_OPT_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        // Get the delegation ratio
        const configView : option (delegationConfigType)    = Tezos.call_view ("getConfig", unit, delegationAddress);
        const delegationRatio: nat                          = case configView of [
                Some (_config) -> _config.delegationRatio
            |   None -> failwith (error_GET_CONFIG_VIEW_IN_DELEGATION_CONTRACT_NOT_FOUND)
        ];

        // Create a snapshot
        const satelliteSnapshotParams: updateSatelliteSnapshotType  = record[
            satelliteAddress    = satelliteAddress;
            satelliteRecord     = _satelliteRecord;
            ready               = True;
            delegationRatio     = delegationRatio;
        ];

        // Send the snapshot to the governance contract
        const updateSnapshotOperation : operation   = Tezos.transaction(
            (satelliteSnapshotParams),
            0tez, 
            sendUpdateSatelliteSnapshotOperationToGovernance(s.governanceAddress)
        );
        operations   := updateSnapshotOperation # operations;

        // Pre-calculate the total voting power of the satellite
        totalVotingPower    := calculateVotingPower(delegationRatio, _satelliteRecord.stakedMvkBalance, _satelliteRecord.totalDelegatedAmount);

    } 
    // Check if satellite is ready to vote
    else case satelliteSnapshotOpt of [
        Some (_snapshot)    -> if _snapshot.ready then skip else failwith(error_SNAPSHOT_NOT_READY)
    |   None                -> skip
    ];

} with(totalVotingPower, operations)



// Helper function to create a governance financial request
function createGovernanceFinancialRequest(const requestType : string; const treasuryAddress : address; const tokenContractAddress : address; const tokenAmount : tokenBalanceType; const tokenName : string; const tokenType : string; const tokenId : tokenIdType; const keyHash : option(key_hash); const purpose : string; var s : governanceFinancialStorageType): governanceFinancialStorageType is
block{

    // ------------------------------------------------------------------
    // Get necessary contracts and info
    // ------------------------------------------------------------------

    // Get Doorman Contract address from the General Contracts Map on the Governance Contract
    const doormanAddress : address = getContractAddressFromGovernanceContract("doorman", s.governanceAddress, error_DOORMAN_CONTRACT_NOT_FOUND);

    // ------------------------------------------------------------------
    // Snapshot Staked MVK Total Supply
    // ------------------------------------------------------------------

    // Take snapshot of current total staked MVK supply 
    const getBalanceView : option (nat)         = Tezos.call_view ("get_balance", (doormanAddress, 0n), s.mvkTokenAddress);
    const snapshotStakedMvkTotalSupply: nat     = case getBalanceView of [
            Some (value) -> value
        |   None         -> (failwith (error_GET_BALANCE_VIEW_IN_MVK_TOKEN_CONTRACT_NOT_FOUND) : nat)
    ];

    // Calculate staked MVK votes required for approval based on config's financial request approval percentage
    const stakedMvkRequiredForApproval : nat     = abs((snapshotStakedMvkTotalSupply * s.config.financialRequestApprovalPercentage) / 10000);

    // ------------------------------------------------------------------
    // Validation Checks 
    // ------------------------------------------------------------------

    // Check if token type provided matches the standard (FA12, FA2, TEZ)
    if tokenType = "FA12" or tokenType = "FA2" or tokenType = "TEZ" then skip
    else failwith(error_WRONG_TOKEN_TYPE_PROVIDED);

    // If tokens are requested, check if token contract is whitelisted (security measure to prevent interacting with potentially malicious contracts)
    if tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(tokenContractAddress, s.whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else skip;

    // ------------------------------------------------------------------
    // Create new Financial Request Record
    // ------------------------------------------------------------------

    // Create new financial request record
    var newFinancialRequest : financialRequestRecordType := record [

        requesterAddress                    = Tezos.get_sender();
        requestType                         = requestType;
        status                              = True;                  // status : True - "ACTIVE", False - "INACTIVE/DROPPED"
        executed                            = False;

        treasuryAddress                     = treasuryAddress;
        tokenContractAddress                = tokenContractAddress;
        tokenAmount                         = tokenAmount;
        tokenName                           = tokenName; 
        tokenType                           = tokenType;
        tokenId                             = tokenId;
        requestPurpose                      = purpose;
        voters                              = set[];
        keyHash                             = keyHash;

        yayVoteStakedMvkTotal               = 0n;
        nayVoteStakedMvkTotal               = 0n;
        passVoteStakedMvkTotal              = 0n;

        snapshotStakedMvkTotalSupply        = snapshotStakedMvkTotalSupply;
        stakedMvkPercentageForApproval      = s.config.financialRequestApprovalPercentage; 
        stakedMvkRequiredForApproval        = stakedMvkRequiredForApproval; 

        requestedDateTime                   = Tezos.get_now();               
        expiryDateTime                      = Tezos.get_now() + (86_400 * s.config.financialRequestDurationInDays);
    
    ];

    // ------------------------------------------------------------------
    // Update Storage
    // ------------------------------------------------------------------

    // Get current financial request counter
    const financialRequestId : nat = s.financialRequestCounter;

    // Save request to financial request ledger
    s.financialRequestLedger[financialRequestId] := newFinancialRequest;

    // Increment financial request counter
    s.financialRequestCounter := financialRequestId + 1n;

} with (s)

// ------------------------------------------------------------------------------
// Governance Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Vote Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to trigger the transfer request during the vote
function triggerTransferRequest(const requestRecord : financialRequestRecordType; var operations : list(operation); const s : governanceFinancialStorageType) : list(operation) is 
block {

    // Get Treasury Contract from params
    const treasuryAddress : address = requestRecord.treasuryAddress;

    // Get Council Contract address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);


    // ------------ Set Token Type ------------
    var _tokenTransferType : tokenType := Tez;

    if  requestRecord.tokenType = "FA12" 
    then block {
        _tokenTransferType := (Fa12(requestRecord.tokenContractAddress) : tokenType);
    } 
    else skip;

    if  requestRecord.tokenType = "FA2" 
    then block {
        _tokenTransferType := (Fa2(record [
            tokenContractAddress  = requestRecord.tokenContractAddress;
            tokenId               = requestRecord.tokenId;
        ]) : tokenType); 
    } 
    else skip;
    // ----------------------------------------

    // If tokens are to be transferred, check if token contract is whitelisted (security measure to prevent interacting with potentially malicious contracts)
    if requestRecord.tokenType =/= "TEZ" and not checkInWhitelistTokenContracts(requestRecord.tokenContractAddress, s.whitelistTokenContracts) then failwith(error_TOKEN_NOT_WHITELISTED) else skip;

    // Create transfer token params and operation
    const transferTokenParams : transferActionType = list [
        record [
            to_        = councilAddress;
            token      = _tokenTransferType;
            amount     = requestRecord.tokenAmount;
        ]
    ];

    const treasuryTransferOperation : operation = Tezos.transaction(
        transferTokenParams, 
        0tez, 
        sendTransferOperationToTreasury(treasuryAddress)
    );

    operations := treasuryTransferOperation # operations;

} with (operations)



// helper function to trigger the mint request during the vote
function triggerMintRequest(const requestRecord : financialRequestRecordType; var operations : list(operation); const s : governanceFinancialStorageType) : list(operation) is 
block {

    // Get Treasury Contract from params
    const treasuryAddress : address = requestRecord.treasuryAddress;

    // Get Council Contract address from the General Contracts Map on the Governance Contract
    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);

    // Create mint operation
    const mintMvkAndTransferTokenParams : mintMvkAndTransferType = record [
        to_  = councilAddress;
        amt  = requestRecord.tokenAmount;
    ];

    const treasuryMintMvkAndTransferOperation : operation = Tezos.transaction(
        mintMvkAndTransferTokenParams, 
        0tez, 
        sendMintMvkAndTransferOperationToTreasury(treasuryAddress)
    );

    operations := treasuryMintMvkAndTransferOperation # operations;

} with (operations)



// helper function to trigger the set contract baker request during the vote
function triggerSetContractBakerRequest(const requestRecord : financialRequestRecordType; var operations : list(operation)) : list(operation) is 
block {

    const keyHash : option(key_hash) = requestRecord.keyHash;
    const setContractBakerOperation : operation = Tezos.transaction(
        keyHash, 
        0tez, 
        setTreasuryBaker(requestRecord.treasuryAddress)
    );

    operations := setContractBakerOperation # operations;

} with (operations)



// helper function to execute a governance request during the vote
function executeGovernanceFinancialRequest(var requestRecord : financialRequestRecordType; const requestId : actionIdType; var operations : list(operation); var s : governanceFinancialStorageType) : return is
block {

    // Financial Request Type - "TRANSFER"
    if requestRecord.requestType = "TRANSFER" then operations            := triggerTransferRequest(requestRecord, operations, s);

    // Financial Request Type - "MINT"
    if requestRecord.requestType = "MINT" then operations                := triggerMintRequest(requestRecord, operations, s);

    // Financial Request Type - "SET_CONTRACT_BAKER"
    if requestRecord.requestType = "SET_CONTRACT_BAKER" then operations  := triggerSetContractBakerRequest(requestRecord, operations);

    // Update financial request - set executed boolean to true
    requestRecord.executed := True;
    s.financialRequestLedger[requestId] := requestRecord;

} with (operations, s)

// ------------------------------------------------------------------------------
// Vote Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const governanceFinancialLambdaAction : governanceFinancialLambdaActionType; var s : governanceFinancialStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(governanceUnpackLambdaFunctionType)) of [
            Some(f) -> f(governanceFinancialLambdaAction, s)
        |   None    -> failwith(error_UNABLE_TO_UNPACK_LAMBDA)
    ];

} with (res.0, res.1)

// ------------------------------------------------------------------------------
// Lambda Helper Functions End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Helper Functions End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Views Begin
//
// ------------------------------------------------------------------------------

(* View: get admin variable *)
[@view] function getAdmin(const _ : unit; var s : governanceFinancialStorageType) : address is
    s.admin



(* View: get config *)
[@view] function getConfig(const _ : unit; var s : governanceFinancialStorageType) : governanceFinancialConfigType is
    s.config



(* View: get Governance address *)
[@view] function getGovernanceAddress(const _ : unit; var s : governanceFinancialStorageType) : address is
    s.governanceAddress



(* View: get Whitelist token contracts *)
[@view] function getWhitelistTokenContracts(const _ : unit; var s : governanceFinancialStorageType) : whitelistTokenContractsType is
    s.whitelistTokenContracts



(* View: get general contracts *)
[@view] function getGeneralContracts(const _ : unit; var s : governanceFinancialStorageType) : generalContractsType is
    s.generalContracts



(* View: get whitelist contracts *)
[@view] function getWhitelistContracts (const _ : unit; const s : governanceFinancialStorageType) : whitelistContractsType is 
    s.whitelistContracts



(* View: get a financial request *)
[@view] function getFinancialRequestOpt(const requestId : nat; var s : governanceFinancialStorageType) : option(financialRequestRecordType) is
    Big_map.find_opt(requestId, s.financialRequestLedger)



(* View: get financial request counter *)
[@view] function getFinancialRequestCounter(const _ : unit; var s : governanceFinancialStorageType) : nat is
    s.financialRequestCounter



(* View: get a financial request voter *)
[@view] function getFinancialRequestVoterOpt(const requestIdAndVoter : (actionIdType*address); var s : governanceFinancialStorageType) : option(voteType) is
    Big_map.find_opt(requestIdAndVoter, s.financialRequestVoters)



(* View: get a lambda *)
[@view] function getLambdaOpt(const lambdaName : string; var s : governanceFinancialStorageType) : option(bytes) is
    Map.find_opt(lambdaName, s.lambdaLedger)



(* View: get the lambda ledger *)
[@view] function getLambdaLedger(const _ : unit; var s : governanceFinancialStorageType) : lambdaLedgerType is
    s.lambdaLedger

// ------------------------------------------------------------------------------
//
// Views End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Lambda Helpers Begin
//
// ------------------------------------------------------------------------------

// Governance Financial Contract Lambdas :
#include "../partials/contractLambdas/governanceFinancial/governanceFinancialLambdas.ligo"

// ------------------------------------------------------------------------------
//
// Lambda Helpers End
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
//
// Entrypoints Begin
//
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Housekeeping Entrypoints Begin
// ------------------------------------------------------------------------------

(*  setAdmin entrypoint *)
function setAdmin(const newAdminAddress : address; var s : governanceFinancialStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetAdmin"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetAdmin(newAdminAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response




(*  setGovernance entrypoint *)
function setGovernance(const newGovernanceProxyAddress : address; var s : governanceFinancialStorageType) : return is
block {
    
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetGovernance"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetGovernance(newGovernanceProxyAddress);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (* updateMetadata entrypoint - update the metadata at a given key *)
function updateMetadata(const updateMetadataParams : updateMetadataType; var s : governanceFinancialStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateMetadata"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateMetadata(updateMetadataParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (*  updateConfig entrypoint *)
function updateConfig(const updateConfigParams : governanceFinancialUpdateConfigParamsType; var s : governanceFinancialStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateConfig"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateConfig(updateConfigParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);
    
} with response



(*  updateWhitelistContracts entrypoint *)
function updateWhitelistContracts(const updateWhitelistContractsParams : updateWhitelistContractsType; var s : governanceFinancialStorageType) : return is
block {
        
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init farmFactory lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateWhitelistContracts(updateWhitelistContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);  

} with response



// (*  updateGeneralContracts entrypoint *)
function updateGeneralContracts(const updateGeneralContractsParams : updateGeneralContractsType; var s : governanceFinancialStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateGeneralContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateGeneralContracts(updateGeneralContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



// (*  updateWhitelistTokenContracts entrypoint *)
function updateWhitelistTokenContracts(const updateWhitelistTokenContractsParams : updateWhitelistTokenContractsType; var s : governanceFinancialStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaUpdateWhitelistTokenContracts"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaUpdateWhitelistTokens(updateWhitelistTokenContractsParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(*  mistakenTransfer entrypoint *)
function mistakenTransfer(const destinationParams : transferActionType; var s : governanceFinancialStorageType) : return is
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaMistakenTransfer"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaMistakenTransfer(destinationParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);  

} with response

// ------------------------------------------------------------------------------
// Housekeeping Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Financial Governance Entrypoints Begin
// ------------------------------------------------------------------------------

(* requestTokens entrypoint *)
function requestTokens(const requestTokensParams : councilActionRequestTokensType; var s : governanceFinancialStorageType) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestTokens"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaRequestTokens(requestTokensParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* requestMint entrypoint *)
function requestMint(const requestMintParams : councilActionRequestMintType; var s : governanceFinancialStorageType) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaRequestMint"] of [
        |   Some(_v) -> _v
        |    None    -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaRequestMint(requestMintParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* setContractBaker entrypoint *)
function setContractBaker(const setContractBakerParams : councilActionSetContractBakerType; var s : governanceFinancialStorageType) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaSetContractBaker"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaSetContractBaker(setContractBakerParams);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* dropFinancialRequest entrypoint *)
function dropFinancialRequest(const requestId : nat; var s : governanceFinancialStorageType) : return is 
block {

    const lambdaBytes : bytes = case s.lambdaLedger["lambdaDropFinancialRequest"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaDropFinancialRequest(requestId);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);

} with response



(* voteForRequest entrypoint *)
function voteForRequest(const voteForRequest : voteForRequestType; var s : governanceFinancialStorageType) : return is 
block {
  
    const lambdaBytes : bytes = case s.lambdaLedger["lambdaVoteForRequest"] of [
        |   Some(_v) -> _v
        |   None     -> failwith(error_LAMBDA_NOT_FOUND)
    ];

    // init governance financial lambda action
    const governanceFinancialLambdaAction : governanceFinancialLambdaActionType = LambdaVoteForRequest(voteForRequest);

    // init response
    const response : return = unpackLambda(lambdaBytes, governanceFinancialLambdaAction, s);
  
} with response

// ------------------------------------------------------------------------------
// Financial Governance Entrypoints End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Entrypoints Begin
// ------------------------------------------------------------------------------

(* setLambda entrypoint *)
function setLambda(const setLambdaParams : setLambdaType; var s : governanceFinancialStorageType) : return is
block{
    
    // check that sender is admin
    checkSenderIsAdmin(s);
    
    // assign params to constants for better code readability
    const lambdaName    = setLambdaParams.name;
    const lambdaBytes   = setLambdaParams.func_bytes;

    // set lambda in lambdaLedger - allow override of lambdas
    s.lambdaLedger[lambdaName] := lambdaBytes;

} with (noOperations, s)

// ------------------------------------------------------------------------------
// Lambda Entrypoints End
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
//
// Entrypoints End
//
// ------------------------------------------------------------------------------

(* main entrypoint *)
function main (const action : governanceFinancialAction; const s : governanceFinancialStorageType) : return is 

    case action of [
            
            // Housekeeping Entrypoints
        |   SetAdmin(parameters)                        -> setAdmin(parameters, s)
        |   SetGovernance(parameters)                   -> setGovernance(parameters, s)
        |   UpdateMetadata(parameters)                  -> updateMetadata(parameters, s)
        |   UpdateConfig(parameters)                    -> updateConfig(parameters, s)
        |   UpdateWhitelistContracts(parameters)        -> updateWhitelistContracts(parameters, s)
        |   UpdateGeneralContracts(parameters)          -> updateGeneralContracts(parameters, s)        
        |   UpdateWhitelistTokenContracts(parameters)   -> updateWhitelistTokenContracts(parameters, s)
        |   MistakenTransfer(parameters)                -> mistakenTransfer(parameters, s)

            // Financial Governance Entrypoints
        |   RequestTokens(parameters)                   -> requestTokens(parameters, s)
        |   RequestMint(parameters)                     -> requestMint(parameters, s)
        |   SetContractBaker(parameters)                -> setContractBaker(parameters, s)
        |   DropFinancialRequest(parameters)            -> dropFinancialRequest(parameters, s)
        |   VoteForRequest(parameters)                  -> voteForRequest(parameters, s)

            // Lambda Entrypoints
        |   SetLambda(parameters)                       -> setLambda(parameters, s)

    ]
