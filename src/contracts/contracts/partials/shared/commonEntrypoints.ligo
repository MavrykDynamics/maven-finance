// Shared Types
#include "./sharedTypes.ligo"

// helper function to %updateGeneralContracts entrypoint on the Governance contract
function getUpdateGeneralContractsEntrypoint(const contractAddress : address) : contract(updateGeneralContractsType) is
    case (Tezos.get_entrypoint_opt(
        "%updateGeneralContracts",
        contractAddress) : option(contract(updateGeneralContractsType))) of [
                Some(contr) -> contr
            |   None        -> (failwith(error_UPDATE_GENERAL_CONTRACTS_ENTRYPOINT_NOT_FOUND) : contract(updateGeneralContractsType))
        ];