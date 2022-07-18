
from mavryk.utils.persisters import persist_admin
from mavryk.types.mvk.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.mvk.storage import MvkStorage
import mavryk.models as models

async def on_mvk_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, MvkStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.MVKToken.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)
