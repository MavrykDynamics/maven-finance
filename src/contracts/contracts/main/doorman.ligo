#include "doormanTypes.ligo"
#include "../partial/doorman/doormanMethods.ligo"

function main (const action : stakeAction; const s : storage) : return is
    case action of
    | Stake(parameters) -> stake(parameters, s)
    | Unstake(parameters) -> unstake(parameters, s)
    | SetContractAdmin(parameters) -> setContractAdmin(parameters, s)
    | SetContractAddress(parameters) -> setContractAddress(parameters, s)
    | SetReserveAddress(parameters) -> setReserveAddress(parameters, s)
    | SetBurnAddress(parameters) -> setBurnAddress(parameters, s)
    | SetVotingContractAddress(parameters) -> setVotingContractAddress(parameters, s)
    end;