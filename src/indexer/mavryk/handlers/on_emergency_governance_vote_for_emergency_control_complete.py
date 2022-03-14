
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from mavryk.types.emergency_governance.parameter.vote_for_emergency_control_complete import VoteForEmergencyControlCompleteParameter

async def on_emergency_governance_vote_for_emergency_control_complete(
    ctx: HandlerContext,
    vote_for_emergency_control_complete: Transaction[VoteForEmergencyControlCompleteParameter, EmergencyGovernanceStorage],
) -> None:
    ...