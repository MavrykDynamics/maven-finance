
from mavryk.utils.persisters import persist_admin
from mavryk.types.break_glass.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.break_glass.storage import BreakGlassStorage
import mavryk.models as models

async def on_break_glass_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, BreakGlassStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.BreakGlass.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)