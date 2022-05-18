
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_admin
from mavryk.types.farm.storage import FarmStorage
from dipdup.models import Transaction
from mavryk.types.farm.parameter.set_admin import SetAdminParameter
import mavryk.models as models

async def on_farm_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, FarmStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.Farm.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)