from enum import IntEnum

###
# Enumerators
###

class DexType(IntEnum):
    ADD_LIQUIDITY     = 0
    REMOVE_LIQUIDITY  = 1
    XTZ_TO_TOKEN      = 2
    TOKEN_TO_XTZ      = 3
    TOKEN_TO_TOKEN    = 4

class StakeType(IntEnum):
    STAKE               = 0
    UNSTAKE             = 1
    FARM_CLAIM          = 2
    COMPOUND            = 3
    SATELLITE_REWARD    = 4

class ActionStatus(IntEnum):
    PENDING             = 0
    FLUSHED             = 1
    EXECUTED            = 2

class SatelliteStatus(IntEnum):
    ACTIVE              = 0
    SUSPENDED           = 1
    BANNED              = 2

class GovernanceRoundType(IntEnum):
    PROPOSAL            = 0
    VOTING              = 1
    TIMELOCK            = 2

class GovernanceRecordStatus(IntEnum):
    ACTIVE              = 0
    DROPPED             = 1

class GovernanceVoteType(IntEnum):
    NAY                 = 0
    YAY                 = 1
    PASS                = 2

class TokenType(IntEnum):
    XTZ                 = 0
    FA12                = 1
    FA2                 = 2
    OTHER               = 3

class OracleType(IntEnum):
    CFMM                = 0
    ORACLE              = 1
