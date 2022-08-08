// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./voteTypes.ligo"

// ------------------------------------------------------------------------------
// Vote constants
// ------------------------------------------------------------------------------

const emptyAddressMap  : addressMapType         = map [];
const emptyStringMap : stringMapType            = map [];
const emptyNatMap : natMapType                  = map [];
const emptyTransferList : transferActionType    = list [];

// ------------------------------------------------------------------------------
// Vote helper functions
// ------------------------------------------------------------------------------

function calculateVotingPower(const delegationRatio : nat; const satelliteStakedMvkBalance : nat; const satelliteTotalDelegatedAmount : nat) : nat is
block {
    var totalVotingPower : nat      := 0n;
    var maxTotalVotingPower : nat   := satelliteStakedMvkBalance * 10000n / delegationRatio;
    if delegationRatio = 0n then maxTotalVotingPower := satelliteStakedMvkBalance * 10000n else skip;
    const mvkBalanceAndTotalDelegatedAmount = satelliteStakedMvkBalance + satelliteTotalDelegatedAmount; 
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;
} with(totalVotingPower)
