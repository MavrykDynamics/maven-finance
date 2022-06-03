
from mavryk.types.emergency_governance.storage import EmergencyGovernanceStorage
from dipdup.models import Transaction
from mavryk.types.emergency_governance.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext

async def on_emergency_governance_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, EmergencyGovernanceStorage],
) -> None:
    ...