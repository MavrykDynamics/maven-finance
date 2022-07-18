
from dipdup.context import HandlerContext
from dipdup.models import Transaction
from mavryk.utils.persisters import persist_governance
from mavryk.types.emergency_governance.parameter.set_governance import SetGovernanceParameter
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
import mavryk.models as models

async def on_emergency_governance_set_governance(
    ctx: HandlerContext,
    set_governance: Transaction[SetGovernanceParameter, EmergencyGovernanceStorage],
) -> None:
    
    # Get operation info
    target_contract = set_governance.data.target_address
    contract        = await models.EmergencyGovernance.get(address = target_contract)

    # Persist new admin
    await persist_governance(set_governance, contract)