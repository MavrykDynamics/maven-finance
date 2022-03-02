
from dipdup.models import Origination
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage

async def on_farm_factory_origination(
    ctx: HandlerContext,
    farm_factory_origination: Origination[FarmFactoryStorage],
) -> None:
    ...