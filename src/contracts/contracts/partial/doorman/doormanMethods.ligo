#include "doormanTypes.ligo"

// contract admin address
function setAdmin(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.admin := parameters;
} with (noOperations, s)