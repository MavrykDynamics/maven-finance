from mavryk.utils.error_reporting import save_error_report

from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.types.doorman.parameter.unpause_all import UnpauseAllParameter
from mavryk.types.doorman.storage import DoormanStorage
import mavryk.models as models

async def on_doorman_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address                         = unpause_all.data.target_address
        doorman                                 = await models.Doorman.get(address=doorman_address)
    
        # Update doorman
        doorman.stake_paused                    = unpause_all.storage.breakGlassConfig.stakeIsPaused
        doorman.unstake_paused                  = unpause_all.storage.breakGlassConfig.unstakeIsPaused
        doorman.compound_paused                 = unpause_all.storage.breakGlassConfig.compoundIsPaused
        doorman.farm_claim_paused               = unpause_all.storage.breakGlassConfig.farmClaimIsPaused
        doorman.on_vault_deposit_stake_paused    = unpause_all.storage.breakGlassConfig.onVaultDepositStakeIsPaused
        doorman.on_vault_withdraw_stake_paused   = unpause_all.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused
        doorman.on_vault_liquidate_stake_paused  = unpause_all.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        await doorman.save()

    except BaseException:
         await save_error_report()

