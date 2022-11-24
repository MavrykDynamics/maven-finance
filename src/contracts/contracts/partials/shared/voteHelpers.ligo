// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./voteTypes.ligo"

// ------------------------------------------------------------------------------
// Vote helper functions
// ------------------------------------------------------------------------------

function voteHelperCalculateVotingPower(const delegationRatio : nat; const satelliteStakedMvkBalance : nat; const satelliteTotalDelegatedAmount : nat) : nat is
block {
    
    var totalVotingPower     : nat   := 0n;
    var maxTotalVotingPower  : nat   := 0n;

    if delegationRatio = 0n 
    then maxTotalVotingPower := satelliteStakedMvkBalance * 10000n 
    else maxTotalVotingPower := satelliteStakedMvkBalance * 10000n / delegationRatio;
    
    const mvkBalanceAndTotalDelegatedAmount = satelliteStakedMvkBalance + satelliteTotalDelegatedAmount; 
    
    if mvkBalanceAndTotalDelegatedAmount > maxTotalVotingPower 
    then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvkBalanceAndTotalDelegatedAmount;

} with(totalVotingPower)
