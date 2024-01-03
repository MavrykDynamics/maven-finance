// ------------------------------------------------------------------------------
// Include Types
// ------------------------------------------------------------------------------

#include "./voteTypes.ligo"

// ------------------------------------------------------------------------------
// Vote helper functions
// ------------------------------------------------------------------------------

function voteHelperCalculateVotingPower(const delegationRatio : nat; const satelliteStakedMvnBalance : nat; const satelliteTotalDelegatedAmount : nat) : nat is
block {
    
    var totalVotingPower     : nat   := 0n;
    var maxTotalVotingPower  : nat   := 0n;

    if delegationRatio = 0n 
    then maxTotalVotingPower := satelliteStakedMvnBalance * 10000n 
    else maxTotalVotingPower := satelliteStakedMvnBalance * 10000n / delegationRatio;
    
    const mvnBalanceAndTotalDelegatedAmount = satelliteStakedMvnBalance + satelliteTotalDelegatedAmount; 
    
    if mvnBalanceAndTotalDelegatedAmount > maxTotalVotingPower 
    then totalVotingPower := maxTotalVotingPower
    else totalVotingPower := mvnBalanceAndTotalDelegatedAmount;

} with(totalVotingPower)
