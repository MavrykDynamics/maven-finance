
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.drop_emergency_governance import DropEmergencyGovernanceParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage

async def on_emergency_governance_drop_emergency_governance(
    ctx: HandlerContext,
    drop_emergency_governance: Transaction[DropEmergencyGovernanceParameter, EmergencyGovernanceStorage],
) -> None:
    ...