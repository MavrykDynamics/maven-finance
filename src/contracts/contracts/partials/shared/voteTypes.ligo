// ------------------------------------------------------------------------------
// Vote Types
// ------------------------------------------------------------------------------

type signersType is set(address)
type actionIdType is (nat)

type addressMapType   is map(string, address);
type stringMapType    is map(string, string);
type natMapType       is map(string, nat);

type voteType is 
        Yay     of unit
    |   Nay     of unit
    |   Pass    of unit