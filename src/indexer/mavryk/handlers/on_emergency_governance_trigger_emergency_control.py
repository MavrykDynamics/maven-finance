
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.trigger_emergency_control import TriggerEmergencyControlParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage

async def on_emergency_governance_trigger_emergency_control(
    ctx: HandlerContext,
    trigger_emergency_control: Transaction[TriggerEmergencyControlParameter, EmergencyGovernanceStorage],
) -> None:
    ...