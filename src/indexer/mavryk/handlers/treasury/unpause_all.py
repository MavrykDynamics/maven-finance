from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury.parameter.unpause_all import UnpauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.treasury.storage import TreasuryStorage
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = unpause_all.data.target_address
    
        # Update record
        await models.Treasury.filter(network=ctx.datasource.network, address=treasury_address).update(
            transfer_paused                 = unpause_all.storage.breakGlassConfig.transferIsPaused,
            mint_mvk_and_transfer_paused    = unpause_all.storage.breakGlassConfig.mintMvkAndTransferIsPaused,
            update_token_operators_paused   = unpause_all.storage.breakGlassConfig.updateTokenOperatorsIsPaused,
            stake_tokens_paused             = unpause_all.storage.breakGlassConfig.stakeTokensIsPaused,
            unstake_tokens_paused           = unpause_all.storage.breakGlassConfig.unstakeTokensIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

