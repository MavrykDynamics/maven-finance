from maven.utils.error_reporting import save_error_report

from maven.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from maven.types.treasury_factory.tezos_parameters.pause_all import PauseAllParameter
import maven.models as models

async def pause_all(
    ctx: HandlerContext,
    pause_all: TzktTransaction[PauseAllParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = pause_all.data.target_address
    
        # Update record
        await models.TreasuryFactory.filter(network=ctx.datasource.name.replace('tzkt_',''), address=treasury_factory_address).update(
            create_treasury_paused     = pause_all.storage.breakGlassConfig.createTreasuryIsPaused,
            track_treasury_paused      = pause_all.storage.breakGlassConfig.trackTreasuryIsPaused,
            untrack_treasury_paused    = pause_all.storage.breakGlassConfig.untrackTreasuryIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

