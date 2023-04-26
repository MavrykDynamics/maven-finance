from mavryk.utils.error_reporting import save_error_report

from mavryk.utils.persisters import persist_admin
from mavryk.types.emergency_governance.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
import mavryk.models as models

async def on_emergency_governance_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, EmergencyGovernanceStorage],
) -> None:

    try:    
        # Get operation info
        target_contract = set_admin.data.target_address
        contract        = await models.EmergencyGovernance.get(address = target_contract)
    
        # Persist new admin
        await persist_admin(set_admin, contract)
    except BaseException:
         await save_error_report()

