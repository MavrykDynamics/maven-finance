from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.tezos_parameters.unpause_all import UnpauseAllParameter
from mavryk.types.doorman.tezos_storage import DoormanStorage
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address                         = unpause_all.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network=ctx.datasource.name.replace('tzkt_',''), address=doorman_address).update(
            stake_paused                    = unpause_all.storage.breakGlassConfig.stakeIsPaused,
            unstake_paused                  = unpause_all.storage.breakGlassConfig.unstakeIsPaused,
            compound_paused                 = unpause_all.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = unpause_all.storage.breakGlassConfig.farmClaimIsPaused,
            on_vault_deposit_stake_paused   = unpause_all.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            on_vault_withdraw_stake_paused  = unpause_all.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            on_vault_liquidate_stake_paused = unpause_all.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

