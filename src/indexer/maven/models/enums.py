from enum import IntEnum

###
# Enumerators
###

class MintOrBurnType(IntEnum):
    MINT                            = 0
    BURN                            = 1

class DexType(IntEnum):
    ADD_LIQUIDITY                   = 0
    REMOVE_LIQUIDITY                = 1
    MVRK_TO_TOKEN                    = 2
    TOKEN_TO_MVRK                    = 3
    TOKEN_TO_TOKEN                  = 4
    DEFAULT                         = 5

class StakeType(IntEnum):
    STAKE                           = 0
    UNSTAKE                         = 1
    FARM_CLAIM                      = 2
    COMPOUND                        = 3
    SATELLITE_REWARD                = 4
    VAULT_DEPOSIT_STAKED_TOKEN      = 5
    VAULT_WITHDRAW_STAKED_TOKEN     = 6
    VAULT_LIQUIDATE_STAKED_TOKEN    = 7
    EXIT                            = 8

class ActionStatus(IntEnum):
    PENDING                         = 0
    FLUSHED                         = 1
    EXECUTED                        = 2

class SatelliteStatus(IntEnum):
    ACTIVE                          = 0
    SUSPENDED                       = 1
    BANNED                          = 2

class GovernanceRoundType(IntEnum):
    PROPOSAL                        = 0
    VOTING                          = 1
    TIMELOCK                        = 2

class GovernanceActionStatus(IntEnum):
    ACTIVE                          = 0
    DROPPED                         = 1

class GovernanceVoteType(IntEnum):
    NAY                             = 0
    YAY                             = 1
    PASS                            = 2

class TokenType(IntEnum):
    MVRK                             = 0
    FA12                            = 1
    FA2                             = 2
    OTHER                           = 3

class RewardType(IntEnum):
    MVRK                             = 0
    SMVN                            = 1

class VaultAllowance(IntEnum):
    ANY                             = 0
    WHITELIST                       = 1

class LendingControllerOperationType(IntEnum):
    ADD_LIQUIDITY                   = 0
    REMOVE_LIQUIDITY                = 1
    BORROW                          = 2
    REPAY                           = 3
    DEPOSIT                         = 4
    WITHDRAW                        = 5
    DEPOSIT_STAKED_TOKEN            = 6
    WITHDRAW_STAKED_TOKEN           = 7
    VAULT_CREATION                  = 8
    MARK_FOR_LIQUIDATION            = 9
    LIQUIDATE_VAULT                 = 10
    CLOSE_VAULT                     = 11

class MTokenOperationType(IntEnum):
    TRANSFER                        = 0
    MINT_OR_BURN                    = 1
