from maven.utils.error_reporting import save_error_report

from maven.types.doorman.tezos_storage import DoormanStorage
from maven.types.doorman.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven import models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TezosTransaction[TogglePauseEntrypointParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address = toggle_pause_entrypoint.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network='atlasnet', address=doorman_address).update(
            stake_mvn_paused                    = toggle_pause_entrypoint.storage.breakGlassConfig.stakeMvnIsPaused,
            unstake_mvn_paused                  = toggle_pause_entrypoint.storage.breakGlassConfig.unstakeMvnIsPaused,
            compound_paused                 = toggle_pause_entrypoint.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = toggle_pause_entrypoint.storage.breakGlassConfig.farmClaimIsPaused,
            on_vault_deposit_stake_paused   = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            on_vault_withdraw_stake_paused  = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            on_vault_liquidate_stake_paused = toggle_pause_entrypoint.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

