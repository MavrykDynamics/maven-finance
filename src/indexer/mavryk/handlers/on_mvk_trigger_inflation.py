
from dipdup.context import HandlerContext
from mavryk.types.mvk.parameter.trigger_inflation import TriggerInflationParameter
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage

async def on_mvk_trigger_inflation(
    ctx: HandlerContext,
    trigger_inflation: Transaction[TriggerInflationParameter, MvkStorage],
) -> None:
    ...