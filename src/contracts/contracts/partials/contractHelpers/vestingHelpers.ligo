// ------------------------------------------------------------------------------
//
// Helper Functions Begin
//
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Admin Helper Functions Begin
// ------------------------------------------------------------------------------

// Allowed Senders : Admin, Council Contract
function verifySenderIsCouncilOrAdmin(var s : vestingStorageType) : unit is
block{

    const councilAddress : address = getContractAddressFromGovernanceContract("council", s.governanceAddress, error_COUNCIL_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; councilAddress], error_ONLY_COUNCIL_CONTRACT_OR_ADMINISTRATOR_ALLOWED);

} with (unit)



// Allowed Senders : Admin, Governance Satellite Contract
function verifySenderIsAdminOrGovernanceSatelliteContract(var s : vestingStorageType) : unit is
block{

    const governanceSatelliteAddress : address = getContractAddressFromGovernanceContract("governanceSatellite", s.governanceAddress, error_GOVERNANCE_SATELLITE_CONTRACT_NOT_FOUND);
    verifySenderIsAllowed(set[s.admin; governanceSatelliteAddress], error_ONLY_ADMIN_OR_GOVERNANCE_SATELLITE_CONTRACT_ALLOWED);

} with unit

// ------------------------------------------------------------------------------
// Admin Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Entrypoint Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to mint mvn tokens 
function mintTokens(const to_ : address; const amount_ : nat; const s : vestingStorageType) : operation is
block {

    const mvnTokenAddress : address = s.mvnTokenAddress;
    
    const mintTokenOperation : operation = Mavryk.transaction(
        (to_, amount_),
        0mav,
        getMintEntrypointFromTokenAddress(mvnTokenAddress)
    );

} with mintTokenOperation

// ------------------------------------------------------------------------------
// Entrypoint / General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// General Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to get a vestee's record
function getVesteeRecord(const vesteeAddress : address; const s : vestingStorageType) : vesteeRecordType is 
block {

    const vesteeRecord : vesteeRecordType = case s.vesteeLedger[vesteeAddress] of [ 
        |   Some(_record) -> _record
        |   None          -> failwith(error_VESTEE_NOT_FOUND)
    ];

} with vesteeRecord



// helper function to create a new vestee record
function createVesteeRecord(const vesteeAddress : address; const totalAllocatedAmount : nat; const vestingInMonths : nat; const cliffInMonths : nat; const s : vestingStorageType) : vesteeRecordType is 
block {

    var nextRedemptionTimestamp : timestamp := Mavryk.get_now();
    if cliffInMonths > 0n then {
        nextRedemptionTimestamp := nextRedemptionTimestamp + (cliffInMonths * thirty_days);
    }  else skip;

    const newVesteeRecord : vesteeRecordType = case s.vesteeLedger[vesteeAddress] of [
            Some(_record) -> failwith(error_VESTEE_ALREADY_EXISTS)
        |   None -> record [
            
            // static variables initiated at start ----

            totalAllocatedAmount = totalAllocatedAmount;                          // totalAllocatedAmount should be in (10^9) - MVN Token decimals
            claimAmountPerMonth  = totalAllocatedAmount / vestingInMonths;        // totalAllocatedAmount should be in (10^9) - MVN Token decimals
            
            startTimestamp       = Mavryk.get_now();                              // date/time start of when 

            vestingMonths        = vestingInMonths;                               // number of months of vesting for total allocaed amount
            cliffMonths          = cliffInMonths;                                 // number of months for cliff before vestee can claim

            endCliffDateTime     = Mavryk.get_now() + (cliffInMonths * thirty_days);     // calculate end of cliff duration in timestamp based on dateTimeStart
            
            endVestingDateTime   = Mavryk.get_now() + (vestingInMonths * thirty_days);   // calculate end of vesting duration in timestamp based on dateTimeStart

            // updateable variables on claim ----------

            status                   = "ACTIVE";

            totalRemainder           = totalAllocatedAmount;                      // total amount that is left to be claimed
            totalClaimed             = 0n;                                        // total amount that has been claimed

            monthsClaimed            = 0n;                                        // claimed number of months   
            monthsRemaining          = vestingInMonths;                           // remaining number of months   
            
            nextRedemptionTimestamp  = nextRedemptionTimestamp;                   // timestamp of when vestee will be able to claim again (claim at start of period; if cliff exists, will be the same as end of cliff timestamp)
            lastClaimedTimestamp     = Tezos.get_now();                           // timestamp of when vestee last claimed
        ]
    ];    

} with newVesteeRecord


// helper function to toggle vestee status
function toggleVesteeStatus(const vesteeRecord : vesteeRecordType) : string is 
block {

    var newStatus : string := "newStatus";

    if vesteeRecord.status = "LOCKED" then newStatus := "ACTIVE"
    else newStatus := "LOCKED";

} with newStatus

// ------------------------------------------------------------------------------
// General Helper Functions End
// ------------------------------------------------------------------------------



// ------------------------------------------------------------------------------
// Lambda Helper Functions Begin
// ------------------------------------------------------------------------------

// helper function to unpack and execute entrypoint logic stored as bytes in lambdaLedger
function unpackLambda(const lambdaBytes : bytes; const vestingLambdaAction : vestingLambdaActionType; var s : vestingStorageType) : return is 
block {

    const res : return = case (Bytes.unpack(lambdaBytes) : option(vestingUnpackLambdaFunctionType)) of [
            Some(f) -> f(vestingLambdaAction, s)
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