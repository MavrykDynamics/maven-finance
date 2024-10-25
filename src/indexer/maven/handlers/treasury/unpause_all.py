from maven.utils.error_reporting import save_error_report

from maven.types.treasury.tezos_parameters.unpause_all import UnpauseAllParameter
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.treasury.tezos_storage import TreasuryStorage
import maven.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = unpause_all.data.target_address
    
        # Update record
        await models.Treasury.filter(network=ctx.datasource.name.replace('mvkt_',''), address=treasury_address).update(
            transfer_paused                 = unpause_all.storage.breakGlassConfig.transferIsPaused,
            mint_mvn_and_transfer_paused    = unpause_all.storage.breakGlassConfig.mintMvnAndTransferIsPaused,
            update_token_operators_paused   = unpause_all.storage.breakGlassConfig.updateTokenOperatorsIsPaused,
            stake_tokens_paused             = unpause_all.storage.breakGlassConfig.stakeTokensIsPaused,
            unstake_tokens_paused           = unpause_all.storage.breakGlassConfig.unstakeTokensIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

