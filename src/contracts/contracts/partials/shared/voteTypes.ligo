// ------------------------------------------------------------------------------
// Vote Types
// ------------------------------------------------------------------------------

type actionIdType is (nat)
type voteType is 
        Yay     of unit
    |   Nay     of unit
    |   Pass    of unit
type voterIdentifierType is (actionIdType * address)
type votersType is big_map(voterIdentifierType, voteType)
