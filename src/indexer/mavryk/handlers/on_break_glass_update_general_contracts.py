
from mavryk.types.break_glass.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, BreakGlassStorage],
) -> None:
    ...