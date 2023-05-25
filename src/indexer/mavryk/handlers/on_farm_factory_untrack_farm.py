from mavryk.utils.error_reporting import save_error_report

from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction
from mavryk.types.farm_factory.parameter.untrack_farm import UntrackFarmParameter
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_farm_factory_untrack_farm(
    ctx: HandlerContext,
    untrack_farm: Transaction[UntrackFarmParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_address    = untrack_farm.parameter.__root__
    
        # Update record
        farm            = await models.Farm.get_or_none(
            network = ctx.datasource.network,
            address = farm_address
        )
        if farm:    
            farm.factory    = None
            await farm.save()

    except BaseException as e:
         await save_error_report(e)

