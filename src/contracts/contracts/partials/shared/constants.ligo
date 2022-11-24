// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

// fixed point accuracy for calculations - 1e36
const fixedPointAccuracy : nat = 1_000_000_000_000_000_000_000_000_000_000_000_000n // 10^36

// for entries where a default address is required
const zeroAddress : address = ("tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg" : address);

// time constants
const one_day        : int  = 86_400;           // seconds in a day
const thirty_days    : int  = one_day * 30;     // seconds in 30 days