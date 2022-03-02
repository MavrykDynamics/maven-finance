
from dipdup.context import HandlerContext
from mavryk.types.farm_factory.parameter.pause_all import PauseAllParameter
from mavryk.types.farm_factory.storage import FarmFactoryStorage
from dipdup.models import Transaction

async def on_farm_factory_pause_all(
    ctx: HandlerContext,
    pause_all: Transaction[PauseAllParameter, FarmFactoryStorage],
) -> None:
    ...