
from mavryk.types.doorman.parameter.compound import CompoundParameter
from mavryk.types.doorman.storage import DoormanStorage
from dipdup.models import Transaction
from dipdup.context import HandlerContext

async def on_doorman_compound(
    ctx: HandlerContext,
    compound: Transaction[CompoundParameter, DoormanStorage],
) -> None:
    ...