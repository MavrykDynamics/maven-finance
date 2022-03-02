
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.unpause_all import UnpauseAllParameter
from dipdup.models import Transaction

async def on_farm_factory_unpause_all(
    ctx: HandlerContext,
    unpause_all: Transaction[UnpauseAllParameter, FarmFactoryStorage],
) -> None:
    ...