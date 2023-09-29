from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.tezos_storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models.tezos_tzkt import TzktTransaction
from mavryk.types.treasury_factory.tezos_parameters.unpause_all import UnpauseAllParameter
import mavryk.models as models

async def unpause_all(
    ctx: HandlerContext,
    unpause_all: TzktTransaction[UnpauseAllParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = unpause_all.data.target_address
    
        # Update record
        await models.TreasuryFactory.filter(network=ctx.datasource.name.replace('tzkt_',''), address=treasury_factory_address).update(
            create_treasury_paused     = unpause_all.storage.breakGlassConfig.createTreasuryIsPaused,
            track_treasury_paused      = unpause_all.storage.breakGlassConfig.trackTreasuryIsPaused,
            untrack_treasury_paused    = unpause_all.storage.breakGlassConfig.untrackTreasuryIsPaused
        )

    except BaseException as e:
        await save_error_report(e)

