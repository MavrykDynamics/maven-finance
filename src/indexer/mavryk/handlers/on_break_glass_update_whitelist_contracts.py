
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_whitelist_contract
from mavryk.types.break_glass.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage

async def on_break_glass_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, BreakGlassStorage],
) -> None:

    # Persist whitelist contract
    await persist_whitelist_contract(update_whitelist_contracts)