
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.track_farm import TrackFarmParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction

async def on_farm_factory_track_farm(
    ctx: HandlerContext,
    track_farm: Transaction[TrackFarmParameter, FarmFactoryStorage],
) -> None:
    ...