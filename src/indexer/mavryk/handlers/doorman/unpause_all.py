from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address                         = unpause_all.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network=ctx.datasource.network, address=doorman_address).update(
            stake_paused                    = unpause_all.storage.breakGlassConfig.stakeIsPaused,
            unstake_paused                  = unpause_all.storage.breakGlassConfig.unstakeIsPaused,
            compound_paused                 = unpause_all.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = unpause_all.storage.breakGlassConfig.farmClaimIsPaused,
            deposit_stake_paused   = unpause_all.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            withdraw_stake_paused  = unpause_all.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            liquidate_stake_paused = unpause_all.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

