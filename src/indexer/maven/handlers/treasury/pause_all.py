from maven.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from maven.types.treasury.tezos_parameters.pause_all import PauseAllParameter
from dipdup.models.tezos import TezosTransaction
from maven.types.treasury.tezos_storage import TreasuryStorage
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TezosTransaction[PauseAllParameter, TreasuryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = pause_all.data.target_address
    
        # Update record
        await models.Treasury.filter(network='atlasnet', address=treasury_address).update(
            transfer_paused                 = pause_all.storage.breakGlassConfig.transferIsPaused,
            mint_mvn_and_transfer_paused    = pause_all.storage.breakGlassConfig.mintMvnAndTransferIsPaused,
            update_token_operators_paused   = pause_all.storage.breakGlassConfig.updateTokenOperatorsIsPaused,
            stake_tokens_paused             = pause_all.storage.breakGlassConfig.stakeTokensIsPaused,
            unstake_tokens_paused           = pause_all.storage.breakGlassConfig.unstakeTokensIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

