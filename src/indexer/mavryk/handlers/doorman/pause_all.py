from mavryk.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.tezos_storage import DoormanStorage
from mavryk.types.doorman.tezos_parameters.pause_all import PauseAllParameter
import mavryk.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TzktTransaction[PauseAllParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address                         = pause_all.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network=ctx.datasource.network, address=doorman_address).update(
            stake_paused                    = pause_all.storage.breakGlassConfig.stakeIsPaused,
            unstake_paused                  = pause_all.storage.breakGlassConfig.unstakeIsPaused,
            compound_paused                 = pause_all.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = pause_all.storage.breakGlassConfig.farmClaimIsPaused,
            deposit_stake_paused   = pause_all.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            withdraw_stake_paused  = pause_all.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            liquidate_stake_paused = pause_all.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

