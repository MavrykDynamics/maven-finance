from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.untrack_treasury import UntrackTreasuryParameter
from dipdup.models import Transaction
import mavryk.models as models

async def on_treasury_factory_untrack_treasury(
    ctx: HandlerContext,
    untrack_treasury: Transaction[UntrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_address    = untrack_treasury.parameter.__root__
    
        # Update record
        treasury            = await models.Treasury.get_or_none(
            address = treasury_address
        )
        if treasury:
            treasury.factory        = None
            await treasury.save()

    except BaseException:
         await save_error_report()

