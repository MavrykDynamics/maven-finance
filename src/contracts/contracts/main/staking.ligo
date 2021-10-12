#include "../partial/staking/stakingMethods.ligo"

function main (const action : stakeAction; const s : storage) : return is
    case action of
    | CreateStakingOpt(parameters) -> createStakingOption(parameters, s)
    | StakeLocked(parameters) -> stakingLock(parameters, s)
    | StakeFlexed(parameters) -> stakingFlex(parameters, s)
    | UnstakeLocked(parameters) -> unstakeLock(parameters, s)
    | UnstakeFlexed(parameters) -> unstakeFlex(parameters, s)
    | ClaimRewardFlexed(parameters) -> claimRewardFlex(parameters, s)
    | SetMaxValue(parameters) -> setMaxVal(parameters, s)
    | SetContract(parameters) -> setContractA(parameters, s)
    | SetReserve(parameters) -> setReserve(parameters, s)
    end;