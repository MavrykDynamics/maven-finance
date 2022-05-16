
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.set_governance import SetGovernanceParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage

async def on_emergency_governance_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, EmergencyGovernanceStorage],
) -> None:
    ...