from mavryk.utils.error_reporting import save_error_report

from mavryk.types.treasury_factory.storage import TreasuryFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.treasury_factory.parameter.untrack_treasury import UntrackTreasuryParameter
from dipdup.models import Transaction
import mavryk.models as models

async def untrack_treasury(
    ctx: HandlerContext,
    untrack_treasury: Transaction[UntrackTreasuryParameter, TreasuryFactoryStorage],
) -> None:

    try:
        # Get operation info
        treasury_factory_address    = untrack_treasury.data.target_address
        treasury_address            = untrack_treasury.parameter.__root__
    
        # Update record
        treasury_factory            = await models.TreasuryFactory.get(
            network             = ctx.datasource.network,
            address             = treasury_factory_address
        )
        treasury                    = await models.Treasury.get(
            network = ctx.datasource.network,
            factory = treasury_factory,
            address = treasury_address
        )
        treasury.factory            = None
        await treasury.save()

    except BaseException as e:
        await save_error_report(e)

