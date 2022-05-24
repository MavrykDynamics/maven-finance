
from mavryk.utils.persisters import persist_admin
from mavryk.types.governance.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, GovernanceStorage],
) -> None:
    
    # Get operation info
    target_contract = set_admin.data.target_address
    contract        = await models.Governance.get(address = target_contract)

    # Persist new admin
    await persist_admin(set_admin, contract)
