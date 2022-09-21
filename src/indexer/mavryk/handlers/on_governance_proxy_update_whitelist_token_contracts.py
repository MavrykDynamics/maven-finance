
from dipdup.models import Transaction
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_proxy.parameter.update_whitelist_token_contracts import UpdateWhitelistTokenContractsParameter
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
import mavryk.models as models

async def on_governance_proxy_update_whitelist_token_contracts(
    ctx: HandlerContext,
    update_whitelist_token_contracts: Transaction[UpdateWhitelistTokenContractsParameter, GovernanceProxyStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.GovernanceProxy, models.GovernanceProxyWhitelistTokenContract, update_whitelist_token_contracts, ctx)
