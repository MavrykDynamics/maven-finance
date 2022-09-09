
from dipdup.context import HandlerContext
from mavryk.utils.persisters import persist_linked_contract
from mavryk.types.governance_proxy.parameter.update_general_contracts import UpdateGeneralContractsParameter
from dipdup.models import Transaction
from mavryk.types.governance_proxy.storage import GovernanceProxyStorage
import mavryk.models as models

async def on_governance_proxy_update_general_contracts(
    ctx: HandlerContext,
    update_general_contracts: Transaction[UpdateGeneralContractsParameter, GovernanceProxyStorage],
) -> None:

    # Perists general contract
    await persist_linked_contract(models.GovernanceProxy, models.GovernanceProxyGeneralContract, update_general_contracts)