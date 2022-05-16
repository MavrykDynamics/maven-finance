
from dipdup.context import HandlerContext
from mavryk.types.emergency_governance.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage

async def on_emergency_governance_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, EmergencyGovernanceStorage],
) -> None:
    ...