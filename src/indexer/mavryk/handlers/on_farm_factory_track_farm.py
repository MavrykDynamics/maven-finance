from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.track_farm import TrackFarmParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction, Contract
import mavryk.models as models

async def on_farm_factory_track_farm(
    ctx: HandlerContext,
    track_farm: Transaction[TrackFarmParameter, FarmFactoryStorage],
) -> None:

    try:
        # Get operation info
        farm_address            = track_farm.parameter.__root__
        farm_factory_address    = track_farm.data.target_address
    
        # Update record
        farm_factory    = await models.FarmFactory.get(
            address = farm_factory_address
        )
        farm            = await models.Farm.get_or_none(
            address = farm_address
        )
        if farm:
            farm.factory    = farm_factory
            await farm.save()

    except BaseException as e:
         await save_error_report(e)

