from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
from maven.types.doorman.tezos_storage import DoormanStorage
from maven.types.doorman.tezos_parameters.pause_all import PauseAllParameter
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TzktTransaction[PauseAllParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address                         = pause_all.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network=ctx.datasource.name.replace('mvkt_',''), address=doorman_address).update(
            stake_mvn_paused                    = pause_all.storage.breakGlassConfig.stakeMvnIsPaused,
            unstake_mvn_paused                  = pause_all.storage.breakGlassConfig.unstakeMvnIsPaused,
            compound_paused                 = pause_all.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = pause_all.storage.breakGlassConfig.farmClaimIsPaused,
            on_vault_deposit_stake_paused   = pause_all.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            on_vault_withdraw_stake_paused  = pause_all.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            on_vault_liquidate_stake_paused = pause_all.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

