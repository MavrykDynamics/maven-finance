from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.parameter.track_treasury import TrackTreasuryParameter
from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_track_treasury(
    ctx: HandlerContext,
    track_treasury: Transaction[TrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address            = track_treasury.parameter.__root__
        treasury_factory_address    = track_treasury.data.target_address
    
        # Update record
        treasury_factory    = await models.TreasuryFactory.get(
            address = treasury_factory_address
        )
        treasury            = await models.Treasury.get_or_none(
            address = treasury_address
        )
        if treasury:
            treasury.factory        = treasury_factory
            await treasury.save()

    except BaseException:
         await save_error_report()

