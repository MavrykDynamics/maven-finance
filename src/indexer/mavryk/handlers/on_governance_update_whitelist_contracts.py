
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.models import Transaction
from mavryk.types.governance.storage import GovernanceStorage
from dipdup.context import HandlerContext
import mavryk.models as models

async def on_governance_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, GovernanceStorage],
) -> None:

    # Persist whitelist contract
    await persist_linked_contract(models.Governance, models.GovernanceWhitelistContract, update_whitelist_contracts)
