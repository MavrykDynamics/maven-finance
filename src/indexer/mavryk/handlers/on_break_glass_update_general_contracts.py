
from mavryk.utils.persisters import persist_general_contract
from mavryk.types.break_glass.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, BreakGlassStorage],
) -> None:

    # Perists general contract
    await persist_general_contract(update_general_contracts)