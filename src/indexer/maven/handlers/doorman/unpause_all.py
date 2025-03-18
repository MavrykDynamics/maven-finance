from maven.utils.error_reporting import save_error_report

from dipdup.models.tezos import TezosTransaction
from dipdup.context import HandlerContext
from maven.types.doorman.tezos_parameters.unpause_all import UnpauseAllParameter
from maven.types.doorman.tezos_storage import DoormanStorage
from maven import models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TezosTransaction[UnpauseAllParameter, DoormanStorage],
) -> None:

    try:
        # Get doorman contract
        doorman_address                         = unpause_all.data.target_address
    
        # Update doorman
        await models.Doorman.filter(network='atlasnet', address=doorman_address).update(
            stake_mvn_paused                    = unpause_all.storage.breakGlassConfig.stakeMvnIsPaused,
            unstake_mvn_paused                  = unpause_all.storage.breakGlassConfig.unstakeMvnIsPaused,
            compound_paused                 = unpause_all.storage.breakGlassConfig.compoundIsPaused,
            farm_claim_paused               = unpause_all.storage.breakGlassConfig.farmClaimIsPaused,
            on_vault_deposit_stake_paused   = unpause_all.storage.breakGlassConfig.onVaultDepositStakeIsPaused,
            on_vault_withdraw_stake_paused  = unpause_all.storage.breakGlassConfig.onVaultWithdrawStakeIsPaused,
            on_vault_liquidate_stake_paused = unpause_all.storage.breakGlassConfig.onVaultLiquidateStakeIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

