from mavryk.utils.error_reporting import save_error_report

from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.break_glass.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, BreakGlassStorage],
) -> None:

    try:
        # Persist whitelist contract
        await persist_linked_contract(models.BreakGlass, models.BreakGlassWhitelistContract, update_whitelist_contracts)
    except BaseException as e:
         await save_error_report(e)

