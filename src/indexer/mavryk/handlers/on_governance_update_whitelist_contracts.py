
from mavryk.types.governance.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext

async def on_governance_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, GovernanceStorage],
) -> None:
    ...