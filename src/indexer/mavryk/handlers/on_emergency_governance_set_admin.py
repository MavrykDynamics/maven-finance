
from mavryk.types.emergency_governance.parameter.set_admin import SetAdminParameter
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage

async def on_emergency_governance_set_admin(
    ctx: HandlerContext,
    set_admin: Transaction[SetAdminParameter, EmergencyGovernanceStorage],
) -> None:
    ...