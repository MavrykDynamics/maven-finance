
from mavryk.types.governance_proxy.parameter.update_whitelist_contracts import UpdateWhitelistContractsParameter
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
from dipdup.models import Transaction
import mavryk.models as models

async def on_governance_proxy_update_whitelist_contracts(
    ctx: HandlerContext,
    update_whitelist_contracts: Transaction[UpdateWhitelistContractsParameter, GovernanceProxyStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.GovernanceProxy, models.GovernanceProxyWhitelistContract, update_whitelist_contracts)