
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_admin
from mavryk.types.council.parameter.set_admin import SetAdminParameter
from dipdup.models import Transaction
from mavryk.types.council.storage import CouncilStorage
import mavryk.models as models

async def on_council_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, CouncilStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.Council.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)
