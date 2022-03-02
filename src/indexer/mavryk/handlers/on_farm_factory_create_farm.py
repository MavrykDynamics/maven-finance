
from mavryk.types.farm_factory.parameter.create_farm import CreateFarmParameter
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction

async def on_farm_factory_create_farm(
    ctx: HandlerContext,
    create_farm: Transaction[CreateFarmParameter, FarmFactoryStorage],
) -> None:
    ...