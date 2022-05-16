
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage
from mavryk.types.mvk.parameter.update_inflation_rate import UpdateInflationRateParameter

async def on_mvk_update_inflation_rate(
    ctx: HandlerContext,
    update_inflation_rate: Transaction[UpdateInflationRateParameter, MvkStorage],
) -> None:
    ...