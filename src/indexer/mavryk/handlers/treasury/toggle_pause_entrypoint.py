from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury.tezos_storage import TreasuryStorage
from mavryk.types.treasury.tezos_parameters.toggle_pause_entrypoint import TogglePauseEntrypointParameter
from dipdup.models.tezos_tzkt import TzktTransaction
from dipdup.context import HandlerContext
import mavryk.models as models

async def toggle_pause_entrypoint(
    ctx: HandlerContext,
    toggle_pause_entrypoint: TzktTransaction[TogglePauseEntrypointParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = toggle_pause_entrypoint.data.target_address
    
        # Update record
        treasury            = await models.Treasury.filter(network=ctx.datasource.network, address=treasury_address).update(
            transfer_paused                 = toggle_pause_entrypoint.storage.breakGlassConfig.transferIsPaused,
            mint_mvk_and_transfer_paused    = toggle_pause_entrypoint.storage.breakGlassConfig.mintMvkAndTransferIsPaused,
            update_token_operators_paused   = toggle_pause_entrypoint.storage.breakGlassConfig.updateTokenOperatorsIsPaused,
            stake_tokens_paused             = toggle_pause_entrypoint.storage.breakGlassConfig.stakeTokensIsPaused,
            unstake_tokens_paused           = toggle_pause_entrypoint.storage.breakGlassConfig.unstakeTokensIsPaused
        )
        await treasury.save()
    except BaseException as e:
        await save_error_report(e)

